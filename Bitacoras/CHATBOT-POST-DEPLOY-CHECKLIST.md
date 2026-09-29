# ✅ ChatBot S8 - Post-Deploy Verification Checklist

## Fase 1: Verificación del Deploy

**Comando de estado:**
```bash
aws cloudformation describe-stacks --stack-name techmoda-ai-diego-pina \
  --region us-east-1 --query "Stacks[0].StackStatus" --output text
```

**Esperado:** `UPDATE_COMPLETE` o `CREATE_COMPLETE`

- [ ] CloudFormation stack status = `UPDATE_COMPLETE`
- [ ] No hay `ROLLBACK_*` status
- [ ] Todas las Lambdas en estado `Active`

---

## Fase 2: Verificación de Conectividad Directa

### Test S8 desde CLI (sin navegador)

```bash
curl -X POST https://i4ishcqwb3jjopqhpwbevj5yxi0mxqlb.lambda-url.us-east-1.on.aws/assistant \
  -H "Content-Type: application/json" \
  -d '{"message":"test","history":[]}'
```

**Esperado:**
```json
{
  "reply": "...",
  "retrieved": [...],
  "model": "us.anthropic.claude-haiku-4-5-20251001-v1:0",
  "usage": {...}
}
```

- [ ] Status HTTP = 200
- [ ] Response válido JSON
- [ ] Campo `reply` no vacío
- [ ] Campo `retrieved` tiene objetos con `productId` y `name`
- [ ] Campo `usage` muestra tokens consumidos

### Verificar Headers CORS (NO duplicados)

```bash
curl -I -X POST https://i4ishcqwb3jjopqhpwbevj5yxi0mxqlb.lambda-url.us-east-1.on.aws/assistant \
  -H "Origin: https://dk5812p03o32t.cloudfront.net" \
  -H "Content-Type: application/json"
```

**Esperado:**
```
access-control-allow-origin: *
(solo UNA línea, no duplicada)
```

- [ ] Un solo `access-control-allow-origin` header
- [ ] Valor = `*`
- [ ] NO hay duplicados

---

## Fase 3: Verificación en Navegador

### 1. Configuración del Frontend

**En `frontend/.env`:**
```env
VITE_API_URL=https://ztlckzl7n5h2e44bho5ip4dwly0tnbse.lambda-url.us-east-1.on.aws
VITE_ASSISTANT_URL=https://i4ishcqwb3jjopqhpwbevj5yxi0mxqlb.lambda-url.us-east-1.on.aws
```

- [ ] `.env` existe
- [ ] `VITE_API_URL` correcto
- [ ] `VITE_ASSISTANT_URL` correcto

### 2. Test en Navegador

**URL:** `https://dk5812p03o32t.cloudfront.net`

1. **Hard refresh:** `Ctrl+Shift+R` (Windows/Linux) o `Cmd+Shift+R` (Mac)

- [ ] Frontend carga sin errores

2. **DevTools → Console**
   ```javascript
   window.__ENV
   ```
   
   - [ ] Devuelve objeto con ambas URLs
   - [ ] `VITE_ASSISTANT_URL` NO es vacío

3. **Interfaz visible:**
   - [ ] Botón azul "Asistente" aparece en esquina inferior derecha
   - [ ] Al hacer click, abre panel chat (384px, z-40)
   - [ ] Header azul dice "Asistente TechModa"
   - [ ] Botones de reinicio (↻) y cerrar (×) visibles

### 3. Test de Interacción

**En el chat, escribe:** `busco algo blanco y elegante`

- [ ] Mensaje del usuario aparece en el panel
- [ ] **NO hay error rojo `Failed to fetch`**
- [ ] Indicador de carga (spinner) aparece
- [ ] Asistente responde con texto
- [ ] Respuesta incluye grounding: "Contexto: Producto1 · Producto2 · Producto3"
- [ ] Tokens mostrados: "XXX in / YYY out"
- [ ] Historial se mantiene en el panel

### 4. Test de Historial

**Escribe otro mensaje:** `¿cuál es el más barato?`

- [ ] Historial PREVIO sigue visible
- [ ] Nuevo mensaje + respuesta se agregan
- [ ] NO hay duplicados de mensajes
- [ ] Scroll automático al último mensaje

### 5. Test de Reinicio

**Click botón ↻ (reinicio)**

