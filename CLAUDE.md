# CLAUDE.md — Guía para Claude Code

Contexto para Claude Code al asistir en este repositorio.

## Qué es este proyecto

Repositorio base del **capstone de AWS Certified AI Practitioner (AIF-C01)** de Bootcamp
Institute. El alumno construye una solución de **IA Generativa sobre Amazon Bedrock** siguiendo
**Spec-Driven Development** con el flujo **EPCC**.

## Cómo trabajar aquí

- **Sigue el flujo EPCC.** Usa los comandos `/epcc-explore`, `/epcc-plan`, `/epcc-code`,
  `/epcc-commit` (definidos en `.claude/commands/`). No saltes a escribir código sin specs.
- **Spec-first.** Las especificaciones viven en `specs/` (a partir de `templates/`). El código
  debe rastrear a una tarea de `specs/03-tasks.md`, que rastrea a un requisito.
- **Una tarea, un commit.** Commits atómicos con mensajes claros.

## Entorno

- Claude Code corre sobre **Amazon Bedrock** (`CLAUDE_CODE_USE_BEDROCK=1`, región `us-east-1`).
- Modelos: invoca con prefijo de inference profile `us.` (p. ej. `us.anthropic.claude-sonnet-4-6`).
  Si un modelo responde `is not available for this account`, sugiere usar otro disponible.
- El *extended thinking* está **desactivado a propósito** (`MAX_THINKING_TOKENS=0`) por un bug
  conocido de Claude Code sobre Bedrock. No lo reactives.
- MCP servers de AWS disponibles (ver `.mcp.json`): `aws-documentation`, `aws-diagram`,
  `aws-cdk`, `aws-pricing`. Úsalos para fundamentar decisiones y diagramas.

## Reglas de seguridad (obligatorias)

- **NUNCA** escribas credenciales, tokens (`AWS_BEARER_TOKEN_BEDROCK`) ni secretos en archivos
  o commits. Léelos siempre de variables de entorno.
- Antes de cualquier commit, verifica el diff en busca de secretos.
- IAM y permisos: razona siempre en **mínimo privilegio**.

## Buenas prácticas técnicas

- Invoca Bedrock con la **Converse API**.
- Maneja errores de modelo no disponible y throttling con mensajes claros.
- Antes de proponer infraestructura con costo, **estima el costo** (MCP `aws-pricing`) — la
  cuenta AWS es compartida.
