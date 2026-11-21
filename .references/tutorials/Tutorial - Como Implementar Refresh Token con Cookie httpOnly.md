# Tutorial - Como Implementar Refresh Token con Cookie httpOnly

Guía para que un usuario no tenga que volver a iniciar sesión con Google cada vez que vence su token de acceso, usando un **refresh token** en una **cookie `httpOnly`**. Cubre el diseño, el backend (NestJS) y el front (Astro), y el orden de despliegue.

- **Proyecto de referencia:** Mejorándome (front Astro + backend NestJS, mismo origen)
- **Fecha:** 2026-11-21
- **Estado:** implementado y desplegado. El backend está verificado en producción. **La renovación automática con el front real aún no se ha observado de punta a punta** (el access token dura 1 h y la prueba estaba en curso al escribir esto; ver sección 9).
- **Convención:** `[VERIFICADO]` = se vio funcionar. `[NO VERIFICADO]` = pendiente de comprobar.
- **Relacionado:** `Tutorial - Como Publicar App en GCP Console.md`, contrato `.references/from-backend/2026.11.21-auth-refresh-endpoints.md`, y el tutorial de despliegue del backend en `mejorandome-back/.references/tutorials/`.

---

## 1. El problema

El login usa Google Identity Services (ID token). El backend verificaba ese token y emitía su propio JWT de sesión con vida de **7 días**.

Síntoma: pasados los 7 días, todas las peticiones daban `401`, pero el dashboard seguía mostrando "Conectado" con la cuenta de Google. F5 no ayudaba. Solo cerrar sesión y volver a entrar lo arreglaba.

Causas, ambas en el front:
- La sesión se daba por válida solo porque había un token en `localStorage`.
- Nadie manejaba el `401`: el error se quedaba en un `console.warn`.

## 2. Decisión de diseño

| Opción | Ventaja | Inconveniente |
|---|---|---|
| Solo manejar el 401 (volver a pedir login) | Cambio mínimo, solo front | El usuario vuelve a iniciar sesión cada vida del token |
| **Access token corto + refresh token** | Sesión larga sin exponer un token de larga vida | Requiere backend, tabla nueva y despliegue coordinado |

Se hicieron las dos cosas, en ese orden: primero el manejo del 401 (necesario siempre, porque un refresh token también puede vencer o revocarse) y después el refresh.

**Dónde guardar el refresh token:**
- **Cookie `httpOnly` (elegida):** JavaScript no puede leerla, así que un XSS no la roba. Solo es viable porque front y API comparten **origen** (`https://hiram-oci-mty.duckdns.org`).
- `localStorage`: más simple, pero legible por cualquier script de la página. Se descartó.

## 3. Diseño final

| Elemento | Valor |
|---|---|
| Access token | JWT, **1 h** (`JWT_EXPIRES_IN=1h`) |
| Refresh token | Opaco (32 bytes aleatorios, base64url), 30 días (`REFRESH_TOKEN_TTL_DAYS`) |
| Almacenamiento en BD | Solo el **hash SHA-256**, tabla `refresh_tokens`, agrupado por `familyId` |
| Transporte | Cookie `mejorandome_rt`: `HttpOnly; Secure; SameSite=Strict; Path=/mejorandome-back/v1/api/auth` |
| Rotación | Cada `POST /auth/refresh` invalida el token usado y emite uno nuevo en la misma familia |
| Reutilización | Un token ya rotado revoca **toda su familia** (`REFRESH_TOKEN_REUSED`) |
| Gracia | 10 s: un token recién rotado reenviado (dos pestañas) da `REFRESH_TOKEN_INVALID` sin revocar la familia |
| Retrocompatibilidad | Flag `REFRESH_TOKENS_ENABLED` (por defecto `false`) |

### Endpoints
- `POST /auth/google`: igual que antes; con el flag activo añade `Set-Cookie`.
- `POST /auth/refresh`: sin body, lee la cookie. Devuelve el mismo shape que el login y una cookie rotada. `404` si el flag está apagado.
- `POST /auth/logout`: `204`, revoca la familia y borra la cookie. Idempotente.

### Códigos de error 401
Todos los 401 de auth llevan `code`:

| `code` | Acción del front |
|---|---|
| `ACCESS_TOKEN_EXPIRED` | Refrescar y reintentar la petición **una vez** |
| `ACCESS_TOKEN_INVALID` | Cerrar sesión local y pedir login (no refrescar) |
| `REFRESH_TOKEN_MISSING` / `INVALID` / `REUSED` | Cerrar sesión local y pedir login |

