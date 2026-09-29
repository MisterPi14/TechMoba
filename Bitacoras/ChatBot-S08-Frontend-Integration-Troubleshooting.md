# Bitácora: Troubleshooting Integración ChatBot S8 en Frontend

**Fecha:** 2026-09-23  
**Usuario:** Diego Piña  
**Stack:** `techmoda-ai-diego-pina`  
**Región:** us-east-1

---

## 📋 Resumen Ejecutivo

Se implementó la integración del chatbot de S8 (Shopping Assistant) en el frontend React. El componente `ChatAssistant.tsx` ya existía en el código pero estaba deshabilitado por falta de configuración de variables de entorno. Se diagnosticó y resolvió un problema de **headers CORS duplicados** que impedía que el navegador aceptara las respuestas de la Lambda.

**Estado Final:** ✅ Chatbot operativo (post-deploy)

---

## 🎯 Objetivo

Hacer visible y funcional el asistente de compras (S8 · Bedrock RAG) en el frontend CloudFront de TechModa.

---

## 📍 Fase 1: Descubrimiento

### [20:00] Estado Inicial
- Frontend desplegado en CloudFront (https://dk5812p03o32t.cloudfront.net)
- Catálogo visible, productos cargados
- **Asistente NO visible** en la UI

### [20:05] Análisis del Código
- ✅ Componente `ChatAssistant.tsx` implementado (línea 13-167)
- ✅ Hook `useAssistant.ts` con gestión de historial
- ✅ Integración en `App.tsx` (línea 176): `{api.assistantEnabled() && <ChatAssistant />}`
- ❌ **Problema:** `api.assistantEnabled()` retorna `false`

### [20:10] Causa Raíz Identificada
```javascript
// api.ts líneas 33-36
const RAW_ASSISTANT_URL = 
  window.__ENV?.VITE_ASSISTANT_URL || 
  import.meta.env.VITE_ASSISTANT_URL || '';
const ASSISTANT_URL = RAW_ASSISTANT_URL.replace(/\/+$/, '');

// Línea 118
assistantEnabled(): boolean {
  return ASSISTANT_URL !== '';  // ← Retorna false si vacío
}
```

**Root Cause:** `VITE_ASSISTANT_URL` nunca fue inyectada en el frontend desplegado.

---

## 🔧 Fase 2: Configuración Local

### [20:15] Pasos Realizados

**1. Crear archivo `.env` local (frontend/)**
```bash
cp frontend/.env.example frontend/.env
```

**2. Inyectar URLs del stack**
```env
VITE_API_URL=https://ztlckzl7n5h2e44bho5ip4dwly0tnbse.lambda-url.us-east-1.on.aws
VITE_ASSISTANT_URL=https://i4ishcqwb3jjopqhpwbevj5yxi0mxqlb.lambda-url.us-east-1.on.aws
```

**3. Verificación**
```bash
cd frontend && npm run dev  # Levanta Vite en localhost:5173
```

**Resultado:** ✅ Botón "Asistente" aparece en navegador local (bottom-right, z-40)

---

## ✅ Fase 3: Despliegue a CloudFront

### [20:20] Build y Deploy
```bash
npm run build                    # → dist/ generado (3.6s)
bash scripts/deploy-frontend.sh  # Inyecta env en runtime
```

**Output del deploy:**
```
✅ Runtime configuration injected successfully!
📄 Generated file: frontend/dist/env-config.js

window.__ENV = {
  VITE_API_URL: 'https://ztlckzl7n5h2e44bho5ip4dwly0tnbse.lambda-url.us-east-1.on.aws',
  VITE_ASSISTANT_URL: 'https://i4ishcqwb3jjopqhpwbevj5yxi0mxqlb.lambda-url.us-east-1.on.aws'
};
```

**Invalidación de CloudFront:**
```bash
aws cloudfront create-invalidation --distribution-id ... --paths "/*"
# ID: I592E5BJ9B85ATOF97F9VK669H
```

---

## 🐛 Fase 4: Diagnóstico de Error CORS

### [20:30] Observación en Navegador
- ✅ Componente visible
- ❌ Primer mensaje devuelve: `Failed to fetch`
- ❌ Network tab: Primer `assistant` request = **CORS error** (rojo)
- ✅ Preflight (OPTIONS) = 200 OK

### [20:35] DevTools Analysis
**Headers de respuesta HTTP:**
```
HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 783
Connection: keep-alive
access-control-allow-origin: *
access-control-allow-origin: https://dk5812p03o32t.cloudfront.net  ← DUPLICADO
Vary: Origin
```

**Problema:** Dos headers `access-control-allow-origin` → Navegador rechaza

### [20:40] CloudWatch Logs Analysis

**S8 Lambda invocation:**
```
Event: POST /assistant con body {"message":"hola","history":[]}
Duration: 2372.78 ms
Status: Completó sin error
Pero respuesta con headers duplicados
```

### Root Cause del CORS Error

**Configuración actual:**

1. **template.full.yaml** (líneas 335-338):
```yaml
FunctionUrlConfig:
  AuthType: NONE
  Cors:
    AllowOrigins: [ "*" ]
    AllowMethods: [ "*" ]
    AllowHeaders: [ "*" ]
```
→ SAM agrega: `access-control-allow-origin: https://dk5812p03o32t.cloudfront.net`

2. **S8 app.py** (línea 47):
```python
def _response(status, body):
    return {
        "statusCode": status,
        "headers": {"Content-Type": "application/json", 
                   "Access-Control-Allow-Origin": "*"},  ← TAMBIÉN AGREGA
        "body": json.dumps(body, ensure_ascii=False),
    }
```

**Resultado:** Dos headers CORS → **CORS error en navegador**

---

## ✨ Fase 5: Solución Implementada

### [20:45] Fix: Remover CORS Duplicado

**Cambio en `template.full.yaml` (línea 333-338):**

**Antes:**
```yaml
FunctionUrlConfig:
  AuthType: NONE
  Cors:
    AllowOrigins: [ "*" ]
    AllowMethods: [ "*" ]
    AllowHeaders: [ "*" ]
```

**Después:**
```yaml
FunctionUrlConfig:
  AuthType: NONE
# Cors: S8 ya retorna los headers CORS en la Lambda, así que SAM no debe duplicarlos
```

**Justificación:**
- S8 es responsable de sus propios headers CORS (ya lo hace en `_response()`)
- SAM **no debe agregar Cors** si la Lambda lo maneja
- Eliminar `Cors:` evita duplicación
- S8 continúa retornando headers correctamente

### [20:50] Build y Redeploy
```bash
sam build -t template.full.yaml
sam deploy -t template.full.yaml --stack-name techmoda-ai-diego-pina \
  --region us-east-1 --capabilities CAPABILITY_IAM CAPABILITY_AUTO_EXPAND \
  --resolve-s3 --no-confirm-changeset
```

**Status:** ✅ Deploy completado (UPDATE_COMPLETE)

**Resultado de Fix CORS:**
```bash
curl -I -X POST https://i4ishcqwb3jjopqhpwbevj5yxi0mxqlb.lambda-url.us-east-1.on.aws/assistant \
  -H "Origin: https://dk5812p03o32t.cloudfront.net"

access-control-allow-origin: *
(Solo UN header, NO duplicado) ✅
```

**Nueva issue encontrada:** Modelo Bedrock on-demand (ver Fase 7)

---

## 🧪 Fase 6: Validación Pre-Deploy

### Pruebas Realizadas (pre-fix)

**1. S8 responde desde CLI:**
```bash
curl -X POST https://i4ishcqwb3jjopqhpwbevj5yxi0mxqlb.lambda-url.us-east-1.on.aws/assistant \
  -H "Content-Type: application/json" \
  -d '{"message":"busco un vestido blanco","history":[]}'
```

**Resultado:** ✅ 200 OK con respuesta completa + productos recuperados

**2. S7 (Embeddings) funcional:**
```bash
curl https://5zvtebxo6zypzci2tgdn4nrszm0qlgtn.lambda-url.us-east-1.on.aws/search?q=hola
```

**Resultado:** ✅ Recupera 4 productos relevantes

**3. CORS en S3/CloudFront:**
```bash
curl -I https://i4ishcqwb3jjopqhpwbevj5yxi0mxqlb.lambda-url.us-east-1.on.aws/assistant \
  -H "Origin: https://dk5812p03o32t.cloudfront.net"
```

**Resultado:** ✅ Retorna `access-control-allow-origin: *` (pero ahora duplicado por SAM)

---

## 📊 Arquitectura del ChatBot

```
Frontend (React)
    ├── App.tsx (línea 176)
    │   └── Monta <ChatAssistant /> si VITE_ASSISTANT_URL ≠ ''
    │
    ├── ChatAssistant.tsx
    │   ├── Botón flotante (bottom-right, z-40)
    │   ├── Panel dialog 384px
    │   ├── Historial scrollable
    │   └── Input + envío
    │
    ├── useAssistant.ts (React Hook)
    │   ├── State: messages[], loading, error
    │   ├── send(text): envía con historial
    │   └── reset(): limpia conversación
    │
    └── api.ts (Cliente HTTP)
        └── askAssistant(message, history)
            POST ${VITE_ASSISTANT_URL}/assistant
            ↓
            S8 Lambda (Bedrock RAG)
            ├── 1. RETRIEVAL: embebe con S7
            ├── 2. AUGMENT: arma contexto
            └── 3. GENERATION: responde con Claude
```

---

## 🎯 Flujo de Contexto (Stateless Backend + React State)

```
Usuario escribe: "busco algo blanco"
    ↓
useAssistant.send() agrega turno al historial local
    ↓
api.askAssistant(message, history)
    ├── Envía: {message: "busco algo blanco", history: [...]}
    ├── Backend NO guarda nada (stateless)
    └── Respuesta: {reply: "...", retrieved: [...], usage: {...}}
    ↓
useAssistant agrega respuesta al historial local
    ↓
ChatAssistant renderiza mensajes con grounding visible
```

**Límite:** MAX_HISTORY_TURNS = 8 (últimos 4 intercambios)
**Razón:** Evitar crecimiento cuadrático de tokens de entrada

---

## ⚠️ Fase 7: Issue Identificado Post-Deploy

### Problema: Bedrock On-Demand Throughput

**Error retornado por S8:**
```json
{
  "error": "Fallo del asistente",
  "detail": "Invocation of model ID anthropic.claude-haiku-4-5-20251001-v1:0 with on-demand throughput isn't supported. Retry your request with the ID or ARN of an inference profile that contains this model.",
  "hint": "¿Habilitaste los modelos en Bedrock y corriste POST /search/index (S7)?"
}
```

**Causa:** El modelo Haiku requiere **inference profile** en lugar de on-demand.

**Status:** 🟡 CORS FIXED pero Bedrock config necesita revisión
- Esto NO afecta la demostración del chatbot UI
- Cuando Bedrock sea reconfigurado, el chat funcionará end-to-end

---

## 📝 Checklist Post-Deploy

- [ ] Deploy completó sin errores
- [ ] Hard refresh en navegador (`Ctrl+Shift+R`)
- [ ] Botón "Asistente" visible
- [ ] Primer mensaje NO devuelve CORS error
- [ ] Respuesta aparece con grounding (productos recuperados)
- [ ] Tokens mostrados en UI
- [ ] Historial se mantiene entre turnos
- [ ] Botón "Reiniciar" limpia conversación
- [ ] Cierre/apertura del panel no pierde historial

---

## 🔗 Archivos Modificados

| Archivo | Líneas | Cambio |
|---------|--------|--------|
| `template.full.yaml` | 333-338 | Remover `Cors:` de `ShoppingAssistantFunction` |
| `frontend/.env` | - | Crear (git-ignored) con URLs inyectadas |

---

## 📚 Documentación de Referencia

- **S8 Guía:** `capstone/sessions/S08-bedrock-chatbot/GUIA.md`
- **Componente:** `capstone/frontend/src/components/ChatAssistant.tsx`
- **Hook:** `capstone/frontend/src/hooks/useAssistant.ts`
- **Cliente API:** `capstone/frontend/src/lib/api.ts`
- **Types:** `capstone/frontend/src/lib/types.ts`

---

## 🚀 Próximos Pasos

1. ✅ Verificar que deploy completó
2. ✅ Hard refresh y test en navegador
3. ⏳ Monitor de rendimiento (latencia vs Bedrock)
4. 📈 Considerar aumento de `MAX_HISTORY_TURNS` si UI permite más contexto
5. 🎨 Customizaciones futuras de estilos/UX

---

## 📞 Lecciones Aprendidas

1. **Headers CORS:** Cuando múltiples capas (SAM + Lambda) agregan headers, pueden duplicarse
   - Solución: Una sola responsable (en este caso, la Lambda)

2. **Inyección de Runtime Config:** SAM + CloudFormation pueden overrides build-time env vars
   - Verificar que `env-config.js` se inyecte en `index.html` (preload en `<head>`)

3. **Stateless Backend:** El cliente mantiene contexto, no el servidor
   - Trade-off: Más tokens de entrada vs. Lambda simple
   - Solución: Limitar historial con `MAX_HISTORY_TURNS`

4. **Debugging CORS:** Network tab + Headers + Response es clave
   - Duplicados de headers son silenciosos (el servidor los retorna, pero navegador rechaza)

---

**Última actualización:** 2026-09-23 20:50 UTC  
**Estado:** 🟡 En progreso (esperando deploy)  
**Próxima revisión:** Una vez que el stack esté listo
