# Tutorial - Como Publicar App en GCP Console

Guía para pasar una app de Google Sign-In del estado de publicación **Prueba** a **En producción**, de modo que cualquier cuenta de Google pueda iniciar sesión.

- **Proyecto de referencia:** Mejorándome (Astro + NestJS)
- **Fecha:** 2026-11-21
- **Resultado:** completado. La app quedó **En producción** y se probó el inicio de sesión con una cuenta ajena en ventana de incógnito.
- **Convención:** `[VERIFICADO]` = se ejecutó y se vio en pantalla. `[NO VERIFICADO]` = no se comprobó directamente.

> Los pasos de este tutorial salen de lo ejecutado en Mejorándome. Antes de empezar se consultó a otros proyectos: Logrando Studio y OpenMontage. Logrando Studio no lo había hecho. OpenMontage sí (`deviatips-publisher`, 2026-09-22, ver `C:\github-projects\OpenMontage\CHANNEL_LOG.md`, Session 7) y su experiencia coincidió con la de este proyecto.

---

## 0. Cuándo aplica

Aplica cuando la app **solo usa Google para iniciar sesión** (`openid`, `email`, `profile`), que son scopes no sensibles. En ese caso no hace falta verificación de Google.

Google pide enviar la app a verificación si se cumple **cualquiera** de estas condiciones (texto del diálogo de confirmación):
- La configuración tiene **más de 10 dominios**.
- Se sube un **logotipo**.
- Se solicitan **permisos sensibles o restringidos** (YouTube, Drive, Gmail, etc.).

Si la app pide scopes sensibles, este tutorial no basta.

## 1. Arquitectura del proyecto de referencia

| Pieza | Valor |
|---|---|
| Flujo | Google Identity Services (botón/One Tap) con **ID token** |
| Dominio (front y back) | `hiram-oci-mty.duckdns.org` (VPS en Oracle Cloud con Nginx y SSL) |
| Front | Astro, estático: `https://hiram-oci-mty.duckdns.org/mejorandome-front/` |
| Back | NestJS: `https://hiram-oci-mty.duckdns.org/mejorandome-back/v1/api` |
| Validación en el back | `google-auth-library` (`verifyIdToken`, audience = `GOOGLE_CLIENT_ID`) |
| Client secret / redirect URIs | No se usan |
| Scopes | `openid`, `email`, `profile` |

Con este flujo, en el OAuth client solo importan los **Authorized JavaScript origins** (sin path).

## 2. Checklist previo

Para que el botón **Publicar app** se habilite, Google pide:
- [x] Página principal de la aplicación (URL pública).
- [x] Vínculo a la Política de Privacidad (URL pública).
- [x] Vínculo a las Condiciones del Servicio (URL pública).
- [x] Dominio autorizado.

Recomendado:
- [x] Correo de asistencia y correo de contacto del desarrollador.
- [x] **Sin logotipo** (subirlo obliga a verificar).
- [x] Las tres URLs responden 200 en producción **antes** de pegarlas en Google.
- [x] El backend acepta el origen del front en `CORS_ORIGIN` y su `GOOGLE_CLIENT_ID` coincide con el del front.

## 3. Pasos

### Paso 1 — Revisar el estado inicial `[VERIFICADO]`
Google Cloud Console → proyecto de la app → **Google Auth Platform**.

Estado encontrado: nombre y correo de asistencia configurados; **sin logotipo y sin dominios**; en **Público**, el botón **Publicar app deshabilitado**.

### Paso 2 — Crear las páginas legales en el front `[VERIFICADO]`
La app no tenía Política de Privacidad ni Condiciones del servicio. Se crearon como páginas estáticas públicas, sin sesión y sin depender de JavaScript:

- `src/pages/privacidad.astro` y `src/pages/terminos.astro`
- `src/layouts/LegalLayout.astro` (layout compartido)
- `src/components/ui/Footer.astro` (pie con enlaces legales visibles desde la home)

La política de privacidad debe cubrir:
- Qué datos de Google se reciben (correo, nombre, foto) y para qué se usan.
- Qué datos propios de la app se almacenan (aquí, datos de salud).
- La declaración de **uso limitado de los datos de Google**, enlazando la *Google API Services User Data Policy*.
- Cómo solicitar la eliminación de datos y un correo de contacto.

URLs finales:
- Principal: `https://hiram-oci-mty.duckdns.org/mejorandome-front/`
- Privacidad: `https://hiram-oci-mty.duckdns.org/mejorandome-front/privacidad/`
- Términos: `https://hiram-oci-mty.duckdns.org/mejorandome-front/terminos/`

Despliegue: `npm run build:prod` y copiar `dist/` al VPS. Las tres URLs respondieron **200**.

