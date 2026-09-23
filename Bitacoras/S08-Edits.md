# Bitácora · S08 — Hilo de conversación del asistente de compras

**Fecha:** 2026-09-21 · **Stack:** `techmoda-ai-diego-pina` (us-east-1)
**Pedido original:** "¿qué propones para que el hilo de conversación se mantenga respecto a lo que se
realiza en la S08?"
**Opción elegida:** *Solo cliente + UI de chat* — la Lambda sigue **stateless**, el hilo vive en el
navegador. Cero recursos AWS nuevos.

---

## 1. Diagnóstico de partida

`ShoppingAssistantFunction` ya aceptaba `history` y lo pasaba a la Converse API, pero **nada lo
alimentaba**:

| Hecho verificado | Evidencia |
|---|---|
| La Lambda es stateless — no persiste nada | no hay `sessionId` ni tabla de conversaciones en `template.full.yaml` |
| **No había UI de chat** | `grep -ril "assistant\|history" frontend/src` → 0 resultados |
| El historial no se truncaba | sin ventana en `_build_messages` |
| La guía solo decía "mandá un segundo turno con `history`" | `GUIA.md` paso 6 (original) |

Es decir: el hilo se mantenía **solo si el operador armaba el array a mano en el `curl`**. No era
reproducible en una demo ni desde el frontend.

### Dos defectos latentes detectados

1. **Fuga del bloque de grounding.** `_build_messages` envuelve el turno actual con
   `CATÁLOGO RELEVANTE:\n…\n\nPREGUNTA DEL CLIENTE: <msg>`. Si el cliente guarda **ese** texto y lo
   reenvía en `history`, cada turno arrastra un catálogo viejo → los `inputTokens` crecen de forma
   **cuadrática** y el modelo razona sobre precios obsoletos.
2. **Sin ventana de contexto.** Historial ilimitado = más tokens de entrada en cada turno y,
   eventualmente, choque con la ventana del modelo.

---

## 2. Archivos creados

| Archivo | Qué es |
|---|---|
| `frontend/src/hooks/useAssistant.ts` | Hook que **mantiene el hilo** en estado de React |
| `frontend/src/components/ChatAssistant.tsx` | UI del chat (panel flotante) |
| `frontend/src/hooks/useAssistant.test.ts` | 9 tests del contrato del hilo |
| `Bitacoras/S08-Edits.md` | este documento |

### `useAssistant.ts` — decisiones

- Exporta `MAX_HISTORY_TURNS = 8` (≈ 4 intercambios). Manda **solo los últimos 8 turnos**:
  `messages.slice(-MAX_HISTORY_TURNS)`.
- Guarda el **mensaje limpio** del usuario, nunca el texto aumentado → evita el defecto (1).
- El mensaje actual va en `message`, **no** dentro de `history` (si no, se duplicaría).
- `history` se mapea a `{ role, text }` únicamente — se descartan `retrieved` y `usage`, que son
  metadata de UI y no deben viajar al modelo.
- **Ante error:** el turno del usuario queda en pantalla (puede reintentar sin reescribirlo) y **no** se
  agrega turno del asistente. → ver §6, riesgo abierto.
- `reset()` limpia el hilo.

### `ChatAssistant.tsx`

Panel flotante (no toca el layout del catálogo), Tailwind + `lucide-react` como el resto del frontend.
Muestra por respuesta el **contexto recuperado** (`retrieved`) y los **tokens** (`usage`), para que el
trade-off RAG↔costo quede visible. Accesibilidad: `role="dialog"`, `role="status"` + `aria-live` en el
spinner, `role="alert"` en errores, `sr-only` en los labels.

---

## 3. Archivos modificados

### Frontend

| Archivo | Cambio |
|---|---|
| `frontend/src/lib/types.ts` | + `interface ChatTurn { role, text }` y `interface AssistantReply { reply, retrieved, model, usage }` |
| `frontend/src/lib/api.ts` | + `VITE_ASSISTANT_URL` en `Window.__ENV`; + const `ASSISTANT_URL` (normaliza slash final); + `assistantEnabled()`; + `askAssistant(message, history)`; log de dev incluye la URL del asistente |
| `frontend/src/App.tsx` | + imports de `ChatAssistant` y `api`; monta `{api.assistantEnabled() && <ChatAssistant />}` |
| `frontend/src/test/setup.ts` | + `VITE_ASSISTANT_URL` en el mock de `window.__ENV` (con slash final, para ejercitar la normalización) |
| `frontend/src/lib/api.test.ts` | + bloque `describe('askAssistant')` — 9 tests |
| `frontend/public/env-config.js.template` | + `VITE_ASSISTANT_URL: '%%VITE_ASSISTANT_URL%%'` |
| `frontend/.env.example` | + `VITE_ASSISTANT_URL` documentada como **opcional** |

