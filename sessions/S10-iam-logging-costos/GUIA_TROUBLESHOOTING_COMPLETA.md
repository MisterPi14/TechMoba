# Guía Completa de Troubleshooting — S10: IAM, Logging y Costos

**Sesión:** S10 (Décima sesión capstone)  
**Proyecto:** TechModa AI — Plataforma e-commerce serverless con capacidades IA  
**Fecha de elaboración:** 2026-09-23  
**Stack Name:** `techmoda-ai-diego-pina`  
**Región:** `us-east-1`

---

## Introducción

Esta guía documenta todos los problemas de seguridad, configuración y operacionales identificados durante S10, junto con sus soluciones, patrones diagnosticados y comandos clave para futuras remediaciones. El propósito es facilitar tanto la comprensión de qué fue incorrecto como la prevención de problemas similares en sesiones futuras.

---

## Parte 1: Auditoría de Seguridad IAM — Resource Wildcards Críticos

### 1.1 Problema Identificado

Durante una auditoría de seguridad de las políticas IAM del capstone, se descubrió que **cinco sesiones tempranas (S01 a S05) declaran `Resource: "*"`** en sus templates de SAM. Esta es una violación del principio de **mínimo privilegio** y representa un riesgo de seguridad.

#### ¿Qué es `Resource: "*"` y por qué es problemático?

En IAM de AWS, el campo `Resource` especifica **a qué recursos se aplica una política**. Cuando se establece a `"*"` (asterisco), la política se aplica a **todos los recursos de todas las cuentas de AWS en todo Internet**, lo cual es:

- **Excesivamente permisivo:** Un Lambda con esta política podría, en teoría, llamar servicios en otras cuentas
- **Contrario a auditoría:** No queda registro claro de qué recursos específicos accede cada función
- **Riesgo de escalada:** Si el rol se ve comprometido, el atacante tiene acceso ilimitado

#### Hallazgos específicos

| Sesión | Archivo Template | Línea | Servicio | Acción |
|--------|-----------------|-------|---------|--------|
| S01 | `rekognition-labels/template-snippet.yaml` | 24 | Rekognition | `DetectLabels`, etc. |
| S02 | `moderation-alttext/template-snippet.yaml` | 25 | Rekognition | `DetectModerationLabels` |
| S03 | `comprehend-sentiment/template-snippet.yaml` | 23 | Comprehend | `DetectSentiment`, etc. |
| S04 | `translate-multilang/template-snippet.yaml` | 23 | Translate | `TranslateText` |
| S05 | `polly-voice/template-snippet.yaml` | 37 | Polly | `SynthesizeSpeech` |

**Total de templates afectados:** 5  
**Severidad:** Alta (aisla privilegios sin límites)

### 1.2 Cómo se Verificó

Se ejecutó un grep recursivo para identificar patrones peligrosos:

```bash
grep -rn "Resource: \"\\*\"" sessions/*/template-snippet.yaml
```

**Resultado:** Encontrados 5 matches en las líneas indicadas arriba.

#### Explicitación del comando

- `-r`: recursivo (busca en todos los subdirectorios)
- `-n`: muestra el número de línea
- `"Resource: \"\\*\"` : patrón literal (las barras invertidas escapan las comillas y el asterisco)
- `sessions/*/template-snippet.yaml`: solo archivos template-snippet.yaml bajo cualquier sesión

### 1.3 Impacto Operacional

**En desarrollo/sandbox:** Bajo — el stack corre en una cuenta de prueba donde cualquier recurso dentro de la cuenta es accesible de todos modos.

**En producción:** Crítico — viola las políticas de seguridad corporativas, puede no pasar un SoC 2 o auditoría PCI, y aumenta la superficie de ataque si las credenciales de un rol se filtran.

### 1.4 Remediación Requerida

Cada template afectado debe reemplazar `Resource: "*"` por un ARN acotado al servicio específico y a la región/cuenta donde se ejecuta.

#### Patrón de remediación general