- [ ] Historial se limpia
- [ ] Panel vuelve al estado inicial ("¿Qué estás buscando?")
- [ ] Próxima conversación es fresca

### 6. Test de Cierre/Apertura

**Click botón × (cerrar)**

- [ ] Panel se cierra
- [ ] Botón "Asistente" vuelve a aparecer
- [ ] **Click nuevamente en botón**
  - [ ] Panel se abre
  - [ ] Historial ANTERIOR se mantiene (no perdido)

---

## Fase 4: Verificación de Performance

### Latencia

- [ ] Primer turno: < 5 segundos (incluye Bedrock + embeddings)
- [ ] Turnos posteriores: < 3 segundos
- [ ] NO hay timeouts

### Tokens

- [ ] `inputTokens` crece lentamente (no exponencial)
- [ ] `outputTokens` es razonable (~100-200 por respuesta)
- [ ] Total visible en cada turno

### Errores en Console

**DevTools → Console**

- [ ] SIN errores rojos
- [ ] Warnings aceptables (deprecation, etc. OK)

---

## Fase 5: Verificación de Integraciones

### S7 (Embeddings) funcional

```bash
curl "https://5zvtebxo6zypzci2tgdn4nrszm0qlgtn.lambda-url.us-east-1.on.aws/search?q=blanco"
```

- [ ] Retorna al menos 3 productos relevantes
- [ ] Scores semánticos entre 0 y 1

### API Router (S0) funcional

```bash
curl "https://ztlckzl7n5h2e44bho5ip4dwly0tnbse.lambda-url.us-east-1.on.aws/products"
```

- [ ] Retorna lista de productos
- [ ] Chat puede acceder al catálogo

### Bedrock habilitado

En navegador, chat responde normalmente:
- [ ] No hay error "AccessDenied"
- [ ] No hay error "Model not found"
- [ ] Modelo carga sin problema

---

## Fase 6: Casos Edge

### Consulta sin resultados

**Chat:** `busco un traje de astronauta`

- [ ] Asistente responde con honestidad
- [ ] NO inventa productos
- [ ] Sugiere refinar búsqueda

### Historial largo

**Haz 10 turnos de conversación**

- [ ] Primeros turnos permanecen visibles
- [ ] Últimos 8 turnos se reenvían al backend (MAX_HISTORY_TURNS)
- [ ] Sin crash
- [ ] Performance aceptable

### Mensajes especiales

**Chat:** `@#$%^&*()` o emojis: `😀 ¿qué hay?`

- [ ] Asistente lo maneja gracefully
- [ ] NO hay error de parsing
- [ ] Respuesta razonable

---

## Fase 7: Documentación & Logs

### CloudWatch Logs

```bash
aws logs tail /aws/lambda/techmoda-ai-diego-pina-ShoppingAssistant --since 10m
```

- [ ] Logs muestran invocaciones exitosas
- [ ] Duración < 5 segundos
- [ ] SIN excepciones

### Session Log

- [ ] Esta bitácora actualizada con resultado final
- [ ] Timestamp de completación

---

## 🎉 Criterio de Éxito

**ALL checks MUST be checked ✓ para pasar.**

Si algún check falla:
1. Nota el número de check
2. Describe el error
3. Consulta la sección "Troubleshooting" en `ChatBot-S08-Frontend-Integration-Troubleshooting.md`

---

## 📝 Resultado Final

**Fecha de verificación:** ____________________  
**Verificado por:** ____________________  
**Estado:** 
- [ ] ✅ PASS - Chatbot operativo
- [ ] ⚠️  WARN - Funcionando con limitaciones (especificar)
- [ ] ❌ FAIL - Bloqueado en check #____ (especificar)

**Notas adicionales:**
```
(espacio para comentarios)
```

---

## 🔗 URLs Relevantes

- **Frontend:** https://dk5812p03o32t.cloudfront.net
- **API Router:** https://ztlckzl7n5h2e44bho5ip4dwly0tnbse.lambda-url.us-east-1.on.aws
- **S8 Assistant:** https://i4ishcqwb3jjopqhpwbevj5yxi0mxqlb.lambda-url.us-east-1.on.aws/assistant
- **S7 Search:** https://5zvtebxo6zypzci2tgdn4nrszm0qlgtn.lambda-url.us-east-1.on.aws/search

---

**Última actualización:** 2026-09-23 20:50 UTC
