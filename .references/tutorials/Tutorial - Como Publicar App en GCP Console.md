# Tutorial - Como Publicar App en GCP Console

Guía para pasar una app de Google Sign-In de modo **Testing** a **In production** (cualquier cuenta de Google puede iniciar sesión).

- **Proyecto de referencia:** Mejorándome (Astro + NestJS)
- **Fecha de inicio:** 2026-11-21
- **Estado del tutorial:** en construcción. Cada paso se marca como `[VERIFICADO]` solo cuando se ejecutó y se vio en pantalla; si no, `[PENDIENTE]`.

> Antecedente: el proyecto OpenMontage (`deviatips-publisher`, scope sensible `youtube.upload`) ya pasó de Prueba a Producción el 2026-09-22. Su registro está en `C:\github-projects\OpenMontage\CHANNEL_LOG.md` (Session 7). Lo que sigue marcado como "evidencia OpenMontage" viene de ese log y **no está verificado en este proyecto**. Logrando Studio no tiene registro de haberlo hecho.

### Evidencia OpenMontage (a contrastar con lo que veamos en pantalla)
- Ruta usada: Google Auth Platform → **Información de la marca** (página principal, `/privacy/`, `/terms/`; las tres URLs debían responder 200) → **Dominios autorizados** → Guardar → **Público** → **Publicar app**.
- El botón "Publicar app" estaba **deshabilitado** hasta llenar **Dominios autorizados**. La consola mostraba "Falta el dominio ..." y eso fue lo único obligatorio que faltaba.
- Dominio usado: `justlearningmx.github.io` (subdominio compartido). Google lo aceptó. En el log no consta que se verificara en Search Console.
- No hay evidencia de que se haya probado `duckdns.org` como dominio autorizado.
- Con **logo** subido, Google indica que al salir de Prueba hay que enviar la app a verificación. Quitar el logo evita esa revisión.
- Una app publicada con scopes sensibles y sin verificar muestra "Google no ha verificado esta app". Con `openid/email/profile` esto no debería aplicar (por confirmar).
- Publicar no cura refresh tokens emitidos en Prueba (no aplica a este proyecto, que usa ID token).
- Más de 100 usuarios o usuarios ajenos con scopes sensibles exige verificación completa (no probado).

---

## 0. Cuándo aplica este tutorial

Aplica cuando la app **solo usa Google para iniciar sesión** (`openid`, `email`, `profile`). Estos scopes son **no sensibles**, por lo que normalmente no hace falta pasar por verificación de scopes de Google.

Si la app pide scopes sensibles o restringidos (por ejemplo YouTube, Drive, Gmail), el proceso es distinto y requiere verificación de Google. Ese caso no se cubre aquí.

## 1. Arquitectura del proyecto de referencia

| Pieza | Valor |
|---|---|
| Flujo | Google Identity Services (botón/One Tap) con **ID token** |
| Dominio (front y back) | `hiram-oci-mty.duckdns.org` (VPS en Oracle Cloud con Nginx y SSL) |
| Front | Astro, servido desde el dominio anterior (ruta exacta por confirmar) |
| Back URL | `https://hiram-oci-mty.duckdns.org/mejorandome-back/v1/api` |
| Back | NestJS; valida el token con `google-auth-library` (`verifyIdToken`, audience = `GOOGLE_CLIENT_ID`) |
| Client secret | No se usa |
| Authorization code / redirect URIs | No se usan (salvo `ux_mode=redirect`, que no se usa) |
| Scopes | `openid`, `email`, `profile` (no sensibles) |

Consecuencia: en el OAuth client solo importan los **Authorized JavaScript origins**.

## 2. Checklist previo a publicar

En la consola, la app aparece con estado de publicación **"Prueba"**. Para pulsar **"Publicar app"** Google pide, como mínimo:

