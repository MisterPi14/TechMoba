> 🔑 **Requisito externo — Bedrock Model access.** El rol de esta Lambda ya trae
> `bedrock:InvokeModel` acotado por ARN de modelo, pero el permiso IAM **no alcanza**: hay que
> habilitar el modelo en la consola (**Bedrock → Model access**), en **la región del deploy**
> — es un setting por región. Si la llamada devuelve `AccessDeniedException`, ese es el primer
> sospechoso, no las políticas IAM. Detalle en [`docs/IAM.md`](../../docs/IAM.md).

# S8 · Asistente de compras (chatbot RAG + prompt engineering)

**Duración:** ~60 min · **Servicio:** Amazon Bedrock · **Dominio AIF-C01:** **D2 (24%) + D3 (28%)**

> 🔥 **Sesión cumbre.** Junta todo lo generativo: prompt engineering (D2) + RAG (D3) = el **52%** del examen en una sola feature.

> 🔌 **Cómo se expone:** esta función tiene su propia **Lambda Function URL** (no API Gateway) y un
> **rol de mínimo privilegio que SAM le crea** a partir de sus `Policies:` — ver
> [`docs/IAM.md`](../../docs/IAM.md). Su URL es el output **`ShoppingAssistantUrl`** del stack.

---

## 🎯 Objetivo

Construir el **asistente de compras conversacional** de TechModa. El cliente escribe en lenguaje natural
("busco algo para una boda de día, presupuesto medio") y el asistente recomienda productos **reales del
catálogo**, conversando con memoria del historial. Lo clave: **no inventa** — sus respuestas están ancladas
(grounded) en los productos recuperados por embeddings.

Este es el patrón **RAG completo**: *Retrieval* (S7) + *Augmented Generation* (S6).

---

## 🧩 Prerequisitos

- **S7 completada y el índice construido** (`POST /search/index`). El asistente recupera sobre esos embeddings.
- 🔑 **Acceso a dos modelos** en Bedrock (us-east-1): el de **embeddings** (Titan) y el de **generación** (Claude Haiku).

---

## 🧠 El concepto: RAG y por qué evita alucinaciones

Un FM por sí solo "sabe" lo que vio en su entrenamiento — **no conoce el catálogo de TechModa** ni los
precios de hoy. Si le preguntás por productos, **alucinaría**. RAG resuelve esto en tres pasos:

1. **Retrieval (recuperar):** embebemos la consulta y traemos los `TOP_K` productos más relevantes (S7).
2. **Augment (aumentar):** inyectamos esos productos como **contexto** en el prompt.
3. **Generation (generar):** el FM responde **usando solo ese contexto**, guiado por un *system prompt*
   estricto ("recomendá ÚNICAMENTE productos del catálogo; no inventes").

### Piezas de prompt engineering que vas a ver en el código
- **System prompt:** define rol, idioma, tono y **reglas duras** (no inventar). Es la barrera principal
  contra alucinaciones a nivel de prompt.
- **Grounding/contexto:** el bloque "CATÁLOGO RELEVANTE" con los productos recuperados.
- **Historial de conversación:** se pasan los turnos previos a la **Converse API** → memoria multivuelta.
- **Temperatura baja (0.5):** queremos respuestas fieles al contexto, no demasiado creativas.

---

## 🧵 Cómo se mantiene el hilo de la conversación

**La Lambda es *stateless*: no guarda nada entre invocaciones.** Esto no es un olvido del diseño — es
cómo funcionan los foundation models, y es **concepto de examen**: un FM no tiene memoria, así que el
contexto **se reenvía completo en cada turno** (y por eso se paga en tokens de entrada).

El hilo lo mantiene **el cliente**, que acumula los turnos y los manda en `history`:

```
turno 1   cliente: { message: "busco tenis", history: [] }
          Lambda:  retrieval + generación → reply
          cliente: guarda [user:"busco tenis", assistant:reply]

turno 2   cliente: { message: "¿y algo abrigado?", history: [los 2 turnos] }
                                                            ^ acá vive la memoria
```

En el frontend eso es [`useAssistant`](../../frontend/src/hooks/useAssistant.ts) (estado de React) y la
UI es [`ChatAssistant`](../../frontend/src/components/ChatAssistant.tsx). Con `curl` el que acumula sos vos.