El backend envía los `code` del access token **siempre**, con el flag activo o no.

## 4. Backend (resumen)

- Migración Prisma que crea `refresh_tokens` (`userId`, `familyId`, `tokenHash` único, `expiresAt`, `revokedAt`, `replacedById`, `userAgent`).
- Servicio que emite, rota y revoca; `cookie-parser` para leer la cookie.
- El `Path` de la cookie sale de `REFRESH_COOKIE_PATH` y **no depende de Nginx**: Nest solo ve `/api/...` porque Nginx quita `/mejorandome-back/v1`, así que el path público debe fijarse explícitamente. El valor por defecto (`/api/auth`) en producción **no coincide** y la cookie nunca viajaría.
- `Secure` depende de `NODE_ENV=production`, no de `req.secure`, porque detrás de Nginx Nest ve HTTP.
- Variables nuevas: `REFRESH_TOKENS_ENABLED`, `REFRESH_TOKEN_TTL_DAYS`, `REFRESH_COOKIE_PATH`; y `JWT_EXPIRES_IN` pasa de `7d` a `1h`.

## 5. Front

### 5.1 Un punto central en el cliente HTTP (`src/services/api.client.ts`)
`apiRequest` maneja la sesión para todas las llamadas con token:

1. Envía la petición con el **token vigente** guardado, no el que capturó el componente (los componentes guardan el token una sola vez al cargar y queda obsoleto tras un refresh).
2. Si responde `401` con `ACCESS_TOKEN_EXPIRED`, pide un token nuevo y **reintenta una sola vez**.
3. Si el refresh falla, el código es `ACCESS_TOKEN_INVALID`, o el reintento vuelve a dar 401, **cierra la sesión** (sin bucle).
4. Las peticiones sin token (el login) no tocan nada de esto: un 401 ahí significa credenciales inválidas, no sesión vencida.

### 5.2 Refresh serializado (`src/services/auth.service.ts`)
- Un solo `POST /auth/refresh` en vuelo: las demás peticiones esperan su resultado.
- Antes de refrescar, si el token guardado ya cambió (otra petición o pestaña refrescó), se reutiliza en vez de pedir otro. Esto evita gastar la rotación y caer en `REFRESH_TOKEN_INVALID`.
- Solo `ApiClientError` (401/404 del refresh) cuenta como "sin refresh". Un error de red **no** cierra la sesión.
- `logout()` llama a `POST /auth/logout` (revoca en servidor) y borra la sesión local aunque esa llamada falle.

### 5.3 Aviso al usuario (`src/utils/auth-client.ts`)
Al cerrarse la sesión se muestra "Tu sesión expiró. Inicia sesión de nuevo con Google." y la interfaz pasa a invitado (el dashboard muestra la vista de iniciar sesión).

### 5.4 Cosas que NO se hacen en el front
- No se lee ni se guarda el refresh token: es `httpOnly`.
- No se usa `credentials: 'include'`: es mismo origen, basta el valor por defecto (`same-origin`).
- No se comprueba la fecha `exp` del JWT al cargar. Con tokens de 1 h, que el token esté vencido al abrir la página es lo normal, no un fallo: comprobarlo cerraría la sesión sin intentar el refresh. Se probó primero y se **revirtió** por esto.

## 6. Pruebas del front con `fetch` simulado `[VERIFICADO]`
Se simuló `fetch` y los manejadores de sesión con 8 escenarios, todos correctos:
1. Refresh exitoso y un reintento.
2. Refresh que falla → cierra sesión y lanza el 401.
3. Tres peticiones concurrentes → un solo refresh.
4. Token obsoleto del llamador → usa el vigente sin refrescar.
5. `ACCESS_TOKEN_INVALID` → sin refresh, cierra sesión.
6. Caída de red → no cierra la sesión.
7. 401 sin token (login) → no cierra la sesión.
8. El reintento también da 401 → cierra sesión, sin bucle.

## 7. Nginx
Se revisó en solo lectura (el agente del VPS): **no hay** `proxy_hide_header Set-Cookie`, `proxy_ignore_headers Set-Cookie`, `proxy_cookie_path`, `proxy_cookie_domain` ni `proxy_cache`; `proxy_pass` lleva barra final (quita `/mejorandome-back/v1`) y manda `X-Forwarded-Proto`. **No hizo falta tocar Nginx.** Si algún día se filtra `Set-Cookie`, la cookie no llegaría y fallaría sin error claro.

