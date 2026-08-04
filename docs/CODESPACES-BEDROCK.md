# Claude Code sobre Amazon Bedrock en Codespaces

Esta guía explica cómo está configurado el entorno y cómo resolver los problemas más
comunes al correr Claude Code contra Bedrock.

## Cómo funciona

Claude Code puede usar tres backends: la API de Anthropic, Google Vertex o **Amazon Bedrock**.
Este repo usa **Bedrock**, configurado en [`.devcontainer/devcontainer.json`](../.devcontainer/devcontainer.json):

```jsonc
"CLAUDE_CODE_USE_BEDROCK": "1",
"AWS_REGION": "us-east-1",
"ANTHROPIC_MODEL": "us.anthropic.claude-sonnet-4-6",
"ANTHROPIC_SMALL_FAST_MODEL": "us.anthropic.claude-haiku-4-5-20251001-v1:0"
```

La autenticación es con un **bearer token de Bedrock** (`AWS_BEARER_TOKEN_BEDROCK`), que
inyectas como **Codespaces Secret** (ver README → *Configura tu acceso a Bedrock*). Es un
único token autocontenido: no usa el par `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY`.

## Modelos disponibles

Verifica en cualquier momento cuáles puedes invocar:

```bash
aws bedrock list-foundation-models \
  --query 'modelSummaries[?contains(modelId,`claude`)].modelId' --output text
```

Modelos habilitados típicamente en la cuenta del bootcamp (úsalos con prefijo `us.`):

| Modelo (inference profile) | Uso recomendado |
|---|---|
| `us.anthropic.claude-sonnet-4-6` | Principal — buen balance calidad/costo |
| `us.anthropic.claude-opus-4-5-20251101-v1:0` | Tareas complejas de razonamiento |
| `us.anthropic.claude-haiku-4-5-20251001-v1:0` | Rápido / barato (modelo "small fast") |

Cambia de modelo dentro de Claude Code con `/model`. Si eliges uno que responde
`is not available for this account`, simplemente no está habilitado: usa otro de la lista.

## ⚠️ El bug del bloque `thinking` (400)

### Síntoma
```
API Error: 400 messages.N.content.0.type: Expected `thinking` or `redacted_thinking`,
but found `text`. When `thinking` is enabled, a final `assistant` message must start
with a thinking block...
```

### Causa
Es un **bug conocido de Claude Code específico de Bedrock** (no de tu cuenta ni del modelo).
Con el *extended thinking* activado, Claude Code no preserva correctamente los bloques
`thinking` al re-serializar el historial multi-turn, y Bedrock rechaza el request.
Aparece en conversaciones con varias llamadas a herramientas (p. ej. `/init`).

Issues de referencia:
- [anthropics/claude-code #51985](https://github.com/anthropics/claude-code/issues/51985) (Bedrock)
- [anthropics/claude-code #20705](https://github.com/anthropics/claude-code/issues/20705)
- [anthropics/claude-code #22278](https://github.com/anthropics/claude-code/issues/22278)

### Solución (ya aplicada)
El `devcontainer.json` desactiva el thinking, que es el workaround oficial:

```jsonc
"MAX_THINKING_TOKENS": "0",
"CLAUDE_CODE_DISABLE_ADAPTIVE_THINKING": "1"
```

Si aún ves el error:
1. **Reinicia el Codespace** (para que tome las variables).
2. O, en la terminal antes de lanzar Claude:
   ```bash
   export MAX_THINKING_TOKENS=0
   claude --thinking disabled
   ```
3. Actualiza Claude Code por si ya salió el parche: `claude update` (o `npm i -g @anthropic-ai/claude-code`).

> Para un capstone no pierdes nada al desactivar el thinking: el modelo sigue resolviendo
> las tareas. Cuando Anthropic publique el fix, puedes quitar esas dos variables.
