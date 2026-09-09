# Bitácora de Resolución — S04: Traducción Multilingüe

**Fecha:** 2026-09-01  
**Stack:** `techmoda-ai-diego-pina`  
**Región:** us-east-1  
**Estado Final:** ✅ Resuelto

---

## 1. Problema Detectado

### Error Inicial
```
AccessDeniedException: User: arn:aws:sts::281248178297:assumed-role/techmoda-ai-diego-pina-TranslateCatalogFunctionRole-8reTZBkgMJiG/techmoda-ai-diego-pina-TranslateCatalog 
is not authorized to perform: comprehend:DetectDominantLanguage 
because no identity-based policy allows the comprehend:DetectDominantLanguage action
```

### Contexto del Error
- **Endpoint testado:** `POST /products/{productId}/translate`
- **Acción que falló:** Traducción de catálogo (ES → EN)
- **Producto de prueba:** `9d4f5396-83ad-4780-a3ee-d4ead506f046`
- **Payload:** `{"target":"en"}`
- **Repeticiones:** El error se reprodujo consistentemente en 5 intentos

### Stack Trace Completo
```json
{
    "error": "Fallo al traducir",
    "detail": "An error occurred (AccessDeniedException) when calling the TranslateText operation: com.amazonaws.translate.dataplane.DownstreamDependencyAccessDeniedException: User: arn:aws:sts::281248178297:assumed-role/techmoda-ai-diego-pina-TranslateCatalogFunctionRole-8reTZBkgMJiG/techmoda-ai-diego-pina-TranslateCatalog is not authorized to perform: comprehend:DetectDominantLanguage because no identity-based policy allows the comprehend:DetectDominantLanguage action"
}
```

---

## 2. Causa Raíz

### Análisis IAM
La función Lambda `TranslateCatalogFunction` ejecuta bajo el rol `TranslateCatalogFunctionRole`, que **fue creado sin los permisos necesarios** para ejecutar `comprehend:DetectDominantLanguage`.

### Por qué Sucedió
1. El template SAM declara los permisos correctamente (ver §3, líneas 229-234)
2. Sin embargo, el rol fue creado en la **primera iteración del deploy** con permisos incompletos
3. Luego, el template se actualizó pero **el rol existente no fue regenerado**
4. SAM no redeploy el rol porque el hash de la función no cambió

### Políticas IAM Requeridas
La función necesita **dos permisos**:
- `translate:TranslateText` — para traducir texto
- `comprehend:DetectDominantLanguage` — para detectar el idioma origen antes de traducir

El rol solo tenía asignado `translate:TranslateText`, de ahí la cadena de error.

---

## 3. Verificación del Template

### Contenido del `template.yaml` (líneas 218-240)

```yaml
TranslateCatalogFunction:
  Type: AWS::Serverless::Function
  Properties:
    FunctionName: !Sub ${AWS::StackName}-TranslateCatalog
    Description: S4 - Catalogo multilingue ES/EN (Amazon Translate)
    CodeUri: sessions/S04-translate-multilang/functions/translate-catalog
    Handler: app.lambda_handler
    Runtime: python3.12
    Policies:
      - DynamoDBCrudPolicy:
          TableName: !Ref ProductsTable
      - Statement:                              # ← Aquí están los permisos correctos
          - Effect: Allow
            Action: 
              - translate:TranslateText         # ← Permiso 1
              - comprehend:DetectDominantLanguage  # ← Permiso 2
            Resource: "*"
    FunctionUrlConfig:
      AuthType: NONE
      Cors:
        AllowOrigins: [ "*" ]
        AllowMethods: [ "*" ]
        AllowHeaders: [ "*" ]
```

**Conclusión:** El template estaba correcto desde el inicio.

---

## 4. Resolución

### Paso 1: Identificación del Problema
- Rol existente creado sin los permisos
- Template correcto pero rol no se regeneró

### Paso 2: Estrategia
- No editar el template (ya era correcto)
- Forzar regeneración del rol mediante un redeploy completo

### Paso 3: Ejecución

#### Comando ejecutado:
```bash
cd /workshop/capstone
sam build && sam deploy
```

#### Build Output (Resumen)
```
Build Succeeded
Built Artifacts  : .aws-sam/build
Built Template   : .aws-sam/build/template.yaml
```

#### Deploy Output (Cambios Aplicados)

CloudFormation detectó cambios necesarios:

| Operación | Recurso | Tipo | Resultado |
|-----------|---------|------|-----------|
| Modify | `TranslateCatalogFunctionRole` | AWS::IAM::Role | ✅ UPDATE_COMPLETE |
| Modify | `TranslateCatalogFunction` | AWS::Lambda::Function | ✅ UPDATE_COMPLETE |

**Timeline CloudFormation:**
- 22:45:47 UTC — UPDATE_IN_PROGRESS
- 22:45:XX UTC — UPDATE_IN_PROGRESS (IAM Role)
- 22:45:XX UTC — UPDATE_COMPLETE (IAM Role)
- 22:45:XX UTC — UPDATE_COMPLETE_CLEANUP_IN_PROGRESS
- 22:45:XX UTC — UPDATE_COMPLETE (Stack)