## 8. Orden de despliegue
Gracias al flag, front y backend se pueden desplegar en cualquier orden, pero este es el seguro:

1. Desplegar el **front** (`npm run build:prod` y copiar `dist/`). Sin backend con refresh, un 404 en `/auth/refresh` se trata como "sin refresh" y pide login.
2. Desplegar el **backend con el flag apagado**: aplicar la migración (`prisma migrate deploy`) y fijar `NODE_ENV=production`, `REFRESH_TOKEN_TTL_DAYS`, `REFRESH_COOKIE_PATH`. La migración estaba escrita a mano: probarla antes en un entorno no productivo.
3. Comprobar la cookie sin activar nada:
   ```
   curl -i -X POST https://hiram-oci-mty.duckdns.org/mejorandome-back/v1/api/auth/logout
   ```
   Debe responder `204` con `Set-Cookie` con `HttpOnly; Secure; SameSite=Strict; Path=/mejorandome-back/v1/api/auth` y `Expires` de 1970.
4. Activar `REFRESH_TOKENS_ENABLED=true` y `JWT_EXPIRES_IN=1h`, y reiniciar con las variables nuevas (`pm2 restart --update-env`).
5. Cerrar sesión, volver a entrar y comprobar en DevTools → Application → Cookies que existe `mejorandome_rt`.

## 9. Verificación en producción

| Comprobación | Estado |
|---|---|
| `logout` devuelve 204 con `Set-Cookie` correcto | `[VERIFICADO]` |
| `refresh` sin cookie → `401 REFRESH_TOKEN_MISSING` (flag activo) | `[VERIFICADO]` |
| `me` sin token → `401 ACCESS_TOKEN_INVALID` | `[VERIFICADO]` |
| El login emite `mejorandome_rt` con atributos correctos y 30 días | `[VERIFICADO]` |
| Prueba del flujo de login con el front nuevo | `[VERIFICADO]` |
| **El front renueva solo al vencer el access token de 1 h** | `[NO VERIFICADO]` (prueba de una hora en curso) |

Cómo comprobar la renovación: con la sesión abierta, esperar una hora y recargar. En DevTools → Network debe verse un `401 ACCESS_TOKEN_EXPIRED`, luego `POST auth/refresh` con `200` y después la petición original reintentada con `200`, sin aviso de sesión expirada. Si falla, anotar el `code` y el status exactos de `auth/refresh`. Para probarlo más rápido se puede bajar `JWT_EXPIRES_IN` a `2m` de forma temporal en producción y devolverlo a `1h`.

## 10. Limitaciones y aprendizajes

- **Desarrollo local:** con el front en `localhost:4321` y la API en otro puerto, es cross-origin y la cookie `SameSite=Strict` no viaja. Probar el refresh en local requiere un proxy de desarrollo (Astro/Vite) que sirva la API bajo el mismo origen. No se recomienda `SameSite=None`.
- **Usuarios con sesión previa:** quienes iniciaron sesión antes de activar el refresh no tienen cookie. Al vencer su token verán "Tu sesión expiró" una vez y, tras volver a entrar, ya tendrán refresh.
- **Pestañas múltiples:** la gracia de 10 s del backend tolera dos refresh casi simultáneos. El front reutiliza el token ya renovado en `localStorage` para no provocarlos.
- **Pendiente en el backend:** no hay purga periódica de refresh tokens vencidos o revocados (se dejó fuera por YAGNI).
- **Más sesiones, más tokens:** cada dispositivo es una familia distinta, así que revocar una no cierra las otras.

## 11. Plantilla rápida para otros proyectos

1. Hacer primero el manejo del 401 en el cliente HTTP (cerrar sesión y avisar).
2. Acordar el contrato con el backend: endpoints `refresh` y `logout`, códigos de error `code` en los 401, y flag de activación.
3. Backend: access token corto, refresh opaco hasheado en BD, rotación por familia, cookie `httpOnly` con `Path` explícito y `Secure` fijado por entorno.
4. Verificar que el proxy no filtre `Set-Cookie`.
5. Front: refresh serializado, un solo reintento, usar el token vigente y no el capturado, y no cerrar sesión por errores de red.
6. Desplegar con el flag apagado, comprobar la cookie con `curl`, activar y probar el ciclo completo.