Notas:
- En desarrollo, por el `base` de Astro, las rutas cuelgan de `/mejorandome-front/` (`http://localhost:4321/mejorandome-front/privacidad`). Entrar a `/privacidad` sin el prefijo da 404.
- Se actualizó `site` en `astro.config.mjs` al dominio real.

### Paso 3 — Información de la marca (Branding) `[VERIFICADO]`
Google Auth Platform → **Información de la marca**.

| Campo | Valor |
|---|---|
| Nombre de la aplicación | `mejorandome` |
| Correo de asistencia | correo del dueño |
| Logotipo | **vacío** |
| Página principal | `https://hiram-oci-mty.duckdns.org/mejorandome-front/` |
| Política de privacidad | `https://hiram-oci-mty.duckdns.org/mejorandome-front/privacidad/` |
| Condiciones del servicio | `https://hiram-oci-mty.duckdns.org/mejorandome-front/terminos/` |
| Dominios autorizados | `hiram-oci-mty.duckdns.org` |
| Contacto del desarrollador | correo del dueño |

Resultado: se guardó **sin errores ni advertencias**. Al guardar, el botón **Publicar app** pasó a habilitado.

### Paso 4 — Verificación del dominio en Search Console `[NO FUE NECESARIO]`
Google aceptó un subdominio gratuito de `duckdns.org` como dominio autorizado, y se pudo publicar **sin verificar el dominio en Search Console**. OpenMontage tuvo el mismo resultado con `github.io`.

### Paso 5 — Revisar Acceso a los datos (Data Access) `[VERIFICADO]`
Con solo `openid`, `email` y `profile`, la sección **Acceso a los datos** muestra **0 filas** en todas las pestañas. Es lo esperado: Google Identity Services usa esos scopes por defecto y no hace falta declararlos. Que no haya scopes sensibles ni restringidos es lo que evita la verificación.

### Paso 6 — Publicar la app `[VERIFICADO]`
Google Auth Platform → **Público** → **Publicar app** → confirmar.

Texto del diálogo: *"Tu app estará disponible para cualquier usuario que tenga una Cuenta de Google. Si la configuración de tu app tiene más de 10 dominios, un logotipo o solicita permisos sensibles o restringidos, deberás enviarla para verificarla."*

Como la app tenía un dominio, ningún logotipo y solo scopes básicos, se confirmó sin enviar a verificación. El estado cambió a **En producción**.

### Paso 7 — Prueba con una cuenta ajena `[VERIFICADO]`
En ventana de incógnito, con una cuenta de Gmail que **no era tester**, se inició sesión en la app sin problema.

### Paso 8 — Authorized JavaScript origins y backend `[VERIFICADO INDIRECTAMENTE]`
No se modificó el OAuth client ni el backend. Que el inicio de sesión funcionara desde el dominio de producción confirma que el origen del front y la configuración CORS/`GOOGLE_CLIENT_ID` del backend ya eran correctos.

Pendiente de revisión directa: confirmar en **Clientes** que `http://localhost:4321` sigue registrado para desarrollo. `[NO VERIFICADO]`

## 4. Qué cambia al publicar

- **No hubo cambios de código** por pasar de Prueba a En producción.
- Antes: solo los test users podían entrar. Ahora: **cualquier cuenta de Google puede registrarse y crear datos**. El backend no tiene lista blanca; el único filtro era el estado Prueba de GCP.
- Los refresh tokens de Prueba caducan a los 7 días, pero este flujo no los usa: la sesión depende del JWT propio del backend (7 días por defecto).

## 5. Problemas y aprendizajes

- **404 al revisar en local:** por el `base` de Astro, las rutas cuelgan de `/mejorandome-front/`.
- **Botón "Publicar app" deshabilitado:** se habilita al completar la página principal, privacidad, términos y dominio autorizado en Información de la marca.
- **Logotipo:** no subirlo. Con logo, Google exige verificación al salir de Prueba.
- **Dominios gratuitos:** `duckdns.org` y `github.io` fueron aceptados como dominio autorizado, sin verificación en Search Console. Google podría cambiar este comportamiento.
- **Datos sensibles de salud:** publicar abre el registro a cualquier persona. Conviene que la política de privacidad sea clara y que exista una vía para pedir la eliminación de datos.
- **Aviso "app no verificada":** no apareció en la prueba con scopes básicos.
- **Aún no probado:** qué ocurre si la cuenta de otro usuario tiene restricciones de Workspace, y cuánto tarda Google en reflejar cambios de Branding.

## 6. Plantilla rápida para otros proyectos

1. Confirmar que solo se usan scopes no sensibles.
2. Crear y desplegar páginas públicas de inicio, privacidad y términos; comprobar que respondan 200.
3. Branding: nombre, correo de asistencia, las tres URLs, dominio autorizado, contacto. **Sin logotipo.**
4. Revisar que **Acceso a los datos** no tenga scopes sensibles.
5. **Público → Publicar app → Confirmar.**
6. Probar con una cuenta ajena en incógnito.
