---
description: "EPCC Fase 3 — Implementar la siguiente tarea del plan"
---

# EPCC · Code

Estás en la fase **Code** del flujo EPCC. Implementa la solución siguiendo las specs.

Procede así:

1. Lee `specs/03-tasks.md` e identifica la **siguiente tarea pendiente** (`- [ ]`).
2. Implementa **solo esa tarea**. No te adelantes ni hagas cambios fuera de su alcance.
3. Sigue el diseño de `specs/02-design.md`. Si descubres que el diseño está mal,
   **detente, avísalo y corrige la spec primero** (vuelve a `/epcc-plan`); no improvises.
4. Buenas prácticas obligatorias para AIF-C01:
   - Invoca Bedrock con la **Converse API** y un modelo con prefijo `us.` disponible.
   - **Nunca** hardcodees credenciales ni el token; léelos de variables de entorno.
   - Maneja errores (modelo no disponible, throttling) con mensajes claros.
   - Código legible y comentado donde aporte.
5. Verifica que la tarea funciona (ejecútala / pruébala) antes de darla por hecha.
6. Marca la tarea como completada (`- [x]`) en `specs/03-tasks.md`.

Al terminar la tarea, recomienda ejecutar `/epcc-commit`. Implementa una tarea a la vez.