- [ ] **Página principal de la aplicación**: un vínculo público a la home.
- [ ] **Vínculo a la Política de Privacidad**: página pública.
- [ ] **Vínculo a las Condiciones del Servicio**: página pública.

Además se recomienda:
- [ ] Página de inicio pública que describa la app.
- [ ] Correo de soporte y correo de contacto del desarrollador.
- [ ] Logo de la app (opcional, pero recomendable).
- [ ] Dominio autorizado verificado en Google Search Console.
- [ ] `CORS_ORIGIN` del backend de producción incluye el origen real del front.
- [ ] `GOOGLE_CLIENT_ID` del backend coincide con el `PUBLIC_GOOGLE_CLIENT_ID` del front.

## 3. Pasos

### Paso 1 — Revisar el estado actual en Google Auth Platform `[PENDIENTE]`
Ruta: Google Cloud Console → proyecto de la app → **APIs y servicios → Pantalla de consentimiento de OAuth** (o **Google Auth Platform**).

Anotar: estado de publicación (Testing / In production), tipo de usuario (External / Internal), número de test users.

### Paso 1 — Resultado real (2026-11-21) `[VERIFICADO]`
Estado de la app en la consola, reportado por el dueño:
- Nombre de la aplicación: `mejorandome`.
- Correo de asistencia: configurado.
- **Sin logotipo y sin dominios de la app.**
- Sección **Público**: el botón **"Publicar app" aparece deshabilitado** (coincide con lo observado en OpenMontage: se habilita al completar los dominios autorizados).

### Paso 2 — Páginas legales en el front `[IMPLEMENTADO, falta desplegar]`
Se creó en la rama `feat/paginas-legales`: `src/pages/privacidad.astro`, `src/pages/terminos.astro`, `src/layouts/LegalLayout.astro` y `src/components/ui/Footer.astro` (con enlaces legales visibles desde la home). URLs finales:

- Página principal: `https://hiram-oci-mty.duckdns.org/mejorandome-front/`
- Política de privacidad: `https://hiram-oci-mty.duckdns.org/mejorandome-front/privacidad/`
- Condiciones del servicio: `https://hiram-oci-mty.duckdns.org/mejorandome-front/terminos/`

Antes de pegarlas en Google, comprobar que las tres respondan 200 en producción.

La política debe incluir:
- Qué datos de Google se reciben (correo, nombre, foto) y para qué.
- Qué datos de salud se almacenan.
- Cómo solicitar la eliminación de datos.
- Contacto.

### Paso 3 — Branding `[PENDIENTE]`
Completar nombre de la app, correo de soporte, home, privacidad, términos, **dominios autorizados** y correo de contacto. Decisión pendiente sobre el logo: subirlo puede forzar una verificación al publicar (ver evidencia OpenMontage).

### Paso 4 — Verificar el dominio en Search Console `[PENDIENTE]`
Duda abierta: el dominio es un subdominio gratuito de `duckdns.org`. Google puede exigir un dominio autorizado verificado y no está confirmado que acepte este. Se documentará el resultado real que muestre la consola.

### Paso 5 — Revisar el OAuth client (Clients) `[PENDIENTE]`
Authorized JavaScript origins (sin path):
- `https://hiram-oci-mty.duckdns.org`
- `http://localhost:4321` (desarrollo)

### Paso 6 — Audience → pasar a In production `[PENDIENTE]`
### Paso 7 — Pruebas con una cuenta que no sea tester `[PENDIENTE]`
### Paso 8 — Revisar backend (CORS y client ID) `[PENDIENTE]`

## 4. Qué cambia al publicar

- No hay cambios de código por pasar de Testing a Producción.
- Antes: solo los test users podían entrar. Después: **cualquier cuenta de Google puede registrarse y crear datos**. El backend no tiene lista blanca.
- En Testing los refresh tokens caducan a los 7 días; este flujo no los usa (la sesión depende del JWT propio, 7 días por defecto).

## 5. Problemas encontrados

_(se irá llenando)_
