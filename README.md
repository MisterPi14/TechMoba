# Capstone AIF-C01 · Bootcamp Institute

Repositorio base para tu **proyecto capstone** del curso de preparación a la certificación
**AWS Certified AI Practitioner (AIF-C01)**.

Aquí construirás —de principio a fin— una solución de **IA Generativa sobre AWS** usando
**Amazon Bedrock**, aplicando una metodología profesional de **Spec-Driven Development**
asistida por **Claude Code** y los **MCP servers de AWS**.

> No necesitas instalar nada en tu computadora. Todo corre en **GitHub Codespaces**.

---

## 📑 Tabla de contenido

1. [Qué vas a construir](#-qué-vas-a-construir)
2. [Arranque rápido (5 minutos)](#-arranque-rápido-5-minutos)
3. [Configura tu acceso a Bedrock](#-configura-tu-acceso-a-bedrock)
4. [MCP servers de AWS](#-mcp-servers-de-aws)
5. [Spec-Driven Development](#-spec-driven-development-sdd)
6. [La skill EPCC (Explore · Plan · Code · Commit)](#-la-skill-epcc)
7. [Tu flujo de trabajo del capstone](#-tu-flujo-de-trabajo-del-capstone)
8. [Entregables y rúbrica](#-entregables-y-rúbrica)
9. [Solución de problemas](#-solución-de-problemas)

---

## 🎯 Qué vas a construir

Una aplicación de IA Generativa que demuestre dominio de los 5 dominios del examen AIF-C01:

| Dominio AIF-C01 | Cómo lo cubre el capstone |
|---|---|
| 1. Fundamentos de IA/ML | Justificas por qué un foundation model resuelve tu caso (vs ML clásico) |
| 2. Fundamentos de IA Generativa | Usas Amazon Bedrock con un modelo Claude |
| 3. Aplicaciones de Foundation Models | Prompt engineering, y opcionalmente RAG con Knowledge Bases |
| 4. IA Responsable | Documentas sesgos, límites, guardrails y transparencia |
| 5. Seguridad y Gobernanza | IAM de mínimo privilegio, sin secretos en el código, costos controlados |

La idea (tema libre, lo defines en [`specs/00-capstone-brief.md`](specs/00-capstone-brief.md)):
un asistente, clasificador, generador o sistema RAG que resuelva un problema **real**.

---

## ⚡ Arranque rápido (5 minutos)

1. **Abre el repo en Codespaces**
   Botón verde **`<> Code`** → pestaña **Codespaces** → **Create codespace on main**.
   El contenedor instala solo Claude Code, `uv`, AWS CLI y los MCP servers (~2-3 min).

2. **Configura el secret de Bedrock** → ver [sección siguiente](#-configura-tu-acceso-a-bedrock).

3. **Verifica que todo funciona** (en la terminal del Codespace):
   ```bash
   aws bedrock list-foundation-models --query 'length(modelSummaries)' --output text
   claude --version
   ```

4. **Lanza Claude Code y arranca:**
   ```bash
   claude
   ```
   Dentro de Claude, escribe `/epcc-explore` para iniciar tu capstone.

---

## 🔑 Configura tu acceso a Bedrock

Claude Code en este Codespace usa **Amazon Bedrock** como backend (no la API pública).
Tu facilitador te entregará un **token de Bedrock** (empieza con `ABSK...`). Guárdalo como
**Codespaces Secret** —nunca en el código:

1. Ve a **GitHub → Settings → Codespaces → Secrets → New secret**
   (o directamente: `https://github.com/settings/codespaces`).
2. Crea el secret:
   - **Name:** `AWS_BEARER_TOKEN_BEDROCK`
   - **Value:** el token `ABSK...` que te dieron
   - **Repository access:** selecciona `gabanox/aif-capstone`
3. Si el Codespace ya estaba abierto, **recréalo o reinícialo** para que tome el secret.

> 🔒 **Regla de oro:** el token es una credencial. No lo pegues en archivos, ni en commits,
> ni en mensajes de chat. Si lo expones por error, avisa a tu facilitador para rotarlo.

Verifica el acceso:
```bash
echo $AWS_BEARER_TOKEN_BEDROCK | cut -c1-8   # debe imprimir: ABSKYmVk
aws bedrock list-foundation-models --query 'modelSummaries[?contains(modelId,`claude`)].modelId' --output text
```

Detalle técnico y modelos disponibles: [`docs/CODESPACES-BEDROCK.md`](docs/CODESPACES-BEDROCK.md).

---

## 🧩 MCP servers de AWS

Los **MCP servers** le dan a Claude Code "herramientas" para consultar AWS en tiempo real
(documentación oficial, diagramas de arquitectura, costos, CDK). Ya vienen **preconfigurados**
en [`.mcp.json`](.mcp.json) y se instalan solos vía `uv`.

| MCP server | Para qué sirve | ¿Requiere credenciales? |
|---|---|---|
| `aws-documentation` | Buscar y citar documentación oficial de AWS | No |
| `aws-diagram` | Generar diagramas de arquitectura desde tu diseño | No |
| `aws-cdk` | Ayuda con infraestructura como código (CDK) | No |
| `aws-pricing` | Estimar costos de tu arquitectura | Sí (tu token Bedrock/AWS) |

Al lanzar `claude`, acepta los MCP servers cuando lo pregunte. Verifica con `/mcp` dentro
de Claude Code. Guía completa (y servers opcionales como Bedrock Knowledge Bases para RAG):
[`docs/MCP-SETUP.md`](docs/MCP-SETUP.md).

---

## 📐 Spec-Driven Development (SDD)

No empieces tirando código. En SDD primero **especificas** (requisitos → diseño → tareas) y
recién después implementas. Esto es lo que evalúa un capstone profesional.

```
  IDEA  →  REQUISITOS  →  DISEÑO  →  TAREAS  →  CÓDIGO  →  VALIDACIÓN
          (qué/por qué)  (cómo)    (pasos)   (implementar)
```

Las plantillas están en [`templates/`](templates/). Copia cada una a tu carpeta `specs/`
a medida que avanzas:

| Plantilla | Qué documentas |
|---|---|
| [`templates/01-requirements.md`](templates/01-requirements.md) | Requisitos en formato EARS (qué debe hacer y por qué) |
| [`templates/02-design.md`](templates/02-design.md) | Arquitectura AWS, modelo Bedrock, datos, IA responsable |
| [`templates/03-tasks.md`](templates/03-tasks.md) | Plan de tareas verificable |

Guía conceptual completa: [`docs/SPEC-DRIVEN-DEVELOPMENT.md`](docs/SPEC-DRIVEN-DEVELOPMENT.md).

---

## 🔄 La skill EPCC

**EPCC = Explore · Plan · Code · Commit.** Es el flujo de trabajo recomendado por Anthropic
para usar Claude Code de forma disciplinada, y mapea 1:1 con Spec-Driven Development.

Este repo **ya incluye** los comandos EPCC en [`.claude/commands/`](.claude/commands/), así que
funcionan apenas abres el Codespace —sin instalar nada. Dentro de `claude`:

| Comando | Fase | Qué hace |
|---|---|---|
| `/epcc-explore` | **Explore** | Investiga el problema, AWS y el código. NO escribe código todavía. |
| `/epcc-plan` | **Plan** | Genera tus specs: requisitos, diseño y tareas. |
| `/epcc-code` | **Code** | Implementa siguiendo el plan, tarea por tarea. |
| `/epcc-commit` | **Commit** | Commit limpio + actualiza documentación. |

### Instalar EPCC desde cero (en otros proyectos)

Si quieres EPCC en cualquier proyecto tuyo, no solo en este repo, ver la guía paso a paso:
[`docs/EPCC-WORKFLOW.md`](docs/EPCC-WORKFLOW.md) → *"Instalar EPCC desde cero"*.

---

## 🛠 Tu flujo de trabajo del capstone

```bash
claude            # lanza Claude Code en el Codespace
```

1. **`/epcc-explore`** — Define tu idea. Claude investiga el caso y los servicios AWS.
   → Llenas [`specs/00-capstone-brief.md`](specs/00-capstone-brief.md).
2. **`/epcc-plan`** — Claude te ayuda a escribir `specs/01-requirements.md`, `02-design.md`
   y `03-tasks.md` a partir de las plantillas.
3. **`/epcc-code`** — Implementas tarea por tarea. Usa los MCP de AWS para docs y diagramas.
4. **`/epcc-commit`** — Commits atómicos con buenos mensajes.
5. Repite Code→Commit hasta terminar. Valida contra tu rúbrica.

> 💡 Recuerda el [gate de FinOps](docs/SPEC-DRIVEN-DEVELOPMENT.md#-costos-gate-de-finops): estima
> costos **antes** de desplegar. La cuenta del bootcamp es compartida.

---

## 📦 Entregables y rúbrica

Al final, tu repo (un fork o tu propia copia) debe contener:

- [ ] `specs/00-capstone-brief.md` — idea y caso de uso
- [ ] `specs/01-requirements.md` — requisitos EARS
- [ ] `specs/02-design.md` — arquitectura + diagrama + decisiones de IA responsable/seguridad
- [ ] `specs/03-tasks.md` — plan de tareas (todas marcadas ✓)
- [ ] Código funcional que invoca Bedrock
- [ ] `README` de tu proyecto explicando cómo ejecutarlo
- [ ] Historial de commits limpio (evidencia del flujo EPCC)

Rúbrica detallada y criterios de evaluación: [`specs/00-capstone-brief.md`](specs/00-capstone-brief.md).

---

## 🩺 Solución de problemas

| Síntoma | Causa / Solución |
|---|---|
| `API Error: 400 ... Expected 'thinking'... but found 'text'` | Bug de Claude Code sobre Bedrock. El `devcontainer.json` ya lo mitiga con `MAX_THINKING_TOKENS=0`. Si lo ves, reinicia el Codespace. Detalle: [`docs/CODESPACES-BEDROCK.md`](docs/CODESPACES-BEDROCK.md). |
| `is not available for this account` al usar un modelo | Ese modelo no está habilitado en la cuenta. Usa `/model` y elige uno disponible (sonnet-4-6, opus-4-5, haiku-4-5). |
| `Unable to locate credentials` | Falta el secret `AWS_BEARER_TOKEN_BEDROCK`. Configúralo y reinicia el Codespace. |
| `/mcp` no muestra los servers | `uv` no quedó en el PATH. Corre `source ~/.bashrc` y reinicia `claude`. |
| `claude: command not found` | Re-corre `bash .devcontainer/post-create.sh`. |

---

<sub>Bootcamp Institute · Preparación AWS Certified AI Practitioner (AIF-C01)</sub>