**Por qué una segunda URL:** el asistente **no cuelga del router**. Es una Lambda aparte con su propia
Function URL (output `ShoppingAssistantUrl`), así que no se puede derivar de `VITE_API_URL`.

**Degradación elegante:** si `VITE_ASSISTANT_URL` está vacía, `assistantEnabled()` devuelve `false` y el
chat **no se monta**. El frontend sigue funcionando sin S08 desplegado, en vez de fallar con un fetch a
una URL inválida.

**Errores útiles:** `askAssistant` parsea el body de error del handler y propaga el `hint`
(«¿Habilitaste los modelos en Bedrock y corriste `POST /search/index`?»), con fallback al status HTTP si
la respuesta no es JSON.

### Scripts

| Archivo | Cambio |
|---|---|
| `scripts/inject-env.sh` | + flag `-s\|--assistant-url` (opcional); `"None"` → cadena vacía; `sed` con dos sustituciones (`-e`); `usage()` y el resumen actualizados |
| `scripts/deploy-frontend.sh` | lee el output `ShoppingAssistantUrl` con `|| true` (no corta por `set -e` si S08 no está desplegado), normaliza `"None"` → vacío, y lo pasa a `inject-env.sh` |

`"None"` es lo que imprime `aws cloudformation describe-stacks --output text` cuando el output no existe
en el stack — de ahí la normalización en los dos lados.

### Documentación

| Archivo | Cambio |
|---|---|
| `capstone/CLAUDE.md` | **+ sección «⛔ NUNCA editar los archivos de `sessions/SNN-*/`»** (ver §5) |

---

## 4. Archivos de S08 revertidos

A pedido explícito, **todo lo que se había tocado bajo `sessions/S08-bedrock-chatbot/` se revirtió**:

| Archivo | Se había hecho | Estado actual |
|---|---|---|
| `functions/shopping-assistant/app.py` | `MAX_HISTORY_TURNS`, `CONTEXT_HEADER`/`QUESTION_MARKER`, `_clean_turn_text()`, ventana + normalización de alternancia en `_build_messages()` | ✅ **revertido** — verificado con `grep`, sin rastros |
| `template-snippet.yaml` | `ASSISTANT_MAX_HISTORY_TURNS: "8"` | ✅ **revertido** |
| `template.full.yaml` *(no es SXX)* | `ASSISTANT_MAX_HISTORY_TURNS: "8"` | ✅ **sin la variable** — quedaría config muerta sin el `app.py` |

### ⚠️ Pendiente: `GUIA.md` todavía tiene ediciones

**`sessions/S08-bedrock-chatbot/GUIA.md` NO fue revertido.** Se pidió no hacer más cambios que esta
bitácora, así que se deja tal cual y se documenta acá. Lo agregado sigue presente en estas líneas:

| Líneas | Qué se agregó |
|---|---|
| ~56–101 | Sección «🧵 Cómo se mantiene el hilo de la conversación» (+ subsección «⚠️ Dos trampas del historial») |
| ~133–153 | Paso 6 reescrito: `curl` multivuelta concreto con pregunta ambigua |
| ~155–… | Paso 7 nuevo: «(Opcional) Probalo en el frontend» |
| ~190–192 | 3 ítems nuevos en el checklist de validación |
| ~202–204 | 2 conceptos nuevos en «Qué entra en el examen» |

> El ítem `usage` del checklist **no se tocó** — fue marcado `[X]` por el usuario.

**Para revertirlo** hay que eliminar esos cinco bloques. No se hizo automáticamente por la instrucción
de no introducir más cambios.

---

## 5. Regla nueva en `capstone/CLAUDE.md`

Se agregó, antes de «Al agregar una sesión o función»:

> **⛔ NUNCA editar los archivos de `sessions/SNN-*/`** — ni `GUIA.md`, ni `functions/**/app.py`, ni
> `template-snippet.yaml`, ni `terminal.md`, ni las bitácoras. Aplica incluso cuando el cambio parece
> una mejora obvia o un bug real.

Incluye el motivo (cada sesión es el guion de una clase de ~1 h; editarla desincroniza la guía respecto
de lo que ve el alumno) y una tabla de qué hacer en su lugar: reportar el bug y resolverlo **fuera** de
`sessions/` — en `frontend/`, `functions/`, `scripts/`, `docs/` o los `template*.yaml` de la raíz.
Aclara además que los templates de la raíz sí se pueden editar, pero que no hay que meter ahí config que
solo tendría efecto cambiando un `app.py` de sesión, porque quedaría muerta.

