# Diseño — `<título del proyecto>`

> Cópiala a `specs/02-design.md` y llénala en la fase Plan (`/epcc-plan`).
> El diseño responde *cómo* se cumplen los requisitos de `01-requirements.md`.

## 1. Arquitectura

`<Descripción en prosa del flujo de extremo a extremo.>`

### Diagrama
> Genera el diagrama con el MCP `aws-diagram` y guárdalo aquí.

```
<usuario> → <API Gateway> → <Lambda> → <Amazon Bedrock: Claude> → <almacenamiento>
```

## 2. Modelo de Amazon Bedrock

- **Modelo:** `us.anthropic.claude-<...>`
- **API:** Converse API
- **Justificación:** `<por qué este modelo: calidad vs costo vs latencia. Cubre dominios 2 y 3.>`
- **Parámetros:** `maxTokens=<…>`, `temperature=<…>`

## 3. Prompt engineering (dominio 3)

- **System prompt:** `<rol e instrucciones clave>`
- **Estrategia:** `<zero-shot / few-shot / RAG>`
- `<Si usas RAG: fuente de datos, chunking, Knowledge Base ID.>`

## 4. Flujo de datos

| Paso | Entrada | Proceso | Salida |
|------|---------|---------|--------|
| 1 | `<…>` | `<…>` | `<…>` |

## 5. Manejo de errores

| Escenario | Respuesta del sistema |
|-----------|------------------------|
| Modelo no disponible | `<mensaje claro + fallback>` |
| Throttling / límite | `<reintento con backoff>` |
| Entrada inválida | `<validación previa>` |

## 6. IA Responsable (dominio 4)

- **Riesgos identificados:** `<sesgos, alucinaciones, PII, mal uso>`
- **Mitigaciones de diseño:** `<guardrails, validación de salida, disclaimers, human-in-the-loop>`

## 7. Seguridad (dominio 5)

- **IAM:** permisos de **mínimo privilegio** (solo `bedrock:InvokeModel`/`Converse` sobre los
  modelos usados). `<detalle>`
- **Secretos:** token y credenciales solo en variables de entorno; nada en el repo.
- **Datos:** `<cifrado, retención, anonimización si aplica>`

## 8. Costo — gate de FinOps

> Estima con el MCP `aws-pricing`. La cuenta es compartida.

| Componente | Supuesto de volumen | Costo estimado |
|------------|---------------------|----------------|
| Bedrock (input tokens) | `<N>` / mes | `$<…>` |
| Bedrock (output tokens) | `<N>` / mes | `$<…>` |
| `<otros servicios>` | `<…>` | `$<…>` |
| **Total estimado** | | **`$<…>` / mes** |

## 9. Decisiones de diseño (rastreables)

| Decisión | Requisito que satisface | Alternativa descartada y por qué |
|----------|-------------------------|----------------------------------|
| `<…>` | `RF-x` | `<…>` |
