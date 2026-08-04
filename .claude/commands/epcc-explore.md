---
description: "EPCC Fase 1 — Explorar el problema y AWS sin escribir código"
---

# EPCC · Explore

Estás en la fase **Explore** del flujo EPCC para un capstone de AWS AI Practitioner (AIF-C01).

Tu objetivo es **entender, no implementar**. NO escribas código de la solución en esta fase.

Haz lo siguiente:

1. **Entiende la idea del alumno.** Si aún no está clara, hazle preguntas concretas sobre:
   el problema real a resolver, los usuarios, los datos de entrada/salida y el resultado esperado.

2. **Investiga el contexto técnico** usando las herramientas disponibles:
   - Lee la estructura del repo y los archivos en `specs/` y `docs/`.
   - Usa el MCP `aws-documentation` para confirmar qué servicios de AWS y qué capacidades de
     Amazon Bedrock aplican (Converse API, modelos Claude disponibles, Knowledge Bases si hay RAG).
   - No inventes APIs: cita la documentación.

3. **Identifica para los 5 dominios de AIF-C01:**
   - Qué foundation model y por qué (vs ML clásico).
   - Si necesita RAG / Knowledge Bases o basta prompt engineering.
   - Riesgos de IA responsable (sesgos, alucinaciones, datos sensibles).
   - Implicaciones de seguridad (IAM mínimo, manejo de secretos) y costo.

4. **Sintetiza** en un resumen claro: alcance propuesto, supuestos, riesgos y preguntas abiertas.
   Si tiene sentido, ayuda al alumno a llenar `specs/00-capstone-brief.md`.

Termina recomendando pasar a `/epcc-plan` cuando el alcance esté acordado.