### ⚠️ Dos trampas del historial (están resueltas en el código, entendé por qué)

**1. No reenviar el texto aumentado.** La Lambda envuelve tu mensaje con el bloque de grounding:

```
CATÁLOGO RELEVANTE:
- Tenis blancos minimalistas | precio: 74.5 | ...

PREGUNTA DEL CLIENTE: busco tenis
```

Si guardás **ese** texto en `history`, cada turno arrastra un catálogo viejo: los `inputTokens` crecen de
forma **cuadrática** y el modelo razona sobre precios obsoletos. El historial guarda el mensaje **limpio**.
`_clean_turn_text()` en `app.py` lo recorta por si el cliente se equivoca.

**2. Ventana de contexto.** Un historial sin límite encarece cada llamada y termina chocando con la
ventana del modelo. Se reenvían los últimos **`ASSISTANT_MAX_HISTORY_TURNS`** (default `8` ≈ 4
intercambios). Es el **mismo trade-off que `TOP_K`**: más contexto = mejor respuesta, más tokens, más costo.

> 🧠 **La Converse API exige alternancia estricta** `user`/`assistant` y que el primer mensaje sea `user`.
> Un historial que arranca con `assistant`, o que deja un `user` colgado sin respuesta, falla con
> `ValidationException`. `_build_messages()` normaliza los dos casos.

> 🗄️ **En producción** el historial no vive en el navegador: se persiste con un `sessionId` en DynamoDB
> (con **TTL** para que expire) o se delega a **Bedrock Agents**, que gestiona la sesión por vos. Acá lo
> mantenemos del lado del cliente para que se vea **explícitamente** que el FM no tiene memoria propia.

> 🧠 **RAG vs. fine-tuning (entra en el examen):** para "que el modelo conozca MIS datos actuales", **RAG**
> es preferible a *fine-tuning* cuando los datos cambian seguido (catálogo): no reentrenás, solo actualizás
> el índice. *Fine-tuning* sirve para enseñar **estilo/formato/tarea**, no para datos frescos.

---

## 🚶 Paso a paso

1. Asegurate de tener el índice de S7 (`POST /search/index` vía la Function URL de `IndexEmbeddings`).
2. Pegá `ShoppingAssistantFunction` (trae sus `Policies:` — `DynamoDBReadPolicy`, porque sólo consulta — + su `FunctionUrlConfig`) + el output `ShoppingAssistantUrl` desde el snippet.
3. `sam build && sam deploy`.
4. Conversá (Function URL de esta función):
```bash
URL=$(aws cloudformation describe-stacks --stack-name techmoda-ai --region us-east-1 \
  --query "Stacks[0].Outputs[?OutputKey=='ShoppingAssistantUrl'].OutputValue" --output text)
curl -s -X POST "${URL%/}/assistant" \
  -H "Content-Type: application/json" \
  -d '{"message":"Busco algo cómodo y blanco para caminar todo el día"}' | python3 -m json.tool
```
Respuesta esperada:
```json
{
  "reply": "Para caminar cómodo te recomiendo los Tenis blancos minimalistas ($74.50): suela de goma y diseño limpio que combina con todo. ¿Querés que te muestre opciones para clima frío también?",
  "retrieved": [{"productId":"...","name":"Tenis blancos minimalistas"}],
  "model": "anthropic.claude-haiku-4-5-20251001-v1:0",
  "usage": {"inputTokens": 210, "outputTokens": 58, "totalTokens": 268}
}
```
5. **Probá el grounding:** preguntá por algo que NO está en el catálogo ("¿venden relojes?"). El asistente
   debería decir honestamente que no, **sin inventar** un reloj.
6. **Probá la memoria multivuelta.** Segundo turno reenviando el intercambio previo en `history`. Fijate
   que la pregunta es **ambigua a propósito** ("¿y algo más abrigado?"): sin historial el asistente no
   tiene idea de qué hablás.