Antes (inseguro):
```yaml
Policies:
  - Statement:
      - Action: rekognition:*
        Effect: Allow
        Resource: "*"  # ❌ TOO PERMISSIVE
```

Después (seguro):
```yaml
Policies:
  - Statement:
      - Action:
          - rekognition:DetectLabels
          - rekognition:DetectFaces
        Effect: Allow
        Resource: !Sub "arn:aws:rekognition:${AWS::Region}:${AWS::AccountId}:*"
        # ✓ Acotado a region, cuenta, y al tipo de recurso específico del servicio
```

#### Remediaciones específicas por servicio

**S01 — Rekognition (DetectLabels, DetectFaces):**
```yaml
Resource: !Sub "arn:aws:rekognition:${AWS::Region}:${AWS::AccountId}:*"
```

**S02 — Rekognition (DetectModerationLabels, NSFW):**
```yaml
Resource: !Sub "arn:aws:rekognition:${AWS::Region}:${AWS::AccountId}:*"
```

**S03 — Comprehend (DetectSentiment, DetectEntities):**
```yaml
Resource: !Sub "arn:aws:comprehend:${AWS::Region}:${AWS::AccountId}:*"
```

**S04 — Translate (TranslateText):**
```yaml
Resource: !Sub "arn:aws:translate:${AWS::Region}:${AWS::AccountId}:*"
```

**S05 — Polly (SynthesizeSpeech):**
```yaml
Resource: !Sub "arn:aws:polly:${AWS::Region}:${AWS::AccountId}:*"
```

#### Nota importante sobre servicios y ARNs

Algunos servicios de IA de AWS **no validan el ARN del recurso** — simplemente invocan una acción global. En esos casos, la forma correcta es especificar un ARN "ficticio" que represente la región y la cuenta, como arriba. AWS IAM lo permite y es preferible a `"*"`.

---

## Parte 2: Verificación de Acciones Wildcard

### 2.1 Segunda Línea de Auditoría

Además de los wildcards en `Resource`, se auditó si las propias **acciones** contenían wildcards problemáticos como `bedrock:*`, `rekognition:*`, `comprehend:*`, que habrían indicado que se está otorgando acceso a **todas** las acciones de un servicio.

### 2.2 Comando de Verificación

```bash
grep -rn "bedrock:\\*\\|rekognition:\\*\\|comprehend:\\*" sessions/
```

#### Desglose del patrón

- `bedrock:\*`: busca literalmente `bedrock:*` (escapamos el asterisco con barra invertida)
- `\|`: OR lógico (pipe escapado)
- `rekognition:\*`: busca literalmente `rekognition:*`
- `comprehend:\*`: busca literalmente `comprehend:*`
- `sessions/`: solo bajo el árbol de sesiones

### 2.3 Resultado: ✓ Aprobado

El grep encontró **22 matches**, pero **todos están en contexto correcto**:

**Matches legítimos encontrados:**

1. **En GUIA.md (documentación):** Textos que *prohíben* los wildcards
   ```
   S01: "DetectLabels, no `rekognition:*`"
   S02: "Nada de `rekognition:*`"
   S03: "Nada de `comprehend:*`"
   S06: "No damos `bedrock:*`"
   S08: "Nada de `bedrock:*` ni `Resource:"*"`"
   ```

2. **En template-snippet.yaml (comentarios de diseño):** Notas explicativas
   ```yaml
   # Bedrock SI admite ARN de recurso -> acotamos al modelo, no a bedrock:*.
   ```

3. **En ARNs de Bedrock (S06, S07, S08):** Wildcards de *región*, no de acción
   ```yaml
   arn:${AWS::Partition}:bedrock:*::foundation-model/*
   arn:${AWS::Partition}:bedrock:*:${AWS::AccountId}:inference-profile/*
   ```
   
   Aquí el `bedrock:*` es la región (comodín de región, entre colones), **no** una acción. Es correcto.

#### Verdaderas líneas de acción vistas

Las acciones reales en templates Bedrock (S06, S07, S08) están **correctamente acotadas**:

```yaml
Action:
  - bedrock:InvokeModel      # ✓ Específica, no wildcard
  - bedrock:InvokeAgent      # ✓ Específica
Resource: [ arn:...foundation-model/*, arn:...inference-profile/* ]  # ✓ Acotada
```

### 2.4 Conclusión

**No hay acciones wildcard problemáticas en los templates.** La auditoría es exitosa en este aspecto.

---

## Parte 3: Configuración de Bedrock Invocation Logging — S10 Principal

### 3.1 Contexto: ¿Por qué loguear invocaciones a Bedrock?

S10 se enfoca en **observabilidad, auditoría y costos**. Cuando se hacen invocaciones a modelos de fundación (Bedrock), es esencial poder:

- **Auditar:** Qué inputs se enviaron y qué modelos se invocaron
- **Debuggear:** Entender qué salió mal en una respuesta de IA
- **Costear:** Medir tokens consumidos por modelo y usuario
- **Cumplir normativas:** Mantener logs de decisiones automatizadas

AWS Bedrock ofrece **invocation logging** que puede escribir automáticamente cada llamada a un modelo en **CloudWatch Logs**.

### 3.2 Arquitectura del Logging

```
Tu Lambda S06 (Bedrock Invocation)
         ↓
boto3.client('bedrock-runtime').invoke_model()
         ↓
Bedrock asume un rol de entrega (Delivery Role)
         ↓
Rol escribe entrada JSON en CloudWatch Logs
         ↓
Log group: /techmoda/techmoda-ai/bedrock-invocations
         ↓
Puedes consultar con: aws logs tail /techmoda/techmoda-ai/bedrock-invocations --follow
```

### 3.3 Prerequisito: Rol de Entrega (Delivery Role)

Para que Bedrock pueda escribir en CloudWatch, necesita un **rol IAM que le permita asumir** (trust relationship) y que tenga **permisos para crear log streams y escribir logs**.

#### Problema Inicial Encontrado

Al ejecutar el script `enable-bedrock-logging.sh` la **primera vez**:

```bash
bash sessions/S10-iam-logging-costos/enable-bedrock-logging.sh
```

**Resultado:** ❌ Fallo
```
✗ Falta el rol de entrega para el logging de Bedrock.

  Bedrock necesita un rol propio que pueda asumir para escribir en CloudWatch Logs.
  No lo crea el stack de SAM: es configuración por cuenta/región.
```

**Causa:** El rol `techmoda-ai-BedrockLogsDelivery` **no existía aún** en la cuenta.

### 3.4 Solución: Crear el Rol de Entrega

El script mismo proporciona **dos opciones**:

#### Opción A: Usar un rol ya existente

Si ya tenías un rol IAM que confía en Bedrock y tiene permisos de logs, podrías pasarlo:

```bash
ROLE_ARN=arn:aws:iam::281248178297:role/tu-rol-existente bash sessions/S10-iam-logging-costos/enable-bedrock-logging.sh
```

#### Opción B: Crear el rol mínimo (recomendado)

El script proporciona el comando exacto. Desglosamos qué hace:

**Paso 1: Crear trust policy (quién puede asumir el rol)**

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": { "Service": "bedrock.amazonaws.com" },
    "Action": "sts:AssumeRole"
  }]
}
```

**Explicación:**
- `Principal`: especifica que el **servicio Bedrock** (no un usuario, no otra cuenta) puede asumir este rol
- `Action: sts:AssumeRole`: el único permisos — asumir (tomar control de) este rol

**Paso 2: Crear el rol**

```bash
aws iam create-role --role-name techmoda-ai-diego-pina-BedrockLogsDelivery \
  --assume-role-policy-document file:///tmp/bedrock-logs-trust.json
```

Esto crea el rol **vacío** (sin permisos aún).

**Paso 3: Agregar permisos inline (política de permisos)**

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": [ "logs:CreateLogStream", "logs:PutLogEvents" ],
    "Resource": "arn:aws:logs:*:*:log-group:/techmoda/*"
  }]
}
```

