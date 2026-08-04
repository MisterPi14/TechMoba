# Capstone AIF-C01 — Brief del proyecto

> Llena este documento en la fase **Explore** (`/epcc-explore`). Es el punto de partida de tu
> proyecto. Bórralo/edita los textos entre `<…>`.

## 1. Identificación

- **Alumno:** `<tu nombre>`
- **Cohorte:** `<cohorte>`
- **Fecha:** `<AAAA-MM-DD>`
- **Título del proyecto:** `<nombre>`

## 2. El problema

`<Describe en 2-4 frases un problema real. ¿Quién lo tiene? ¿Por qué importa?>`

## 3. La solución propuesta

`<Qué vas a construir. Tipo: asistente conversacional / clasificador / generador de contenido /
sistema RAG / extractor. En una frase.>`

## 4. Por qué IA Generativa (dominio 1 y 2)

`<Justifica por qué un foundation model de Bedrock resuelve esto mejor que ML clásico o reglas.>`

## 5. Alcance

**Incluye (MVP):**
- `<funcionalidad mínima 1>`
- `<funcionalidad mínima 2>`

**No incluye (fuera de alcance):**
- `<lo que NO harás, para acotar>`

## 6. Servicios AWS previstos

| Servicio | Para qué |
|---|---|
| Amazon Bedrock (modelo `<us.anthropic.claude-...>`) | `<inferencia / generación>` |
| `<Lambda / API Gateway / S3 / DynamoDB / Knowledge Bases ...>` | `<…>` |

## 7. Consideraciones de IA Responsable (dominio 4)

- **Riesgos:** `<sesgos, alucinaciones, datos sensibles, mal uso>`
- **Mitigaciones:** `<guardrails, validación, disclaimers, human-in-the-loop>`

## 8. Seguridad y costo (dominio 5)

- **Seguridad:** `<IAM mínimo privilegio, sin secretos en código, datos cifrados>`
- **Costo estimado:** `<a completar en el diseño con el MCP aws-pricing>`

---

## Rúbrica de evaluación

| Criterio | Peso | Qué se evalúa |
|---|---:|---|
| Specs completas y claras | 20% | requirements + design + tasks bien escritos (EARS, diseño justificado) |
| Funcionalidad | 25% | la solución invoca Bedrock y resuelve el problema |
| Cobertura AIF-C01 | 20% | evidencia de los 5 dominios |
| IA responsable | 15% | riesgos identificados y mitigados |
| Seguridad y costo | 10% | IAM mínimo, sin secretos, costo estimado |
| Proceso (EPCC) | 10% | historial de commits limpio que evidencia el flujo |

> **Para aprobar:** specs aprobadas + demo funcional + repo con los entregables del README.