```bash
curl -s -X POST "${URL%/}/assistant" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "¿Y algo más abrigado para el invierno?",
    "history": [
      {"role": "user",      "text": "Busco algo cómodo y blanco para caminar todo el día"},
      {"role": "assistant", "text": "Para caminar cómodo te recomiendo los Tenis blancos minimalistas ($74.50)."}
    ]
  }' | python3 -m json.tool
```

   ✅ Mantiene el hilo: entiende que seguís buscando ropa y recomienda la chaqueta.
   ❌ Sin `history`: responde genérico o pregunta "¿más abrigado que qué?".

   > ⚠️ En `history` va el mensaje **limpio** del usuario, **no** el texto con el bloque
   > `CATÁLOGO RELEVANTE`. Ver "Dos trampas del historial" más arriba.

7. **(Opcional) Probalo en el frontend.** Hay un chat que mantiene el hilo por vos, en vez de armar
   `history` a mano. Necesita la Function URL del asistente, que **no** es la del router:

```bash
# Deploy completo: deploy-frontend.sh ya lee el output ShoppingAssistantUrl solo.
bash scripts/deploy-frontend.sh

# Desarrollo local: agregá la URL a frontend/.env
echo "VITE_ASSISTANT_URL=$URL" >> frontend/.env
cd frontend && npm run dev
```

   El botón **«Asistente»** aparece abajo a la derecha. Si `VITE_ASSISTANT_URL` no está configurada, el
   chat simplemente **no se monta** (así el frontend sigue funcionando sin S8 desplegado).

   Cada respuesta muestra el **contexto recuperado** (qué productos se usaron) y los **tokens** — mandá
   varios turnos y vas a ver `inputTokens` subir a medida que el historial crece.

---

## 🔐 Mínimo privilegio

- **Solo lectura** de la tabla (`DynamoDBReadPolicy`) — el asistente no escribe.
- `bedrock:InvokeModel` acotado a **los modelos exactos** (embeddings + generación + inference profile),
  region wildcard `us-*`. **Nada de `bedrock:*` ni `Resource:"*"`.**

---

## ✅ Checklist de validación

- [X] El asistente recomienda un producto **real** del catálogo y cita su precio correcto.
- [X] `retrieved` muestra los productos que se usaron como contexto.
- [X] Ante una consulta fuera de catálogo, **no inventa** y lo dice.
- [X] Pasar `history` mantiene el hilo de la conversación.
- [X] `usage` reporta tokens (entrada crece con el contexto recuperado → relación RAG↔costo).
- [ ] Una pregunta **ambigua** ("¿y algo más abrigado?") se entiende **con** `history` y no sin él.
- [ ] Sabés explicar **por qué** la Lambda es stateless y quién mantiene el hilo.
- [ ] (Opcional) El chat del frontend mantiene la conversación sin armar `history` a mano.

---

## 📝 Qué entra en el examen (D2 + D3)

- **RAG**: definición, los 3 pasos, y por qué reduce alucinaciones.
- **RAG vs. fine-tuning vs. prompt engineering**: cuándo cada uno (datos frescos → RAG; estilo/tarea → fine-tuning; ajuste rápido → prompting).
- **System prompt, grounding, contexto, temperatura, multivuelta**.
- **Converse API** y mensajes con roles user/assistant (alternancia estricta, primer turno `user`).
- **Los FM no tienen memoria**: el estado conversacional lo mantiene la aplicación reenviando el
  historial; en producción se persiste (DynamoDB + `sessionId` + TTL) o se delega a **Bedrock Agents**.
- **Ventana de contexto** y su costo: historial largo = más tokens de entrada en **cada** turno.
- **Costo de RAG**: más contexto recuperado = más tokens de entrada = más costo/latencia. Trade-off `TOP_K`.
- **Agentes / chatbots** como aplicación estrella de foundation models.

---

## 💸 Costo + 🧹 Cleanup

**Costo:** cada turno hace **1 embedding (barato) + 1 generación (según modelo)**. El contexto recuperado
suma tokens de **entrada**: a mayor `TOP_K`, mayor costo. Conversaciones de práctica = **centavos**, pero un
chatbot en bucle puede acumular. *Verificar precios por modelo en Amazon Bedrock.*
👉 Mantené `TOP_K=3`, `maxTokens` acotado y un modelo pequeño (Haiku) para practicar.

**Cleanup de S8:** quitar `ShoppingAssistantFunction` + ruta del `template.yaml` y `sam deploy`.