**Explicación:**
- `Action`: dos permisos específicos:
  - `logs:CreateLogStream` → crear streams dentro de un log group (ej: un stream por hora o por función)
  - `logs:PutLogEvents` → escribir eventos (líneas de log) a un stream existente
- `Resource`: **acotado a log groups que empiezan con `/techmoda/`** — no `"*"`, no todos los logs, solo los del proyecto

**Paso 4: Vincular la política al rol**

```bash
aws iam put-role-policy --role-name techmoda-ai-diego-pina-BedrockLogsDelivery \
  --policy-name WriteTechModaLogs \
  --policy-document file:///tmp/bedrock-logs-perms.json
```

### 3.5 Segundo Intento: Script con Rol Ya Creado

Después de ejecutar los pasos de creación, el script se ejecutó de nuevo:

```bash
bash sessions/S10-iam-logging-costos/enable-bedrock-logging.sh
```

**Resultado:** ✅ Éxito
```
→ Usando el rol de entrega existente: techmoda-ai-BedrockLogsDelivery
→ Habilitando Bedrock invocation logging en us-east-1
  log group: /techmoda/techmoda-ai/bedrock-invocations
  delivery role: arn:aws:iam::281248178297:role/techmoda-ai-BedrockLogsDelivery
✓ Logging habilitado. Verificá con:
  aws bedrock get-model-invocation-logging-configuration --region us-east-1
```

**Qué hizo el script:**
1. Detectó que el rol ya existe
2. Configuró Bedrock (en la región us-east-1) para escribir todos los logs de invocaciones en el log group `/techmoda/techmoda-ai/bedrock-invocations`
3. Le asignó el rol de entrega para que Bedrock tenga permisos de escribir

### 3.6 Verificación: Confirmar Logging Activo

Se ejecutó el comando recomendado:

```bash
aws bedrock get-model-invocation-logging-configuration --region us-east-1
```

**Salida (formateada para claridad):**

```json
{
  "loggingConfig": {
    "cloudWatchConfig": {
      "logGroupName": "/techmoda/techmoda-ai/bedrock-invocations",
      "roleArn": "arn:aws:iam::281248178297:role/techmoda-ai-BedrockLogsDelivery"
    },
    "textDataDeliveryEnabled": true,
    "imageDataDeliveryEnabled": false,
    "embeddingDataDeliveryEnabled": false,
    "videoDataDeliveryEnabled": true
  }
}
```

#### Análisis de configuración

| Campo | Valor | Significado |
|-------|-------|------------|
| `logGroupName` | `/techmoda/techmoda-ai/bedrock-invocations` | CloudWatch Logs donde aparecerán las llamadas |
| `roleArn` | `techmoda-ai-BedrockLogsDelivery` | Rol que Bedrock usa para escribir |
| `textDataDeliveryEnabled` | `true` | ✓ Los prompts y respuestas de texto se loguean |
| `imageDataDeliveryEnabled` | `false` | — Imágenes NO se loguean (normal, ocuparían mucho espacio) |
| `embeddingDataDeliveryEnabled` | `false` | — Embeddings NO se loguean (generan demasiada data) |
| `videoDataDeliveryEnabled` | `true` | ✓ Video metadata se loguea |

**Conclusión:** ✅ Logging correctamente habilitado para texto (lo principal para auditoría y debugging).

---

## Parte 4: Análisis de Patrones Diagnosticados

### 4.1 Patrón 1: Scripts Idempotentes

El script `enable-bedrock-logging.sh` es **idempotente** — puedes ejecutarlo múltiples veces sin efecto dañino:

- **Primera ejecución:** Detecta que el rol no existe → instruye cómo crearlo
- **Ejecutas los pasos de creación:** Rol creado
- **Segunda ejecución:** Detecta que el rol existe → lo usa para configurar logging
- **Tercera+ ejecución:** Detecta que ya está configurado → no-op (no hace nada)

**Beneficio:** Seguro para ejecutar en startup, recovery, o redeployment automático.

### 4.2 Patrón 2: Separación de Responsabilidades

El rol de entrega es **distinto** del rol de ejecución de la Lambda:

