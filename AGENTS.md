# Control Personal de Salud — Frontend

Aplicación web para el seguimiento personal del peso corporal, la alimentación, la saciedad y la actividad física. Permite registrar hábitos diarios, identificar patrones de comportamiento y consultar la evolución mediante resúmenes y gráficas.

## Estado del proyecto

**En desarrollo — Frontend**

## Objetivos

- Registrar el peso corporal y consultar su evolución histórica.
- Llevar un registro flexible de comidas y porciones.
- Identificar patrones relacionados con el hambre, la saciedad y el deseo de repetir alimentos.
- Registrar el ejercicio realizado y su duración.
- Llevar un seguimiento de los pasos diarios registrados por el iPhone.
- Consultar resúmenes diarios y semanales para evaluar los hábitos y el progreso.

## Stack tecnológico
- Respetar siempre DESIGN.md.

## Stack tecnológico

| Tecnología | Responsabilidad |
|---|---|
| Astro | Framework principal del frontend |
| TypeScript | Tipado estático y seguridad durante el desarrollo |
| CSS | Estilos y diseño adaptable |
| NestJS API | Backend independiente que proporcionará los datos |

Las librerías adicionales para componentes interactivos, gráficas y formularios se definirán según las necesidades de la interfaz.

## Funcionalidades

### 1. Dashboard

- Resumen del peso actual y su tendencia.
- Indicadores de actividad física.
- Resumen de los registros diarios.
- Acceso rápido a las principales funcionalidades.

### 2. Seguimiento del peso

- Registrar el peso por fecha.
- Consultar el historial de mediciones.
- Visualizar gráficas de evolución.
- Consultar promedios semanales.

### 3. Alimentación y saciedad

- Registrar las comidas del día.
- Describir alimentos y porciones de forma flexible.
- Registrar el hambre antes de comer y la saciedad al terminar.
- Identificar el deseo de repetir por gusto, incluso después de sentirse satisfecho.
- Registrar si se realizó una pausa antes de decidir repetir.
- Identificar situaciones o emociones relacionadas con el consumo adicional de alimentos.

### 4. Actividad física

- Registrar el tipo de ejercicio.
- Registrar la duración en minutos.
- Registrar los pasos diarios.
- Consultar el historial de actividad.

La primera versión permitirá introducir manualmente los pasos obtenidos desde la aplicación Salud del iPhone. Una posible integración automática se evaluará posteriormente.

### 5. Resúmenes y estadísticas

- Evolución del peso.
- Promedio diario de pasos.
- Minutos de ejercicio por día y semana.
- Historial de alimentación y saciedad.
- Comparaciones entre periodos.

## Arquitectura de carpetas

La siguiente estructura es una propuesta inicial para organizar el frontend. Se ajustará conforme se implementen las funcionalidades.

```text
frontend/
├── public/
│   ├── favicon.svg
│   └── images/
│
├── src/
│   ├── assets/
│   │
│   ├── components/
│   │   ├── ui/
│   │   ├── dashboard/
│   │   ├── weight/
│   │   ├── nutrition/
│   │   └── activity/
│   │
│   ├── layouts/
│   │   └── MainLayout.astro
│   │
│   ├── pages/
│   │   ├── index.astro
│   │   ├── peso/
│   │   ├── alimentacion/
│   │   └── actividad/
│   │
│   ├── services/
│   │   ├── api.client.ts
│   │   ├── weight.service.ts
│   │   ├── nutrition.service.ts
│   │   └── activity.service.ts
│   │
│   ├── types/
│   │   ├── weight.ts
│   │   ├── nutrition.ts
│   │   └── activity.ts
│   │
│   ├── utils/
│   │
│   └── styles/
│       └── global.css
│
├── .env.example
├── .gitignore
├── astro.config.mjs
├── package.json
├── tsconfig.json
└── README.md
```

La estructura representa una organización prevista, no archivos que necesariamente existan desde el inicio. Los componentes interactivos se añadirán según se definan las necesidades de cada pantalla.

## Integración con la API

El frontend consumirá una API REST proporcionada por un backend independiente desarrollado con NestJS.

La comunicación se centralizará en la carpeta `src/services/` para evitar que las pantallas dependan directamente de los detalles de las peticiones HTTP.

La URL base de la API se configurará mediante una variable de entorno pública de Astro:

```dotenv
PUBLIC_API_BASE_URL=http://localhost:3000/api
```