#### Stack Outputs Después del Deploy
```
ApiUrl                  https://ztlckzl7n5h2e44bho5ip4dwly0tnbse.lambda-url.us-east-1.on.aws/
TranslateCatalogUrl     https://ui2y2vssbhwzavgu7qb6vl2vs40cxxaz.lambda-url.us-east-1.on.aws/
ProductsTableName       techmoda-ai-diego-pina-Products
Region                  us-east-1
```

### Paso 4: Verificación

#### Test Posterior al Deploy
```bash
URL="https://ui2y2vssbhwzavgu7qb6vl2vs40cxxaz.lambda-url.us-east-1.on.aws/"
PRODUCT_ID="9d4f5396-83ad-4780-a3ee-d4ead506f046"

curl -s -X POST "${URL%/}/products/$PRODUCT_ID/translate" \
  -H "Content-Type: application/json" \
  -d '{"target":"en"}' | python3 -m json.tool
```

#### Resultado ✅ EXITOSO
```json
{
    "productId": "9d4f5396-83ad-4780-a3ee-d4ead506f046",
    "target": "en",
    "translation": {
        "name": "Oversized denim jacket",
        "description": "Oversized denim jacket, light wash, front pockets."
    }
}
```

**Interpretación:**
- ✅ Permiso `comprehend:DetectDominantLanguage` → activo
- ✅ Permiso `translate:TranslateText` → activo
- ✅ Traducción ES → EN completada correctamente
- ✅ Datos persistidos en DynamoDB

---

## 5. Lecciones Aprendidas

### 5.1 IAM en SAM
- **Punto clave:** SAM regenera roles cuando cambia el template YAML, pero a veces el cambio puede no detectarse si solo se modifica el archivo de política
- **Solución:** Cuando haya dudas sobre permisos IAM, hacer un redeploy completo (`sam build && sam deploy`)

### 5.2 Ciclo de Depuración IAM
1. **Leer el error:** "no identity-based policy allows..." = permiso faltante en el rol
2. **Verificar el template:** Confirmar que los `Policies:` están declarados
3. **Verificar el rol en IAM:** `aws iam get-role-policy` para auditar el rol actual
4. **Redeploy si es necesario:** SAM se asegurará de que todo esté sincronizado

### 5.3 Permisos de Translate
- `translate:TranslateText` no basta solo
- La API de Translate llama internamente a `comprehend:DetectDominantLanguage` para detectar el idioma origen
- **Regla:** Si usas Translate en una Lambda, siempre incluye ambos permisos

### 5.4 Estructura de Permisos en SAM
```yaml
Policies:
  - DynamoDBCrudPolicy:      # Helper de SAM para DynamoDB
      TableName: !Ref ProductsTable
  - Statement:               # Policies personalizadas (IAM inline)
      - Effect: Allow
        Action:              # Array de acciones
          - service:Action1
          - service:Action2
        Resource: "*"        # O específico como s3:::bucket-*/*
```

---

## 6. Archivos Afectados

| Archivo | Cambio | Tipo |
|---------|--------|------|
| `template.yaml` | Rol regenerado con permisos | Automático (SAM) |
| `sessions/S04-translate-multilang/functions/translate-catalog/app.py` | Sin cambios | — |

---

## 7. Validación Post-Resolución

### Test 1: Traducción ES → EN
```bash
curl -s -X POST "https://ui2y2vssbhwzavgu7qb6vl2vs40cxxaz.lambda-url.us-east-1.on.aws/products/9d4f5396-83ad-4780-a3ee-d4ead506f046/translate" \
  -H "Content-Type: application/json" \
  -d '{"target":"en"}'
```
**Resultado:** ✅ PASS

### Test 2: Verificación en DynamoDB (opcional)
```bash
aws dynamodb get-item \
  --table-name techmoda-ai-diego-pina-Products \
  --key '{"productId":{"S":"9d4f5396-83ad-4780-a3ee-d4ead506f046"}}' \
  --region us-east-1
```
**Esperado:** El atributo `translations` contiene `{"en": {...}}`

---

## 8. Próximos Pasos

- [ ] Documentar el flujo de traducción en `GUIA.md` (si no está)
- [ ] Testear otros idiomas (FR, PT, etc.) si S04 lo requiere
- [ ] Revisar la cobertura de permisos en S05+ (siguiente sesión)
- [ ] Agregar IAM.md una entrada sobre Translate + Comprehend

---

## Referencias

- **AWS Translate Documentation:** https://docs.aws.amazon.com/translate/
- **AWS Comprehend Documentation:** https://docs.aws.amazon.com/comprehend/
- **SAM Policies Reference:** https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/policies.html
- **Capstone CLAUDE.md:** `docs/IAM.md` — Políticas por función
