# Requisitos — `<título del proyecto>`

> Plantilla EARS. Cópiala a `specs/01-requirements.md` y llénala en la fase Plan (`/epcc-plan`).
> Cada requisito necesita un **criterio de aceptación verificable**.

## Requisitos funcionales

### RF-1 — `<nombre corto>`
- **Requisito (EARS):** CUANDO `<evento>`, el sistema DEBE `<respuesta>`.
- **Criterio de aceptación:** `<cómo se comprueba que se cumple>`.
- **Dominio AIF-C01:** `<1-5>`

### RF-2 — `<nombre corto>`
- **Requisito (EARS):** SI `<condición>`, el sistema DEBE `<respuesta>`.
- **Criterio de aceptación:** `<…>`

### RF-3 — `<nombre corto>`
- **Requisito (EARS):** El sistema DEBE `<respuesta ubicua>`.
- **Criterio de aceptación:** `<…>`

## Requisitos no funcionales

| ID | Categoría | Requisito (EARS) | Criterio de aceptación |
|----|-----------|------------------|------------------------|
| RNF-1 | Rendimiento | CUANDO el usuario envía una petición, el sistema DEBE responder en < `<N>` s | medición |
| RNF-2 | IA Responsable | El sistema DEBE `<mostrar disclaimer / filtrar contenido / citar fuentes>` | revisión |
| RNF-3 | Seguridad | El sistema DEBE leer credenciales solo de variables de entorno | code review |
| RNF-4 | Costo | El sistema DEBE usar `<haiku/sonnet>` para `<caso>` para acotar costo | diseño |

## Fuera de alcance
- `<lo que explícitamente NO se implementa>`

## Trazabilidad
> Cada decisión de `02-design.md` y cada tarea de `03-tasks.md` debe referenciar uno de estos IDs.
