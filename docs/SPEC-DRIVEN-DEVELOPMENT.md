# Spec-Driven Development (SDD)

> "Semanas de programación pueden ahorrarte horas de planeación." — dicho irónico, gran verdad.

**Spec-Driven Development** es construir software empezando por las **especificaciones** y no
por el código. Primero defines *qué* (requisitos), luego *cómo* (diseño), luego *en qué pasos*
(tareas), y solo entonces implementas. Cada artefacto es un documento versionado que revisas
antes de avanzar.

Es exactamente lo que se espera de un proyecto capstone profesional: que demuestres que
**piensas antes de teclear**.

## Por qué SDD (y por qué con IA)

- **Claridad:** un requisito ambiguo produce código equivocado. Escribirlo lo desambigua.
- **Revisable:** tu facilitador puede corregir el rumbo en la fase de specs, no al final.
- **Mejor uso de Claude Code:** un agente de IA con una buena spec produce código mucho más
  correcto que con un prompt vago. La spec es el "contrato".
- **Trazabilidad:** cada línea de código rastrea a una tarea, que rastrea a un requisito.

## Las 4 fases (mapeadas a EPCC)

| Fase SDD | Artefacto | Comando EPCC |
|---|---|---|
| 1. Requisitos | `specs/01-requirements.md` | `/epcc-explore` + `/epcc-plan` |
| 2. Diseño | `specs/02-design.md` | `/epcc-plan` |
| 3. Tareas | `specs/03-tasks.md` | `/epcc-plan` |
| 4. Implementación | código + commits | `/epcc-code` + `/epcc-commit` |

### 1. Requisitos — formato EARS

Escribe requisitos verificables con la sintaxis **EARS** (Easy Approach to Requirements Syntax):

| Patrón | Plantilla | Ejemplo |
|---|---|---|
| Ubicuo | "El sistema DEBE \<respuesta\>" | El sistema DEBE registrar cada invocación a Bedrock. |
| Manejado por evento | "CUANDO \<evento\>, el sistema DEBE \<respuesta\>" | CUANDO el usuario envía una pregunta, el sistema DEBE responder en < 5 s. |
| Condicional | "SI \<condición\>, el sistema DEBE \<respuesta\>" | SI el modelo no está disponible, el sistema DEBE mostrar un error claro. |
| Estado | "MIENTRAS \<estado\>, el sistema DEBE \<respuesta\>" | MIENTRAS no haya token, el sistema DEBE bloquear las llamadas. |

Cada requisito necesita un **criterio de aceptación** comprobable. Si no puedes verificarlo,
reescríbelo.

### 2. Diseño

Aquí decides el *cómo*: arquitectura, servicios AWS, modelo de Bedrock, flujo de datos, y
—clave para AIF-C01— tus decisiones de **IA responsable** y **seguridad**. Usa el MCP
`aws-diagram` para generar el diagrama y `aws-documentation` para fundamentar tus elecciones.

### 3. Tareas

Descompón el diseño en tareas pequeñas, ordenadas y verificables. Cada una debe poder
completarse y commitearse de forma independiente. Marca ✓ al terminar.

### 4. Implementación

Recién aquí escribes código, **una tarea a la vez**, con `/epcc-code`. Commiteas cada tarea
con `/epcc-commit`. Si una tarea revela que el diseño estaba mal, **vuelves a la spec y la
corriges** — eso es SDD funcionando, no un fracaso.

## 💰 Costos: gate de FinOps

La cuenta del bootcamp es **compartida**. Antes de desplegar cualquier infraestructura o
correr cargas grandes contra Bedrock:

1. **Estima el costo** con el MCP `aws-pricing` (tokens de entrada/salida × volumen esperado).
2. Documenta la estimación en `specs/02-design.md`.
3. Prefiere `haiku` para pruebas e iteración; reserva `opus` para lo que de verdad lo necesite.
4. No dejes procesos en loop llamando a Bedrock.

## Regla de oro

> No avances a la siguiente fase hasta que la actual esté **revisada y aprobada**.
> Una spec aprobada es barata de cambiar; código equivocado es caro.