```
S06 Lambda Role (crea el stack SAM)
  ├─ Acción: bedrock:InvokeModel
  ├─ Recurso: modelo específico
  └─ (No puede escribir logs)

Bedrock Logs Delivery Role (configurado por S10)
  ├─ Acción: logs:CreateLogStream, logs:PutLogEvents
  ├─ Recurso: /techmoda/* log groups
  └─ (Solo escribe logs, no invoca modelos)
```

**Ventaja:** Si se compromete uno, el otro no se ve afectado.

### 4.3 Patrón 3: Permisos Acotados en Recursos

En la política del rol de entrega:
```json
"Resource": "arn:aws:logs:*:*:log-group:/techmoda/*"
```

No es `"Resource": "*"` (que permitiría escribir en cualquier log group del planeta), sino específicamente en `/techmoda/*`. Esto es un ejemplo correcto de mínimo privilegio.

---

## Parte 5: Tabla de Referencia — Comandos Clave S10

### 5.1 Setup Inicial (si no existe rol)

```bash
# Crear trust policy (permite a Bedrock asumir el rol)
cat > /tmp/bedrock-logs-trust.json <<'EOF'
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": { "Service": "bedrock.amazonaws.com" },
    "Action": "sts:AssumeRole"
  }]
}
EOF

# Crear el rol
aws iam create-role --role-name techmoda-ai-diego-pina-BedrockLogsDelivery \
  --assume-role-policy-document file:///tmp/bedrock-logs-trust.json

# Crear política de permisos (para CloudWatch Logs)
cat > /tmp/bedrock-logs-perms.json <<'EOF'
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": [ "logs:CreateLogStream", "logs:PutLogEvents" ],
    "Resource": "arn:aws:logs:*:*:log-group:/techmoda/*"
  }]
}
EOF

# Adjuntar la política al rol
aws iam put-role-policy --role-name techmoda-ai-diego-pina-BedrockLogsDelivery \
  --policy-name WriteTechModaLogs \
  --policy-document file:///tmp/bedrock-logs-perms.json
```

### 5.2 Habilitar Logging

```bash
# Ejecutar el script que activa logging (después del setup anterior)
bash sessions/S10-iam-logging-costos/enable-bedrock-logging.sh
```

### 5.3 Verificación

```bash
# Verificar configuración de logging de Bedrock
aws bedrock get-model-invocation-logging-configuration --region us-east-1

# Inspeccionar el rol de entrega
aws iam get-role --role-name techmoda-ai-diego-pina-BedrockLogsDelivery

# Ver la política del rol
aws iam get-role-policy --role-name techmoda-ai-diego-pina-BedrockLogsDelivery \
  --policy-name WriteTechModaLogs

# (Opcional) Inspeccionar la trust relationship
aws iam get-role --role-name techmoda-ai-diego-pina-BedrockLogsDelivery \
  --query 'Role.AssumeRolePolicyDocument'
```

### 5.4 Lectura de Logs

```bash
# Ver logs en tiempo real (después de hacer invocaciones a Bedrock)
aws logs tail /techmoda/techmoda-ai/bedrock-invocations --follow --region us-east-1

# Ver últimas N líneas sin follow
aws logs tail /techmoda/techmoda-ai/bedrock-invocations --max-items 50 --region us-east-1

# Buscar invocaciones que contengan un modelo específico
aws logs filter-log-events \
  --log-group-name /techmoda/techmoda-ai/bedrock-invocations \
  --filter-pattern "claude" \
  --region us-east-1

# Consultar todas las invocaciones de una hora atrás
aws logs filter-log-events \
  --log-group-name /techmoda/techmoda-ai/bedrock-invocations \
  --start-time $(date -d '1 hour ago' +%s)000 \
  --region us-east-1
```

### 5.5 Auditoría IAM

```bash
# Buscar Resource wildcards en todos los templates
grep -rn 'Resource: "\*"' sessions/*/template-snippet.yaml

# Buscar acciones wildcard de servicios
grep -rn "bedrock:\*\|rekognition:\*\|comprehend:\*\|translate:\*\|polly:\*" sessions/

# Validar un template específico
sam validate --lint -t sessions/S06-bedrock-descripciones/template-snippet.yaml

# Revisar la política de una función específica
aws iam get-role --role-name techmoda-ai-<NombreDelStack>-<NombreFuncion>-<HASH>
```

