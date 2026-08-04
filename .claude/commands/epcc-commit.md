---
description: "EPCC Fase 4 — Commit atómico y actualización de documentación"
---

# EPCC · Commit

Estás en la fase **Commit** del flujo EPCC. Consolida el trabajo de la tarea recién terminada.

Procede así:

1. Revisa los cambios con `git status` y `git diff`. Asegúrate de que correspondan a **una sola
   tarea** lógica; deja fuera cambios no relacionados.
2. Verifica que no haya **secretos** ni credenciales en el diff (token de Bedrock, llaves, `.env`).
   Si los hay, NO commitees: muévelos a variables de entorno.
3. Actualiza la documentación afectada: el `README` de tu proyecto, comentarios, y marca la
   tarea como `- [x]` en `specs/03-tasks.md` si falta.
4. Haz un commit **atómico** con un mensaje claro en imperativo:
   ```
   <tipo>(<área>): <qué cambió y por qué>
   ```
   tipos: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`. Ejemplo:
   `feat(bedrock): invocar Claude vía Converse API para responder preguntas del usuario`.
5. Muestra al alumno el resultado y recuerda que el historial de commits es **evidencia
   evaluable** del flujo EPCC.

No hagas `git push` salvo que el alumno lo pida explícitamente. Un commit, una tarea.
