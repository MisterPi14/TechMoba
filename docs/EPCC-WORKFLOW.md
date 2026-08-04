# La skill EPCC — Explore · Plan · Code · Commit

**EPCC** es el flujo de trabajo recomendado por Anthropic para usar Claude Code de forma
disciplinada. En vez de pedirle "hazme la app" de un solo golpe, lo guías por cuatro fases:

```
  EXPLORE  →  PLAN  →  CODE  →  COMMIT
 (entender)  (diseñar) (implementar) (consolidar)
```

Mapea 1:1 con [Spec-Driven Development](SPEC-DRIVEN-DEVELOPMENT.md): Explore+Plan producen tus
specs; Code+Commit las ejecutan.

## Los comandos

Este repo ya incluye los comandos en [`.claude/commands/`](../.claude/commands/). Dentro de
`claude`:

| Comando | Qué hace | Qué NO hace |
|---|---|---|
| `/epcc-explore` | Lee el código, investiga el problema y AWS, hace preguntas. | No escribe código. |
| `/epcc-plan` | Escribe requisitos, diseño y tareas en `specs/`. | No implementa. |
| `/epcc-code` | Implementa la siguiente tarea pendiente del plan. | No improvisa fuera del plan. |
| `/epcc-commit` | Hace un commit atómico con buen mensaje y actualiza docs. | No mezcla cambios no relacionados. |

### Por qué separar las fases

El error #1 de los principiantes con IA es dejar que el agente escriba código antes de
entender el problema. Separar Explore/Plan de Code obliga a **pensar primero**, y hace que el
código que Claude genera sea mucho más correcto porque parte de una spec clara.

## Cómo usarlo en tu capstone

```bash
claude
```
1. `/epcc-explore` — describe tu idea de capstone; deja que Claude investigue y te pregunte.
2. `/epcc-plan` — Claude llena `specs/01-requirements.md`, `02-design.md`, `03-tasks.md`.
   **Revisa y aprueba** antes de seguir.
3. `/epcc-code` — implementa la primera tarea. Repite por cada tarea.
4. `/epcc-commit` — commitea. Vuelve al paso 3 hasta terminar.

---

## Instalar EPCC desde cero (en otros proyectos)

Los comandos EPCC no son magia: son **archivos Markdown** que Claude Code lee como *slash
commands*. Hay tres formas de tenerlos.

### Opción A — Ya incluidos en este repo (cero instalación)
Si trabajas en `aif-capstone`, ya están en `.claude/commands/`. No haces nada.

### Opción B — Comandos personales (para TODOS tus proyectos)
Cópialos a tu carpeta global de Claude Code, en tu máquina o en cualquier Codespace:

```bash
mkdir -p ~/.claude/commands
# desde un clon de este repo:
cp .claude/commands/epcc-*.md ~/.claude/commands/
```
Ahora `/epcc-explore`, `/epcc-plan`, etc. funcionan en cualquier directorio donde abras `claude`.

### Opción C — Comandos del proyecto (para tu propio repo)
En la raíz de tu repo:
```bash
mkdir -p .claude/commands
# crea cada archivo, p. ej.:
cat > .claude/commands/epcc-explore.md <<'EOF'
Explora el proyecto y el problema SIN escribir código todavía:
1. Lee los archivos y la estructura relevantes.
2. Investiga la documentación de AWS necesaria (usa el MCP aws-documentation).
3. Identifica restricciones, riesgos y preguntas abiertas.
4. Resume lo aprendido y propón el alcance. Pregúntame lo que falte.
NO implementes nada en esta fase.
EOF
```
Repite para `epcc-plan.md`, `epcc-code.md`, `epcc-commit.md` (mira los de este repo como base).
Commitea la carpeta `.claude/commands/` y todo tu equipo tendrá los mismos comandos.

### Verificar
Dentro de `claude`, escribe `/` y deberían aparecer en el menú de comandos. O `/help`.

> **Nota:** "skills" y "slash commands" son cosas relacionadas en Claude Code. Lo que aquí
> usamos son **slash commands** de proyecto/usuario: la forma más simple y portable de tener
> EPCC sin depender de ningún marketplace externo.