---

## Parte 6: Checklist de Remediación y Próximos Pasos

### 6.1 Remediaciones Pendientes (Críticas)

- [ ] **S01–S05:** Reemplazar `Resource: "*"` por ARNs acotados (ver Parte 1.4)
- [ ] **Validar post-remediar:** `sam validate --lint -t` en cada template modificado
- [ ] **Re-desplegar:** `bash scripts/deploy-all.sh` después de cambios
- [ ] **Auditar nuevamente:** Ejecutar los greps de verificación

### 6.2 Operacionales Completadas (S10)

- [x] Rol de entrega de Bedrock Logs creado
- [x] Logging habilitado en us-east-1
- [x] Verificación exitosa de configuración
- [x] Comandos de consulta de logs documentados

### 6.3 Para Futuras Sesiones

- **S11+:** Monitorear CloudWatch Logs para patrones de error, latencia o consumo de tokens
- **Análisis de costos:** Usar invocation logs para correlacionar invocaciones con facturación de Bedrock
- **Alertas:** Configurar SNS alerts en CloudWatch si invocaciones a Bedrock superan umbral diario
- **Auditoría continua:** Ejecutar `grep -rn 'Resource: "\*"'` antes de cada deploy

---

## Parte 7: Resumen Ejecutivo

### Hallazgos Principales

| Riesgo | Severidad | Estado | Acción |
|--------|-----------|--------|--------|
| S01–S05 `Resource: "*"` | Alta | Identificado | Remediar per Parte 1.4 |
| Acciones wildcard IAM | Baja | Limpio | Monitorear |
| Bedrock invocation logging | Crítico | Habilitado | Operacional |
| Rol de entrega Bedrock | Crítico | Configurado | Operacional |

### Métricas de Seguridad

- **Templates con `Resource: "*"`:** 5 (S01–S05)
- **Templates con acciones wildcard:** 0
- **Bedrock logging:** ✅ Activo (text + video)
- **Rol de entrega:** ✅ Configurado con permisos mínimos

### Próxima Revisión

Programar auditoría completa después de que S01–S05 se remediyen, para validar que todos los 12 templates cumplen mínimo privilegio.

---

## Apéndice A: Glosario de Términos IAM

**ARN (Amazon Resource Name):** Identificador único de un recurso AWS. Formato: `arn:partition:service:region:account-id:resource-type/resource-id`

**Delivery Role:** Rol IAM que un servicio (como Bedrock) asume para escribir en otro servicio (como CloudWatch Logs)

**Least Privilege:** Principio de seguridad: otorgar solo los permisos mínimos necesarios

**Resource Wildcard:** Uso de `"*"` en el campo `Resource` de una política, permitiendo acceso a todos los recursos

**Trust Relationship:** Política que especifica qué principals (usuarios, roles, servicios) pueden asumir un rol IAM

---

## Apéndice B: Estructura de Archivos Relevantes

```
capstone/
├── sessions/
│   ├── S01-rekognition-labels/
│   │   ├── template-snippet.yaml  (Contiene Resource: "*")
│   │   ├── GUIA.md                (Menciona "no rekognition:*")
│   │   └── functions/...
│   ├── ...
│   └── S10-iam-logging-costos/
│       ├── enable-bedrock-logging.sh  (Script de setup)
│       ├── BITACORA_S10.md            (Bitácora ejecutiva)
│       └── GUIA_TROUBLESHOOTING_COMPLETA.md  (este archivo)
├── template.yaml
├── template.sandbox.yaml
├── template.full.yaml
└── scripts/
    ├── deploy-all.sh
    └── validate-all.sh
```

---

**Fin de la Guía de Troubleshooting**  
Última actualización: 2026-09-23 | Redactor: Claude Code | Stack: techmoda-ai-diego-pina
