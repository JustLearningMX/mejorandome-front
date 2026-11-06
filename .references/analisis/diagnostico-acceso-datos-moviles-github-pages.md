# Diagnóstico: Imposibilidad de Cargar el Frontend en Datos Móviles (GitHub Pages)

## 1. Planteamiento del Problema

* **Comportamiento observado:**
  * Al ingresar a la URL de producción desde el teléfono móvil conectado a la red **Wi-Fi** de casa, la aplicación web carga con normalidad: es posible ver opciones, iniciar sesión con Google, ingresar al dashboard y capturar registros.
  * Al apagar el Wi-Fi y utilizar **datos celulares** (4G/5G), la aplicación ni siquiera carga en el navegador (Safari / Opera Mini), a pesar de que otras aplicaciones y sitios web sí cuentan con acceso a internet.

---

## 2. Arquitectura de Despliegue

* **Frontend:** Aplicación Astro desplegada como sitio estático en **GitHub Pages** (`https://justlearningmx.github.io/mejorandome-front/`).
* **Backend:** API NestJS ejecutándose en un **VPS de Oracle Cloud Infrastructure (OCI)** con Nginx como proxy inverso y SSL mediante DuckDNS (`https://hiram-oci-mty.duckdns.org/mejorandome-back/v1/api`).
* **Dispositivo de prueba:** iPhone (iOS).

---

## 3. Pruebas y Descarte Paso a Paso

### A. Verificación del Backend en Datos Celulares
Se probó ingresar directamente desde el navegador del celular con datos móviles al endpoint de salud:
`https://hiram-oci-mty.duckdns.org/mejorandome-back/v1/api/health`

* **Resultado:** Respondió `HTTP 200 OK` con `{"status":"ok", ...}`.
* **Conclusión:** El backend en OCI, el certificado SSL y el dominio DuckDNS funcionan y son plenamente accesibles desde la red móvil pública. El problema reside exclusivamente en el acceso al frontend.

### B. Análisis de Compilación y CORS
Se verificó el código del frontend compilado en GitHub Pages:
* El bundle de producción contenía correctamente la variable `PUBLIC_API_BASE_URL` apuntando a `https://hiram-oci-mty.duckdns.org/mejorandome-back/v1/api/`.
* Las cabeceras CORS en el servidor Nginx de OCI permiten explícitamente el origen `https://justlearningmx.github.io` tanto para peticiones regulares como para preflights `OPTIONS`.

### C. Identificación del Fallo en el Navegador Móvil
El usuario aclaró que la falla no ocurría durante una petición a la API, sino que **la página web ni siquiera comenzaba a cargar**.

### D. Prueba Definitiva de Aislamiento de Red
Se realizaron dos pruebas de navegación en Safari bajo red celular:
1. Navegación a **`https://github.com`**: **Cargó correctamente**.
2. Navegación a **`https://facebook.github.io/react/`**: **No cargó**.

---

## 4. Causa Raíz Identificada

El fallo es causado por los **servidores DNS y/o políticas de filtrado de las operadoras móviles en México (Telcel / AT&T)**:

1. **Problemas con dominios `*.github.io`:** Las operadoras celulares con frecuencia presentan fallos de resolución DNS (`NXDOMAIN` o *timeouts*) o aplican bloqueos preventivos hacia el dominio de hosting gratuito `github.io` debido a antecedentes de abuso/phishing en subdominios libres.
2. **Diferencia con la red Wi-Fi:** Los proveedores de internet fijo (Telmex, Totalplay, Izzi) utilizan infraestructuras DNS distintas que sí resuelven las zonas y registros IPv4/IPv6 de `github.io` sin restricciones.
3. **Comportamiento de Opera Mini:** En navegadores como Opera Mini, el modo de compresión extrema envía el tráfico a través de proxys intermedios que frecuentemente rompen aplicaciones modernas basadas en JavaScript y SPA.

---

## 5. Soluciones

### A. Solución Inmediata de Diagnóstico (Solo para el dispositivo)
Para comprobar el funcionamiento inmediato en el iPhone sin depender del DNS del operador:
1. Instalar la app gratuita **1.1.1.1** (Cloudflare WARP/DNS).
2. Activar la protección DNS.
3. Al recargar Safari en datos móviles, el subdominio `justlearningmx.github.io` resolverá de inmediato.

### B. Soluciones Definitivas para Producción (Cualquier usuario sin configuración adicional)

Para que cualquier usuario pueda acceder desde cualquier red celular sin restricciones:

1. **Configurar un Dominio Personalizado en GitHub Pages (Recomendado):**
   * Vincular un dominio propio (por ejemplo, `mejorandome.com` o `salud.tudominio.com`) al repositorio en GitHub Pages.
   * Al no utilizar el dominio compartido `.github.io`, las operadoras móviles no aplican filtros sobre la URL.

2. **Servir el Frontend desde el VPS en OCI (Nginx):**
   * Dado que el dominio `hiram-oci-mty.duckdns.org` ya tiene conectividad probada en redes móviles, es posible copiar la carpeta compilada de Astro (`dist/`) al VPS de OCI y servirla mediante Nginx en el mismo servidor del backend.

3. **Migrar el Despliegue a Cloudflare Pages, Vercel o Netlify:**
   * Plataformas gratuitas que se integran directamente con el repositorio de GitHub y ofrecen dominios asignados (como `*.pages.dev` o `*.vercel.app`) con alta disponibilidad y sin bloqueos en redes celulares de Latinoamérica.

