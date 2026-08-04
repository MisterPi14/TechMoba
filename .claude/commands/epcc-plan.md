---
description: "EPCC Fase 2 — Escribir las specs: requisitos, diseño y tareas"
---

# EPCC · Plan

Estás en la fase **Plan** del flujo EPCC. Con base en lo explorado, produce las
especificaciones del proyecto. Todavía NO implementes código de la solución.

Genera (o actualiza) estos tres archivos a partir de las plantillas en `templates/`:

1. **`specs/01-requirements.md`** — requisitos en formato **EARS**
   (Ubicuo / CUANDO / SI / MIENTRAS), cada uno con su criterio de aceptación verificable.
   Cubre funcionalidad, IA responsable, seguridad y costo.

2. **`specs/02-design.md`** — el *cómo*:
   - Arquitectura y servicios AWS (incluye un diagrama con el MCP `aws-diagram`).
   - Modelo de Bedrock elegido y justificación (usa prefijo `us.` de inference profile).
   - Flujo de datos, prompts clave, y manejo de errores.
   - Decisiones explícitas de IA responsable y seguridad (IAM mínimo, sin secretos en código).
   - **Estimación de costos** (usa el MCP `aws-pricing`) — gate de FinOps.

3. **`specs/03-tasks.md`** — plan de tareas pequeñas, ordenadas y verificables; cada una
   commiteable de forma independiente, con checkbox `- [ ]`.

Reglas:
- Mantén las specs concretas y revisables. Si un requisito no es verificable, reescríbelo.
- Cada decisión de diseño debe rastrear a un requisito.
- **Detente y pide aprobación del alumno/facilitador** antes de pasar a `/epcc-code`.