---

## 6. Riesgos abiertos (consecuencia de revertir `app.py`)

Las dos protecciones que se habían puesto en el backend **ya no existen**. Una quedó cubierta del lado
del cliente; la otra **no**.

### ✅ Fuga del bloque de grounding — cubierta en el cliente

`useAssistant` guarda el mensaje limpio, así que el frontend nunca reenvía el texto aumentado.
**Pero** un `curl` armado a mano sí puede hacerlo (la guía pide construir `history` manualmente) y ya no
hay `_clean_turn_text()` que lo recorte. Síntoma: `inputTokens` creciendo mucho más rápido de lo
esperado y precios desactualizados en las respuestas.

### ❌ Alternancia de roles — sin cubrir, bug latente

La Converse API exige alternancia estricta `user`/`assistant` y que el primer mensaje sea `user`.
Escenario reproducible **solo con el frontend**:

1. Un turno falla (p. ej. `AccessDeniedException` de Bedrock).
2. `useAssistant` deja el turno `user` en pantalla **sin** turno `assistant` (para poder reintentar).
3. En el siguiente envío, `history` termina en `user`; `app.py` le agrega el `user` actual.
4. → **dos mensajes `user` consecutivos** → se espera `ValidationException`.

*No verificado contra AWS* (es el comportamiento documentado de la Converse API, no se ejecutó el caso).

**Arreglo, cuando se autorice** — en `useAssistant.ts`, al construir `history`, descartar el turno
`user` colgado del final (no en `app.py`, que es SXX):

```ts
const trimmed = messages.slice(-MAX_HISTORY_TURNS);
while (trimmed.length && trimmed[trimmed.length - 1].role !== 'assistant') trimmed.pop();
const history: ChatTurn[] = trimmed.map(({ role, text }) => ({ role, text }));
```

---

## 7. Verificaciones ejecutadas

| Comando | Resultado |
|---|---|
| `npx vitest run` | ✅ **134 tests / 6 archivos**, todos pasan (incluye los 29 preexistentes de `App.test.tsx` → el chat no rompió nada) |
| `npm run typecheck` | ✅ limpio |
| `npm run lint` | ✅ limpio |
| `sam validate --lint -t template.full.yaml` | ✅ *is a valid SAM Template* |
| `bash -n` en los dos scripts | ✅ sintaxis OK |
| `python3 -m py_compile app.py` | ✅ compila (tras revertir) |
| `inject-env.sh` con `-s <url>` | ✅ genera `VITE_ASSISTANT_URL` normalizada (sin slash final) |
| `inject-env.sh` con `-s "None"` | ✅ genera `VITE_ASSISTANT_URL: ''` + avisa «S8 no desplegado» |

La lógica de historial que se había puesto en `app.py` se probó con un script ad-hoc antes de revertir
(leak recortado, ventana en 8+1, historial que arranca con `assistant` normalizado, `user` colgado
descartado, alternancia estricta). **Esa lógica ya no está en el repo.**

> Nada se desplegó a AWS: no se corrió `sam deploy` ni `deploy-frontend.sh`.

---

## 8. Cómo usarlo

```bash
# Deploy completo — deploy-frontend.sh resuelve la URL del asistente solo
bash scripts/deploy-frontend.sh

# Desarrollo local contra el backend desplegado
URL=$(aws cloudformation describe-stacks --stack-name techmoda-ai-diego-pina --region us-east-1 \
  --query "Stacks[0].Outputs[?OutputKey=='ShoppingAssistantUrl'].OutputValue" --output text)
cp frontend/.env.example frontend/.env     # si no existe
echo "VITE_ASSISTANT_URL=$URL" >> frontend/.env
cd frontend && npm run dev
```

El botón **«Asistente»** aparece abajo a la derecha. Requiere S07 indexado
(`POST /search/index`) o el retrieval vuelve vacío.

---

## 9. Concepto AIF-C01 que queda expuesto (D2 + D3)

El diseño client-side no es un atajo: hace **visible** que los foundation models **no tienen memoria**.
El contexto se reenvía completo en cada turno y por eso se paga en tokens de entrada — el `usage` que
muestra el chat sube a medida que crece el historial. Es el mismo trade-off que `TOP_K`: más contexto =
mejor respuesta, más costo y más latencia.

En producción el historial se persiste (DynamoDB + `sessionId` + **TTL**) o se delega a **Bedrock
Agents**, que gestiona la sesión. Esa era la opción «server-side» descartada para esta iteración.