El valor es ilustrativo y deberá coincidir con la configuración real del backend.

Las variables con prefijo `PUBLIC_` pueden quedar expuestas en el navegador. Por tanto, no deben contener contraseñas, claves privadas ni secretos.

Durante el desarrollo inicial se podrán utilizar datos simulados para construir y validar las pantallas antes de conectar la API.

## Requisitos previos

- Node.js compatible con la versión de Astro instalada.
- npm.
- Git.

## Instalación

```bash
npm install
```

## Desarrollo local

```bash
npm run dev
```

Astro mostrará en la terminal la URL local de la aplicación.

## Compilación

```bash
npm run build
```

## Previsualización de producción

```bash
npm run preview
```

Los comandos corresponden a los scripts habituales del proyecto Astro y podrán variar según la configuración de `package.json`.

## Convenciones de desarrollo

### Control de versiones

- Los commits deben reflejar únicamente la autoría de **JustLearningMX**. No incluir coautoría ni referencias a otros colaboradores.
- Escribir mensajes de commit claros, concisos y en imperativo.
- Realizar commits atómicos: cada commit representa un cambio lógico e independiente.

### Código limpio

- Escribir código que se explique por sí mismo. Evitar comentarios innecesarios; los nombres de variables, funciones y tipos deben comunicar la intención.
- Mantener las funciones cortas y con una única responsabilidad.
- Preferir la legibilidad sobre la brevedad artificial.
- Eliminar código muerto, variables sin uso y dependencias innecesarias.

### Principios y patrones

- Aplicar los principios **SOLID** en el diseño de componentes y servicios.
- Ir de lo genérico a lo específico para minimizar la duplicación de código.
- Utilizar patrones de diseño cuando resuelvan un problema concreto, no por convención.
- Favorecer la composición sobre la herencia.

### Componentes

- Diseñar componentes reutilizables y genéricos siempre que sea viable.
- Seguir el patrón **Compound Components** para componentes complejos que compartan estado o contexto interno.
- Separar la lógica de presentación de la lógica de negocio.
- Mantener una API de props consistente y predecible entre componentes similares.

### TypeScript

- Utilizar TypeScript para los tipos y contratos de datos.
- Definir interfaces y tipos explícitos en lugar de depender de la inferencia en contratos públicos.
- Evitar el uso de `any`; preferir `unknown` cuando el tipo no sea determinable.

### Arquitectura

- Mantener separados los componentes visuales y el acceso a la API.
- Centralizar las llamadas HTTP en la capa de servicios.
- Mantener las variables de entorno fuera del código fuente.
- Priorizar una interfaz adaptable a dispositivos móviles y escritorio.
- Evitar abstracciones innecesarias y complejidad prematura.

### Buenas prácticas adicionales

- Aplicar el principio **DRY** (Don't Repeat Yourself), pero sin sacrificar claridad por reutilización forzada.
- Aplicar el principio **YAGNI** (You Aren't Gonna Need It): no implementar funcionalidades anticipándose a requisitos inexistentes.
- Manejar errores de forma explícita y consistente en toda la aplicación.
- Nombrar archivos y carpetas de forma descriptiva y coherente con la convención del proyecto.
- Mantener las dependencias actualizadas y justificadas; no agregar librerías para resolver problemas triviales.

## Fases de desarrollo

### Fase 1 — Interfaz

- Definir navegación, layout y estilos globales.
- Implementar el dashboard.
- Crear las pantallas de peso, alimentación y actividad física.
- Incorporar formularios y validaciones.
- Añadir visualizaciones y resúmenes.
- Trabajar con datos simulados.

### Fase 2 — Integración

- Conectar los servicios del frontend con la API REST.
- Configurar las variables de entorno.
- Gestionar estados de carga, errores y respuestas vacías.
- Validar los flujos completos de registro y consulta.

### Fase 3 — Refinamiento

- Mejorar la experiencia móvil.
- Revisar accesibilidad y usabilidad.
- Optimizar rendimiento y carga de recursos.
- Evaluar integraciones adicionales, como la importación automática de pasos.

## Alcance

Esta aplicación facilita el registro y seguimiento personal de hábitos. Sus estadísticas son informativas y no sustituyen una evaluación ni un diagnóstico médico.

---

**Proyecto:** Control Personal de Salud — Frontend  
**Framework:** Astro  
**Lenguaje:** TypeScript  
**Backend:** API independiente desarrollada con NestJS