# MCP servers de AWS — Guía completa

Los **Model Context Protocol (MCP) servers** son procesos que le dan a Claude Code
herramientas extra. En este repo te conectan con AWS: documentación oficial, diagramas
de arquitectura, costos y CDK.

## Cómo están configurados

El archivo [`.mcp.json`](../.mcp.json) en la raíz del repo define los servers a nivel de
proyecto. Claude Code lo lee automáticamente al arrancar y te pedirá aprobarlos la primera vez.

Todos se ejecutan con **`uvx`** (parte de `uv`, instalado por `post-create.sh`). No necesitas
instalarlos manualmente; `uvx` los descarga y cachea al primer uso.

## Servers incluidos

### `aws-documentation` — documentación oficial
Permite a Claude buscar y citar `docs.aws.amazon.com`. Úsalo para no inventar APIs.
```
Dentro de Claude:  "busca en la documentación de AWS cómo invocar un modelo con la API Converse de Bedrock"
```

### `aws-diagram` — diagramas de arquitectura
Genera diagramas (PNG) de tu arquitectura a partir de una descripción. Requiere `graphviz`
(lo instala `post-create.sh`). Ideal para tu `specs/02-design.md`.
```
Dentro de Claude:  "dibuja un diagrama de mi arquitectura: API Gateway → Lambda → Bedrock (Claude) → DynamoDB"
```

### `aws-cdk` — infraestructura como código
Ayuda a escribir y entender AWS CDK si decides desplegar infraestructura.

### `aws-pricing` — estimación de costos
Estima el costo de tu arquitectura. Útil para el **gate de FinOps** antes de desplegar.
Requiere tus credenciales AWS (el token Bedrock ya configurado).

## Verificar que funcionan

Dentro de Claude Code:
```
/mcp
```
Deberías ver los 4 servers en estado `connected`. Si alguno falla:

| Problema | Solución |
|---|---|
| `uvx: command not found` | `source ~/.bashrc` y reinicia `claude`. Si persiste: re-corre `bash .devcontainer/post-create.sh`. |
| Un server queda en `failed` | Mira el log con `/mcp` → selecciónalo. Suele ser red o falta de `graphviz`. |
| `aws-pricing` no autentica | Verifica `echo $AWS_BEARER_TOKEN_BEDROCK` y `aws sts get-caller-identity`. |

## Servers opcionales (RAG y más)

Si tu capstone usa **RAG con Bedrock Knowledge Bases**, añade este server a `.mcp.json`
(necesitas el ID de tu Knowledge Base):

```json
"bedrock-kb-retrieval": {
  "command": "uvx",
  "args": ["awslabs.bedrock-kb-retrieval-mcp-server@latest"],
  "env": {
    "AWS_REGION": "us-east-1",
    "FASTMCP_LOG_LEVEL": "ERROR"
  }
}
```

Catálogo oficial de MCP servers de AWS: https://github.com/awslabs/mcp

## Instalar un MCP server a mano (referencia)

Además de `.mcp.json`, puedes registrar servers con la CLI:
```bash
claude mcp add aws-documentation -- uvx awslabs.aws-documentation-mcp-server@latest
claude mcp list
```
Pero para este repo no hace falta: ya están en `.mcp.json`.
