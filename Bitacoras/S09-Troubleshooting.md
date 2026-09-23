# Bitácora · S09 — Troubleshooting de Guardrails (Bedrock)

**Fecha:** 2026-09-23 · **Stack:** `techmoda-ai-diego-pina` (us-east-1)
**Sesión:** S09 · Guardrails, sesgo y privacidad · **Dominio AIF-C01:** D4 — Responsible AI
**Guardrail:** `techmoda-ai-diego-pina-guardrail` · id `w6aeof348kpe`

**Pedido original:** entender e implementar el paso de la guía *"Y en el `template.yaml`, agregá a esas
funciones: env var `BEDROCK_GUARDRAIL_ID` (+ `BEDROCK_GUARDRAIL_VERSION`), permiso
`bedrock:ApplyGuardrail` acotado al ARN del guardrail"*.

**Resultado de la sesión:** template completo y correcto; el cableado de S06 funciona; **S08 quedó
bloqueada por un `SyntaxError` en `app.py` línea 135** (más un `converse` duplicado). Nada se editó desde
Claude — `sessions/` es intocable por regla de `capstone/CLAUDE.md`.

---

## 0. Para quien lee esto sin haber estado en la sesión

### Qué es un Guardrail de Bedrock

Un **guardrail** es un recurso de Amazon Bedrock que vive **aparte** del modelo: se crea una vez, se le
configuran reglas (filtros de contenido dañino, detección/anonimización de PII, temas prohibidos,
protección contra inyección de prompts) y después se "engancha" a cada llamada al modelo. No es una
librería ni código: es un recurso de AWS con su propio ID y ARN, y se cobra por uso.

Lo importante para entender los problemas de esta bitácora: el guardrail **no se activa solo**. Hay que
hacer tres cosas, y si falta cualquiera el sistema sigue funcionando "bien" pero sin proteger nada:

1. **Crearlo** en la cuenta/región (ya estaba hecho: id `w6aeof348kpe`).
2. **Decirle al código cuál usar** → la env var `BEDROCK_GUARDRAIL_ID`.
3. **Autorizar al rol de la Lambda a usarlo** → el permiso IAM `bedrock:ApplyGuardrail`.

### Cómo está armada la pieza que estamos tocando

- Las features de IA del capstone son **Lambdas Python** independientes, cada una con su propia
  **Function URL** (una URL pública que invoca la Lambda directamente, sin API Gateway).
- Las dos Lambdas generativas son `GenerateDescriptionFunction` (S06, genera descripciones de producto) y
  `ShoppingAssistantFunction` (S08, el asistente conversacional con RAG). Son las dos que hablan con un
  foundation model, así que son las dos que necesitan guardrail.
- Las dos llaman al modelo con la **Converse API** de Bedrock (`bedrock-runtime.converse`), que es la
  interfaz unificada de Bedrock: el mismo código sirve para cualquier proveedor de modelo. El guardrail se
  le pasa a esa llamada en un parámetro `guardrailConfig`.
- El rol IAM de cada Lambda **lo crea SAM** a partir del bloque `Policies:` de su declaración en el
  template. No hay un rol preexistente que editar a mano: se cambia el template y se redespliega.

### Por qué esta sesión fue casi toda diagnóstico

El cambio en sí es chico (dos líneas de YAML por función). Lo que consumió la sesión fue **interpretar
respuestas de error que apuntaban al lugar equivocado**: un error de parseo JSON que en realidad era una
variable vacía, un 403 que en realidad era un stack ajeno, y un 502 que en realidad era un error de
sintaxis de Python — ninguno de los tres tenía relación con guardrails. De ahí que el valor principal de
este documento sea la **tabla de diagnóstico de §5**.

---

## 1. El concepto: la env var activa, el permiso autoriza

La instrucción de la guía son **dos piezas independientes**, las dos sobre las mismas dos Lambdas
(`GenerateDescriptionFunction` de S06 y `ShoppingAssistantFunction` de S08):

| Pieza | Dónde | Qué pasa si falta |
|---|---|---|
| env var `BEDROCK_GUARDRAIL_ID` | `Environment.Variables:` | `os.environ.get(...)` → `None`, el `if GUARDRAIL_ID:` no entra → **falla en silencio**: responde normal, sin filtrar |
| permiso `bedrock:ApplyGuardrail` | `Policies:` | la Lambda corre, Bedrock rechaza → **502 con el JSON del handler** (`error`/`detail`/`hint`), `AccessDeniedException` en el `detail` |

### Por qué la env var y no un valor en el código

El id del guardrail (`w6aeof348kpe`) es **específico de la cuenta y la región** donde se creó: el mismo
guardrail recreado en otra cuenta tiene otro id. Si estuviera escrito dentro del `app.py`, el código solo
serviría en esta cuenta. Poniéndolo en `Environment.Variables:` del template, el código queda portable y
el valor es configuración de despliegue. Es la misma razón por la que `BEDROCK_MODEL_ID` también vive ahí.

El patrón concreto en el código (idéntico en S06 y S08) es:

```python
GUARDRAIL_ID = os.environ.get("BEDROCK_GUARDRAIL_ID")          # None si no está declarada
GUARDRAIL_VER = os.environ.get("BEDROCK_GUARDRAIL_VERSION", "DRAFT")

kwargs = {"modelId": MODEL_ID, "messages": messages, "inferenceConfig": {...}}
if GUARDRAIL_ID:                                                # ← el interruptor
    kwargs["guardrailConfig"] = {
        "guardrailIdentifier": GUARDRAIL_ID,
        "guardrailVersion": GUARDRAIL_VER,
    }
resp = bedrock.converse(**kwargs)
```

Ese `if` es deliberado y es la razón de que la ausencia de la env var **no produzca ningún error**: la
feature se apaga sola. Bueno para desplegar por etapas, peligroso al validar (ver insight 8 en §10).

### Por qué el permiso, si ya tiene `InvokeModel`

En IAM, **cada acción de API se autoriza por separado**. `bedrock:InvokeModel` autoriza invocar el modelo;
evaluar un guardrail es una operación distinta del servicio (`bedrock:ApplyGuardrail`) y no queda cubierta
por la primera. El detalle no obvio: **la Lambda no llama a `ApplyGuardrail` explícitamente** — es Bedrock
quien la ejecuta internamente cuando la llamada a `converse` trae `guardrailConfig`, usando el rol de la
Lambda. Por eso el permiso hace falta aunque en el código no aparezca ese nombre en ninguna parte.

Los roles de esas dos Lambdas solo traían `bedrock:InvokeModel`, así que sin este agregado el
`guardrailConfig` era rechazado.

### Cómo se estructura el bloque IAM y por qué el `Resource` va separado

Recordatorio de la anatomía de una política IAM, porque de eso depende el resto del párrafo:

```
Policies:                    ← lista de políticas de la función (SAM)
  - Statement:               ← una política; contiene una LISTA de statements
      - Effect / Action / Resource     ← statement 1
      - Effect / Action / Resource     ← statement 2
```

Dentro de **un** statement, el `Resource` aplica a **todas** las `Action` de ese statement. Eso es lo que
obliga a separarlos acá:

| Acción | Sobre qué recursos tiene sentido |
|---|---|
| `bedrock:InvokeModel` | ARNs de **modelo**: `foundation-model/*`, `inference-profile/*` |
| `bedrock:ApplyGuardrail` | ARN de **guardrail**: `…:guardrail/*` |

Si se fusionaran las dos acciones en un solo `Effect: Allow` con la unión de los cinco recursos, el rol
quedaría autorizado a invocar *guardrails como si fueran modelos* y a aplicar *modelos como si fueran
guardrails*. No es explotable en la práctica, pero viola mínimo privilegio y es exactamente lo que la guía
quiere evitar al decir "**acotado al ARN del guardrail**": el permiso nuevo solo alcanza a ese tipo de
recurso.

> **Aclaración registrada — esto generó confusión durante la sesión.** Poner `ApplyGuardrail` como un
> `- Effect: Allow` **adicional dentro del mismo `Statement:`** (que es como quedó el template) **es
> correcto**. Un `Statement:` contiene una *lista*: dos guiones bajo él son dos statements independientes,
> cada uno con su propio `Resource`, y IAM los evalúa por separado. El anti-patrón sería fusionar las dos
> *acciones* en un único `Effect: Allow` compartiendo la lista de `Resource` — eso no es lo que se hizo. Un
> comentario previo de la sesión sugirió que hacían falta dos bloques `- Statement:` separados; es una
> opción de estilo, no un requisito, y el resultado de seguridad es idéntico.

---

## 2. `DRAFT` vs versión publicada

`BEDROCK_GUARDRAIL_VERSION` sale del `create-guardrail-version`, que devuelve un JSON con `version`
(`"1"`, `"2"`, …).

| Valor | Qué es |
|---|---|
| `DRAFT` | el guardrail "en edición": la config actual, **cambia** cada vez que lo modificás |
| `"1"`, `"2"`, … | copia **inmutable** congelada del DRAFT al publicar |

Es el mismo modelo mental que las versiones de Lambda (`$LATEST` vs `1`, `2`, …) o que un tag de Git
frente a una rama: el DRAFT es la rama en la que trabajás, la versión es el tag inmutable que congelás
cuando estás conforme.

**Por qué importa la diferencia en la práctica.** Si las Lambdas apuntan a `DRAFT` y alguien entra a la
consola de Bedrock a "probar algo" en el guardrail, ese cambio impacta producción de inmediato, sin
despliegue y sin registro en CloudFormation. Apuntando a `"1"`, el comportamiento en producción queda fijo
y para cambiarlo hay que publicar una versión nueva y actualizar el template — o sea, queda auditado. Para
el laboratorio `DRAFT` es cómodo (iterás filtros y probás al toque, sin republicar); para la demo final o
cualquier cosa parecida a producción, versión fija.

**De dónde sale el número.** Del propio `create-guardrail-version`, que devuelve un JSON con el campo
`version`. Si ya se corrió y no se anotó, se recupera con `list-guardrails` (ver §6, incluido el detalle de
que sin `--guardrail-identifier` ese comando **no** lista las versiones).

El código tiene `os.environ.get("BEDROCK_GUARDRAIL_VERSION", "DRAFT")`, o sea que el segundo argumento es
el valor por defecto: **omitir la env var es perfectamente válido** y equivale a pedir `DRAFT`. En el
template actual efectivamente **no está declarada**, así que hoy el stack corre contra el borrador. No es
un bug; es una decisión implícita que conviene hacer explícita si se quiere la versión publicada.

---

## 3. Problema clave: `Runtime.UserCodeSyntaxError` en S08

### Síntoma inicial (engañoso)

```
$ curl -s -X POST "${URL%/}/assistant" ... | python3 -m json.tool
Expecting value: line 1 column 1 (char 0)
```

Ese mensaje **no viene de AWS ni del asistente**: lo emite `python3 -m json.tool`, el último comando del
pipe, y significa literalmente "me pidieron parsear JSON y lo que recibí no empieza con JSON". Traducido:
el `curl` entregó cero bytes útiles.

El problema es la combinación de dos cosas del comando que trae la guía:

- **`-s` (silent)** le dice a curl que no muestre progreso **ni errores**. Si curl falla, no dice nada.
- **el pipe a `json.tool`** hace que el único mensaje visible sea el del parser.

Resultado: cualquier fallo en cualquier capa —URL vacía, 403, 502, respuesta HTML— se presenta siempre con
el mismo texto, `Expecting value: line 1 column 1 (char 0)`, que además **suena a problema de formato de
respuesta** y manda a investigar el handler. Es el equivalente a un `catch` que se come la excepción
original.

**Primera regla operativa de esta sesión: mientras debuggeás, sacá el `-s` y poné `-i`.** El `-i` imprime
los headers de respuesta junto al body, con lo cual ves el código HTTP — que es el dato que más rápido te
dice en qué capa estás (§5). El `-s | json.tool` es para cuando ya funciona y querés leer la respuesta
prolija.

Primer paso barato antes de cualquier otra hipótesis: confirmar que la variable no está vacía, con
corchetes para que el string vacío sea visible (`echo $URL` a secas imprime una línea en blanco que se
confunde con cualquier otra cosa):

```bash
echo "URL=[$URL]"
```

En la sesión esta comprobación descartó la primera hipótesis: la variable **sí** tenía valor, así que el
problema estaba más adelante.

```
$ curl -i -X POST "${URL%/}/assistant" -H "Content-Type: application/json" -d '{"message":"hola"}'
HTTP/1.1 502 Bad Gateway
Content-Length: 21
...
Internal Server Error
```

### Cómo se identificó sin leer el log

El dato revelador es el **tamaño y la forma del body**: `Content-Length: 21`, que son exactamente los
caracteres de `Internal Server Error` en **texto plano**, sin llaves, sin JSON.

Eso importa porque el handler de S08 **nunca** responde así. Cuando algo falla adentro (Bedrock caído, PII
rechazada, permiso faltante), su `except` devuelve un JSON explícito y bastante más largo:

```python
return _response(502, {"error": "Fallo del asistente", "detail": str(e),
                       "hint": "¿Habilitaste los modelos en Bedrock y corriste POST /search/index (S7)?"})
```

Entonces la inferencia es directa: si la respuesta **no** tiene esa forma, el `except` no se ejecutó; si el
`except` no se ejecutó, el `try` tampoco; si el `try` tampoco, **la función nunca corrió**. El único punto
anterior a la ejecución del handler es la **importación del módulo** — Lambda tiene que cargar `app.py`
antes de poder llamar a `lambda_handler`. Si esa carga falla, responde ella misma con el 502 genérico, que
es justo lo que se vio.

Conclusión antes de abrir un solo log: **el módulo no importa.** Eso descarta de un golpe Bedrock, IAM,
Model access, el índice de S07 y el guardrail entero — ninguno de esos puede fallar en código que todavía
no se ejecutó.

### Confirmación en CloudWatch

```bash
aws logs tail "/aws/lambda/techmoda-ai-diego-pina-ShoppingAssistant" --since 15m --region us-east-1
```

```
[ERROR] Runtime.UserCodeSyntaxError: Syntax error in module 'app': ':' expected after dictionary key (app.py, line 135)
  File "/var/task/app.py" Line 135
    kwargs = {"modelId": CHAT_MODEL_ID, system=[{"text": SYSTEM_PROMPT}], "messages": messages,
INIT_REPORT  Phase: init  Status: error  Error Type: Runtime.UserCodeSyntaxError
```

Tres cosas que leer en ese log, en orden:

- **`Runtime.UserCodeSyntaxError`** — el prefijo `Runtime.` indica que el error lo reporta el *runtime* de
  Lambda, no el código del usuario ejecutándose. Sus hermanos habituales son
  `Runtime.ImportModuleError` (falta una dependencia o el nombre del handler está mal) y
  `Runtime.HandlerNotFound`. Todos son fallos de carga.
- **`File "/var/task/app.py" Line 135`** — `/var/task/` es el directorio donde Lambda desempaqueta el
  artefacto desplegado. Que la línea citada coincida con el archivo local confirma que lo desplegado es
  efectivamente este código (y no un build viejo).
- **`Phase: init  Status: error`** — es la firma decisiva. Lambda distingue la fase **`init`** (cargar el
  módulo, crear los clientes boto3 globales) de la fase **`invoke`** (ejecutar `lambda_handler`). Error en
  `init` = ni siquiera se llegó a invocar. Cuando falla en `init`, el log muestra el error **dos veces**
  (una por el init fallido, otra al reintentar durante la invocación), que es exactamente el patrón
  duplicado que aparece en la salida — no son dos problemas distintos.

Nótese también que hay `START`/`END`/`REPORT` con `Duration: ~85 ms` y `Billed Duration`: **se cobra igual**
aunque el código no haya corrido, porque el intento de init consume tiempo de ejecución.

### Causa raíz

Al reescribir la llamada para poder agregar el `guardrailConfig` condicionalmente, se pasó de argumentos
con nombre a un **diccionario `kwargs`** que se expande con `**`. La conversión dejó un argumento a medio
traducir: `system=[…]` conservó la sintaxis de **argumento con nombre** (`=`) dentro de un **literal de
diccionario**, donde Python exige `clave: valor` con dos puntos.

Es un error típico de este refactor, porque `converse(system=[...])` y `{"system": [...]}` expresan lo
mismo pero con sintaxis distinta, y el resto de la línea (`"modelId": …`, `"messages": …`) ya estaba bien
convertido — visualmente pasa desapercibido.

```python
# roto
kwargs = {"modelId": CHAT_MODEL_ID, system=[{"text": SYSTEM_PROMPT}], "messages": messages, ...}
# correcto
kwargs = {"modelId": CHAT_MODEL_ID, "system": [{"text": SYSTEM_PROMPT}], "messages": messages, ...}
```

### Segundo defecto en el mismo bloque: `converse` duplicado

Tras el `resp = bedrock.converse(**kwargs)` (el nuevo, con guardrail) quedó **también** la llamada
original, que no se borró al agregar el bloque nuevo:

```python
resp = bedrock.converse(**kwargs)          # ← llamada CON guardrailConfig

resp = bedrock.converse(                   # ← llamada vieja, SIN guardrail: pisa la anterior
    modelId=CHAT_MODEL_ID,
    system=[{"text": SYSTEM_PROMPT}],
    messages=messages,
    inferenceConfig={"maxTokens": MAX_TOKENS, "temperature": 0.5},
)
reply = resp["output"]["message"]["content"][0]["text"].strip()
```

Al ser la misma variable `resp`, la segunda asignación **descarta** el resultado de la primera. Lo que se
devuelve al usuario sale siempre de la llamada sin guardrail.

**Por qué este bug es peor que el `SyntaxError`, aunque parezca menor:**

- **No produce ningún error.** La función responde 200, con texto coherente. Nada en los logs lo delata.
- **El síntoma es "el guardrail no filtra"** con toda la configuración —env var, permiso IAM,
  `guardrailConfig` en el código— aparentemente correcta. Es decir, manda a revisar el template y el
  guardrail, que están bien.
- **Cuesta el doble.** Se hacen dos llamadas completas al modelo: se pagan dos veces los tokens de entrada
  y salida, más la evaluación del guardrail de la primera, cuyo resultado se tira a la basura. También
  duplica la latencia.
- **Si el guardrail bloqueara la entrada**, la primera llamada devolvería el mensaje de rechazo… y la
  segunda lo sobreescribiría con la respuesta sin filtrar. O sea: el filtrado no solo no se ve, se
  **anula activamente**.

Por eso los dos arreglos van juntos: corregir solo la sintaxis dejaría el sistema en el estado engañoso de
"todo verde, nada protegido".

### Arreglo pendiente

En `sessions/S08-bedrock-chatbot/functions/shopping-assistant/app.py`:

1. línea 135: `system=[{"text": SYSTEM_PROMPT}]` → `"system": [{"text": SYSTEM_PROMPT}],`
2. borrar el `converse` duplicado (líneas ~144-149).

> No aplicado por Claude: `sessions/` es intocable (`capstone/CLAUDE.md` §⛔). Reportado para que lo
> aplique el usuario.

---

## 4. Problema clave: stack equivocado → 403

Copiando el `curl` de la `GUIA.md` tal cual, que trae `--stack-name techmoda-ai` (sin sufijo):

```
$ URL=$(aws cloudformation describe-stacks --stack-name techmoda-ai ...)
$ echo $URL
https://pogqwr7a3owgazso6n4bl5fd3a0jxzhs.lambda-url.us-east-1.on.aws/   # ← otra URL

$ curl -i ... 
HTTP/1.1 403 Forbidden
x-amzn-ErrorType: AccessDeniedException
```

### Qué pasó exactamente

El entorno del bootcamp es una **cuenta AWS compartida**: varios participantes despliegan sus stacks en la
misma cuenta y región, diferenciándolos por el sufijo del nombre. El stack `techmoda-ai` **existe** —es de
otra persona—, así que `describe-stacks` **no falló**: encontró el stack, leyó su output
`ShoppingAssistantUrl` y devolvió una URL perfectamente válida… pero de la Lambda de otro.

Esa Function URL no es públicamente invocable desde acá (su `AuthType`/resource policy no autoriza a este
llamador), y de ahí el **403 `AccessDeniedException`**. El body de 16 bytes es el `{"Message":null}` que se
vio al pasarlo por `json.tool`.

### Por qué este 403 no tiene nada que ver con guardrails

Es importante separar las dos capas de autorización que hay en juego, porque las dos se manifiestan como
"access denied" y se confunden:

| Capa | Quién decide | Cuándo actúa | Cómo se ve |
|---|---|---|---|
| **Function URL** (resource policy) | ¿este llamador puede invocar esta Lambda? | **antes** de ejecutar nada | `403` + `x-amzn-ErrorType: AccessDeniedException` |
| **Rol de ejecución** (`Policies:`) | ¿la Lambda puede llamar a Bedrock/DynamoDB? | **durante** la ejecución | `502` con el JSON del handler y el `AccessDeniedException` en el `detail` |

Un permiso faltante como `bedrock:ApplyGuardrail` cae **siempre** en la segunda fila. Si ves un 403 crudo
del lado HTTP, ni te molestes en revisar el template: el problema es a quién le estás pegando.

### Insight transversal, y es el que más cuesta

Las `GUIA.md` de las sesiones usan `--stack-name techmoda-ai`; **el stack de este entorno es siempre
`techmoda-ai-diego-pina`** (está documentado en `capstone/CLAUDE.md` y fijado en `samconfig.toml`). O sea
que **cada comando copiado de una guía hay que ajustarlo a mano**.

Lo peligroso no es el error en sí, es su modo de fallo: en una cuenta compartida, un `describe-stacks` con
el nombre equivocado **tiene éxito** y deja una variable con contenido plausible. No hay mensaje de error,
no hay exit code distinto de cero, y `echo $URL` muestra una URL con pinta correcta. El fallo recién
aparece **dos comandos después**, disfrazado de problema de permisos en la Lambda propia.

Contramedida práctica: cuando aparezca un 403 o un comportamiento raro, **comparar la URL con la de la
corrida anterior**. En esta sesión eso fue lo que lo delató — `pogqwr7a…` donde antes decía `i4ishcqw…`. Si
la URL cambió sin que hayas redesplegado, estás mirando otro stack.

---

## 5. Tabla de diagnóstico por código HTTP

Esta es la herramienta más reutilizable de la sesión. La idea: **el código HTTP junto con la forma del body
identifican en qué capa del stack falló la cosa**, y eso se lee en un segundo, sin abrir CloudWatch ni
adivinar. La clave es que cada capa tiene una "firma" distinta porque el mensaje lo genera un componente
distinto (curl, la Function URL, el runtime de Lambda, o tu propio `except`).

| Código | Body | Capa que falló | Qué revisar |
|---|---|---|---|
| — | vacío (`json.tool`: `char 0`) | curl no ejecutó nada | `$URL` vacío → `echo "[$URL]"` |
| **403** | `{"Message":null}` (16 B) | Function URL / resource policy | stack equivocado, URL ajena, `AuthType` |
| **502** | `Internal Server Error` (21 B, texto plano) | **runtime de Lambda** — el módulo no importa | `SyntaxError`, `ImportModuleError`, dependencia faltante |
| **502** | `{"error":…,"detail":…,"hint":…}` | **tu handler** — corrió y Bedrock falló | IAM (`ApplyGuardrail`), Model access, model id, índice S07 |
| **200** | respuesta normal, **sin filtrar** | todo OK pero el guardrail no se aplicó | `BEDROCK_GUARDRAIL_ID` ausente, o `resp` sobreescrito |

**Las dos filas de 502 son el corazón del diagnóstico.** Mismo código HTTP, causas en capas completamente
distintas, y lo único que las distingue es la forma del body:

- **`Internal Server Error` en texto plano (21 bytes).** Lo escribe el runtime de Lambda. Tu código nunca
  corrió. Buscar en el log `Phase: init  Status: error`. Causas: sintaxis, import, handler mal nombrado,
  dependencia que no se empaquetó.
- **JSON con `error`/`detail`/`hint`.** Lo escribe tu `except`. Tu código corrió y algo *externo* falló. El
  `detail` trae el mensaje real de boto3, que es donde vas a leer `AccessDeniedException`,
  `ValidationException` o `ResourceNotFoundException`.

Consecuencia directa para S09: un `AccessDeniedException` por falta de `bedrock:ApplyGuardrail` cae
**siempre** en la segunda fila, nunca en la primera. Si estás viendo el 502 de texto plano, el permiso no
es el problema, por más que sea lo que acabás de tocar.

La última fila (200 sin filtrar) es la más traicionera porque **no es un error**: es el modo de fallo
silencioso del guardrail. Un test que solo verifique "responde 200" la aprueba.

Regla general que resume la tabla: **cuanto más genérico el mensaje, más temprano en la cadena falló.**
Mensaje vacío < texto plano del runtime < JSON de AWS < JSON tuyo con `hint`.

---

## 6. Comandos clave

### Resolver la URL (con el stack correcto)

```bash
URL=$(aws cloudformation describe-stacks --stack-name techmoda-ai-diego-pina --region us-east-1 \
  --query "Stacks[0].Outputs[?OutputKey=='ShoppingAssistantUrl'].OutputValue" --output text)
echo "URL=[$URL]"       # los corchetes hacen visible el string vacío
```

Desglose para quien no lee JMESPath a diario:

- `Stacks[0].Outputs[?…]` — de los outputs del stack, filtrar los que cumplan la condición.
- `?OutputKey=='ShoppingAssistantUrl'` — el filtro; las comillas simples son obligatorias (es un literal
  de JMESPath, no del shell), por eso todo el `--query` va entre comillas dobles.
- `--output text` — devuelve el valor pelado, sin comillas ni corchetes JSON, listo para meter en una
  variable.

Si el output no existe en el stack, `--output text` imprime la cadena literal **`None`** (no vacío, no
error) — un detalle que ya mordió en S08 y que los scripts del repo normalizan a propósito.

### Probar mostrando los headers

```bash
curl -i -X POST "${URL%/}/assistant" -H "Content-Type: application/json" -d '{"message":"hola"}'
```

`-i` en vez de `-s | python3 -m json.tool`. Con `-s` + pipe, cualquier respuesta no-JSON se reporta como
`Expecting value: line 1 column 1 (char 0)`, que apunta al lugar equivocado.

Detalle del `${URL%/}`: es expansión de bash que **quita la barra final** si existe. Hace falta porque el
output `ShoppingAssistantUrl` viene con `/` al final (`…on.aws/`) y concatenarle `/assistant` daría
`…on.aws//assistant` con doble barra. Está en todos los ejemplos del repo por esa razón.

### Logs

```bash
aws logs tail "/aws/lambda/techmoda-ai-diego-pina-ShoppingAssistant" --since 15m --region us-east-1
```

El nombre del log group es siempre `/aws/lambda/<nombre-de-la-función>`, y el nombre de la función en este
template es `<stack>-<LogicalId sin "Function">` (declarado como
`FunctionName: !Sub ${AWS::StackName}-ShoppingAssistant`). `--since 15m` limita a los últimos 15 minutos;
sin eso, en una Lambda con historia, el volcado es inmanejable. Existe también `bash scripts/logs.sh` en el
repo, pero cubre los handlers CRUD, no las Lambdas de IA.

### Listar el guardrail filtrando por nombre parcial

```bash
aws bedrock list-guardrails --region us-east-1 \
  --query "guardrails[?contains(name,'techmoda-ai-diego-pina')].{name:name,id:id,version:version,status:status}" \
  --output table
```

Por qué está armado así:

- **`contains(name, '…')`** hace match **parcial**, a diferencia de `==`. Hacía falta porque el nombre real
  del guardrail es `techmoda-ai-diego-pina-guardrail` (con sufijo), y en una cuenta compartida un
  `list-guardrails` pelado devuelve también los de los demás participantes.
- **`.{name:name, id:id, …}`** proyecta solo los campos que interesan; sin eso cada entrada trae ARN,
  fechas y estado, y no se lee.
- **`--output table`** para lectura humana. Si el valor va a una variable, usar `--output text`.

**Ojo con un comportamiento no obvio:** sin `--guardrail-identifier`, `list-guardrails` devuelve **una
entrada por guardrail, la del `DRAFT`** — no lista las versiones publicadas. Para verlas hay que pedir ese
guardrail en particular:

```bash
aws bedrock list-guardrails --region us-east-1 --guardrail-identifier <id> --output table
```

O sea: si buscabas confirmar "¿publiqué la versión 1?" y usaste el comando sin identifier, la respuesta que
viste no contesta esa pregunta.

### Publicar versión

```bash
aws bedrock create-guardrail-version --guardrail-identifier <guardrailId> --region us-east-1
```

Devuelve `{"guardrailId": "…", "version": "1"}`. Ese `version` es el valor que iría en
`BEDROCK_GUARDRAIL_VERSION`. Cada corrida crea una versión nueva e incremental a partir del DRAFT actual;
las versiones no se pueden modificar ni reordenar.

### Chequeo de sintaxis antes de desplegar

```bash
python3 -m py_compile sessions/S08-bedrock-chatbot/functions/shopping-assistant/app.py && echo OK
```

**Qué hace:** compila el archivo a bytecode **sin ejecutarlo**, o sea que verifica la sintaxis. Es
exactamente el mismo chequeo que hace Lambda al importar el módulo, pero en ~0,1 s y gratis. El
`&& echo OK` solo imprime si el comando salió con exit code 0, así que el feedback es binario y no hay que
interpretar salida.

**Por qué es imprescindible acá:** `sam build` para Python **empaqueta dependencias, no compila el código**.
Un `SyntaxError` pasa el build sin una sola advertencia y se descubre recién en runtime. El ciclo sin
`py_compile` fue literalmente el de esta sesión:

| Con `py_compile` | Sin `py_compile` (lo que pasó) |
|---|---|
| `py_compile` → error en 0,1 s | `sam build` ~30 s → `sam deploy` 1-2 min → `curl` → `aws logs tail` → leer 60 líneas de log |

**Límites:** detecta solo errores de *sintaxis*. Un nombre mal escrito, una clave que no existe en el dict
de respuesta o el `converse` duplicado de §3 pasan el chequeo sin problema — para eso hace falta ejecutar o
revisar. Deja un directorio `__pycache__/` al lado, inofensivo y sin comitear.

Es el mismo mecanismo que usan los smoke tests de los labs de este repo (`tests/test_exNN.py` valida que
los starters parseen con `py_compile`), así que el patrón ya es idiomático acá.

---

## 7. Estado del `template.yaml` al cierre

Verificado en las dos funciones ([`template.yaml`](../template.yaml) L297-312 y L392-408):

| Ítem | Estado |
|---|---|
| `bedrock:ApplyGuardrail` con `Resource: …:guardrail/*` | ✅ en S06 y S08 |
| `BEDROCK_GUARDRAIL_ID: w6aeof348kpe` | ✅ en S06 y S08 |
| `BEDROCK_GUARDRAIL_VERSION` | ⬜ ausente → corre con `DRAFT` (válido) |
| `Parameters:` para el guardrail id | ⬜ el id está **hardcodeado** |

El bloque tal como quedó, en las dos funciones:

```yaml
      Policies:
        - DynamoDBReadPolicy:
            TableName: !Ref ProductsTable
        - Statement:
            - Effect: Allow
              Action: bedrock:InvokeModel
              Resource:
                - !Sub arn:${AWS::Partition}:bedrock:*::foundation-model/*
                - !Sub arn:${AWS::Partition}:bedrock:*:${AWS::AccountId}:inference-profile/*
            - Effect: Allow                                    # ← agregado en S09
              Action: bedrock:ApplyGuardrail
              Resource: !Sub arn:${AWS::Partition}:bedrock:us-east-1:${AWS::AccountId}:guardrail/*
      Environment:
        Variables:
          BEDROCK_MODEL_ID: us.anthropic.claude-haiku-4-5-20251001-v1:0
          BEDROCK_GUARDRAIL_ID: w6aeof348kpe                   # ← agregado en S09
```

### Observaciones sobre las decisiones tomadas (ninguna es un defecto)

**1. El id está hardcodeado en vez de parametrizado.** Funciona, pero el valor `w6aeof348kpe` solo existe en
esta cuenta y región: el template deja de ser portable. La alternativa habitual sería declarar
`Parameters: GuardrailId (Type: String, Default: "")`, referenciarlo con `!Ref GuardrailId` y poner el valor
real en `parameter_overrides` de `samconfig.toml` —que está en `.gitignore`, así que el id nunca se
comitea—. El `Default: ""` encaja con el `if GUARDRAIL_ID:` del código: sin override, la feature queda
apagada sola.

> Contrapeso, y por eso no se cambió: `capstone/CLAUDE.md` afirma explícitamente que los templates de este
> proyecto **no declaran `Parameters:`** y que no hay nada que sobreescribir con `--parameter-overrides`.
> Agregar el parámetro contradiría esa línea de la documentación y de los scripts de deploy; el hardcodeo la
> respeta. Es un trade-off consciente: portabilidad vs consistencia con la doc del proyecto.

**2. `BEDROCK_GUARDRAIL_VERSION` no está declarada.** No rompe nada porque el código tiene `"DRAFT"` como
default (§2). Vale dejar registrado que es una decisión implícita: hoy el stack corre contra el borrador
editable del guardrail, no contra una versión congelada.

**3. La región va literal en el ARN.** El `Resource` dice `bedrock:us-east-1:` mientras los ARNs de
`InvokeModel` de al lado usan el comodín `bedrock:*`. Se copió así de la `GUIA.md`. Funciona perfectamente
mientras el deploy sea en us-east-1 —que es el caso—, pero si el stack se desplegara en otra región el
permiso apuntaría a guardrails de us-east-1 y fallaría. `${AWS::Region}` lo haría independiente de la
región y consistente con el estilo del resto del template.

---

## 8. Orden de operaciones correcto para cerrar S09

El orden importa: cada paso confirma una capa antes de pasar a la siguiente, así que si algo falla ya sabés
qué cambió respecto del último estado bueno.

1. **Arreglar las dos cosas de `app.py` de S08** (§3). Las dos, no solo la sintaxis: con el `converse`
   duplicado en pie el sistema respondería 200 sin filtrar nada y parecería que el guardrail está mal
   configurado.
2. **`python3 -m py_compile …` → `OK`.** Puerta barata antes de gastar 2 minutos en build + deploy.
3. **`sam build && sam deploy`.** Requiere `python3` **3.12** local (es el runtime declarado); con otra
   versión `sam build` falla con un error confuso de `PythonPipBuilder`.
4. **`curl -i` con un mensaje inocuo** (`{"message":"hola"}`) → esperar **200** con respuesta normal. Este
   paso valida que el módulo importa y que el camino feliz funciona, **sin** meter todavía la variable del
   guardrail en la ecuación. Si acá ya falla, el problema no es S09.
5. **Probar el filtrado** (PII + tema prohibido) — recién ahora se ejercita el guardrail:

```bash
curl -s -X POST "${URL%/}/assistant" -H "Content-Type: application/json" \
  -d '{"message":"Mi tarjeta es 4111 1111 1111 1111, además ¿en qué cripto invierto?"}' \
  | python3 -m json.tool
```

Ese mensaje de prueba está construido para disparar **dos reglas distintas a la vez** del
`guardrail-config.json`: el número `4111 1111 1111 1111` (un número de tarjeta de test, válido según
Luhn) activa el filtro de PII configurado para **bloquear** tarjetas, y "¿en qué cripto invierto?" activa el
denied topic de asesoría financiera. Esperado: tarjeta bloqueada/anonimizada y tema rechazado con el texto
de `blockedInputMessaging` ("Lo siento, solo puedo ayudarte con productos y compras de TechModa").

**Criterio de validación que hay que tener claro:** la prueba pasa cuando la respuesta **cambia** respecto
del paso 4. Si el asistente contesta algo razonable sobre moda ignorando la pregunta financiera, eso **no**
es el guardrail funcionando — puede ser simplemente el system prompt haciendo su trabajo. Lo que confirma el
guardrail es ver el mensaje de rechazo configurado, textual.

**Detalle que la `GUIA.md` no menciona y conviene anticipar:** cuando el guardrail interviene, `converse`
**no lanza excepción**. Devuelve una respuesta normal con `stopReason == "guardrail_intervened"` y el texto
de rechazo en lugar de la respuesta del modelo. Dos consecuencias:

- El `try/except` del handler **no se activa**, así que no esperes un 502 ni un `detail`: es un 200.
- Si el handler asume que siempre existe `output.message.content[0].text` —que es lo que hace hoy— ese caso
  puede reventar con `KeyError`/`IndexError` cuando la estructura de la respuesta bloqueada difiere, y el
  usuario vería un 502 genérico en vez del mensaje de rechazo. Verificarlo al probar; si pasa, es un
  hallazgo a reportar, no a arreglar dentro de `sessions/`.

---

## 9. Verificar la anonimización de PII — con `apply-guardrail`

Esta parte se investigó al final de la sesión y quedó **abierta**: se descartaron dos hipótesis y la tercera
está planteada pero sin confirmar. Se documenta el razonamiento completo porque el método de descarte vale
más que la conclusión.

### El problema: la anonimización no se puede ver desde el `curl` de la guía

Dos razones independientes, y conviene tener las dos claras antes de intentar validarla:

1. **El mensaje de prueba de la guía no ejercita la anonimización.** Usa un número de tarjeta, y en
   `guardrail-config.json` la tarjeta está configurada como **`BLOCK`**, no `ANONYMIZE`. Lo que se ve es el
   mensaje de rechazo — que es un comportamiento distinto. Las entidades con `ANONYMIZE` son `EMAIL`,
   `PHONE` y `NAME`.
2. **La anonimización es invisible en la respuesta HTTP, por diseño.** El guardrail reescribe el texto
   *antes* de que llegue al modelo: el modelo ve `{EMAIL}` en lugar del correo. Pero lo que vuelve al cliente
   es la respuesta del asistente hablando de moda — no hay nada en el body que muestre el enmascarado. A
   diferencia de `BLOCK`, que sí cambia visiblemente la respuesta, `ANONYMIZE` no deja rastro observable
   desde afuera.

Conclusión operativa: **validar la anonimización por `curl` al endpoint es imposible.** Hace falta una
herramienta que muestre el texto intermedio.

### La herramienta: `bedrock-runtime apply-guardrail`

Evalúa un guardrail **de forma aislada**, sin invocar ningún modelo. Ventajas para esta sesión:

- No necesita la Lambda → **funciona aunque S08 siga rota** por el `SyntaxError` de §3.
- No paga tokens de modelo, solo la evaluación del guardrail.
- Devuelve el **texto reescrito** y el detalle de cada detección, que es justamente lo que el path normal
  esconde.
- Es el mismo motor que usa `converse`, así que el resultado es representativo.

```bash
aws bedrock-runtime apply-guardrail \
  --guardrail-identifier w6aeof348kpe \
  --guardrail-version DRAFT \
  --source INPUT \
  --content '[{"text":{"text":"Hola, soy Diego Pina, mi correo es diego@example.com y mi telefono 5512345678"}}]' \
  --region us-east-1
```

Campos a leer en la respuesta:

| Campo | Qué significa |
|---|---|
| `action` | `GUARDRAIL_INTERVENED` o `NONE` — si intervino o no |
| `outputs[0].text` | el texto **reescrito** (acá aparecerían `{NAME}`, `{EMAIL}`, `{PHONE}`) |
| `assessments[].sensitiveInformationPolicy.piiEntities[]` | una entrada por detección, con `type`, `match` y `action` (`ANONYMIZED` / `BLOCKED`) |
| `guardrailCoverage.textCharacters` | cuántos caracteres se evaluaron sobre el total — confirma que el guardrail vio todo el texto |
| `usage.*PolicyUnits` | qué políticas se **facturaron** |

### Resultado real y descarte de hipótesis

```json
"action": "NONE",  "actionReason": "No action.",  "outputs": [],
"guardrailCoverage": { "textCharacters": { "guarded": 77, "total": 77 } },
"usage": { "sensitiveInformationPolicyUnits": 1, ... }
```

O sea: el guardrail **se aplicó** (evaluó los 77 de 77 caracteres) pero **no detectó nada**.

**Hipótesis 1 — idioma y formato.** La detección de PII podría estar fallando por el texto en español, el
teléfono sin separadores (`5512345678` es indistinguible de cualquier número) y `example.com`, que es un
dominio reservado. Se reintentó con el caso más favorable posible:

```bash
--source INPUT --content '[{"text":{"text":"My name is Diego Pina, email diego.pina@gmail.com, phone +1 (555) 123-4567"}}]'
```

→ **`action: NONE` otra vez. Hipótesis descartada.** Regla de método: cuando el caso fácil también falla, el
problema no es la sensibilidad de la detección.

**Hipótesis 2 — la política no está en el guardrail.** La pista que la hacía plausible:
`sensitiveInformationPolicyUnits: 1` indica que se **facturó** la evaluación de esa política, **no** que
hubiera reglas dentro. Un guardrail creado sin `piiEntitiesConfig` evalúa "nada" y cobra igual. Además,
`guardrail-config.json` tiene el `name` modificado por el usuario, así que el archivo podría haber divergido
del recurso en AWS después de crearlo.

```bash
aws bedrock get-guardrail --guardrail-identifier w6aeof348kpe --guardrail-version DRAFT \
  --region us-east-1 --query sensitiveInformationPolicy
```

→ devolvió las **cuatro entidades completas** (`EMAIL`/`PHONE`/`NAME` en `ANONYMIZE`, tarjeta en `BLOCK`) más
`"regexes": []`. **Hipótesis descartada**, y además queda confirmado que el recurso en AWS sí refleja el
JSON del repo.

> Vale registrar el comando por su valor general: `get-guardrail` es **la** forma de saber qué está
> realmente desplegado, en vez de asumir que el archivo de config y el recurso coinciden. Si hubieran
> divergido, el arreglo sería `aws bedrock update-guardrail` (mismo `--cli-input-json` más
> `--guardrail-identifier`) y **no** recrearlo, porque recrear cambia el id y obliga a actualizar
> `BEDROCK_GUARDRAIL_ID` en el template.

### Hipótesis 3, la que queda en pie (sin confirmar)

**`ANONYMIZE` aplicaría a la salida del modelo, no al prompt de entrada; en la entrada lo que interviene es
`BLOCK`.** Encaja exactamente con lo observado: con `--source INPUT` y solo entidades `ANONYMIZE` en juego,
no hay nada que hacer → `action: NONE`.

Dos pruebas que la resuelven, pendientes de correr:

**A) La tarjeta (`BLOCK`) sobre INPUT** — ¿interviene el guardrail alguna vez en la entrada?

```bash
aws bedrock-runtime apply-guardrail \
  --guardrail-identifier w6aeof348kpe --guardrail-version DRAFT --source INPUT \
  --content '[{"text":{"text":"My credit card is 4111 1111 1111 1111"}}]' \
  --region us-east-1 --query '{action:action,reason:actionReason}'
```

**B) El mismo texto con PII, pero declarado como salida** — ¿ahí sí enmascara?

```bash
aws bedrock-runtime apply-guardrail \
  --guardrail-identifier w6aeof348kpe --guardrail-version DRAFT --source OUTPUT \
  --content '[{"text":{"text":"My name is Diego Pina, email diego.pina@gmail.com, phone +1 (555) 123-4567"}}]' \
  --region us-east-1 --query '{action:action,outputs:outputs}'
```

Matriz de interpretación:

| Resultado | Conclusión | Siguiente paso |
|---|---|---|
| A bloquea **y** B enmascara | Confirmado: `BLOCK` opera en entrada, `ANONYMIZE` en salida | Documentarlo; la config está bien |
| A bloquea, B tampoco hace nada | El problema es la detección de esas entidades, no el `source` | Probar entidades de otro tipo / revisar soporte por idioma |
| A tampoco bloquea | El guardrail no detecta **ninguna** PII | Probar un tema prohibido (otro motor): si eso sí interviene, el problema es específico de la política de PII |

### Por qué el hallazgo importa para S09, aun sin cerrarse

Si se confirma la hipótesis 3, la consecuencia es de diseño, no de configuración: **el PII que el cliente
escribe en el prompt no se enmascara** —solo se bloquea si es un número de tarjeta—. Y eso explica por qué
la tabla de defensa en capas de la `GUIA.md` menciona `DetectPiiEntities` de **Comprehend** (S03) *antes* de
llamar al modelo:

| Capa | Dirección del flujo que protege |
|---|---|
| Comprehend `DetectPiiEntities` (S03) | **entrada**: detecta/anonimiza el PII del cliente antes de mandarlo al modelo |
| Guardrail con `ANONYMIZE` | **salida**: evita que el modelo devuelva PII |
| Guardrail con `BLOCK` | ambas, cortando la llamada |

No son piezas redundantes: cubren direcciones distintas. Confundirlas lleva a creer que el guardrail solo
resuelve la privacidad de punta a punta, que es justo el tipo de suposición que el dominio D4 quiere que se
cuestione.

**Insight de método, transversal:** `action: NONE` **no es un error** — es el guardrail diciendo "evalué y no
había nada que hacer". Leerlo como "el guardrail no funciona" habría llevado a recrear el recurso sin
necesidad. Antes de tocar la configuración hubo que probar que la configuración era el problema: los dos
comandos de descarte (`apply-guardrail` con el caso fácil, `get-guardrail`) costaron segundos y evitaron un
cambio innecesario con id nuevo y template a actualizar.

---

## 10. Insights para llevarse

### Sobre herramientas y diagnóstico

1. **`curl -s | json.tool` miente sobre la causa.** Colapsa *cualquier* fallo —variable vacía, 403, 502,
   respuesta HTML— en un único mensaje, `Expecting value: line 1 column 1 (char 0)`, que además suena a
   problema de formato de la respuesta y manda a revisar el handler. Mientras debuggeás: `-i`, sin `-s`, sin
   pipe. El pipe prolijo es para cuando ya funciona.
2. **La forma del body de error dice en qué capa estás.** Texto plano del runtime vs JSON de tu `except`
   separa "el código no importó" de "el código corrió y el servicio falló". Son **dos 502 distintos** y
   llevan a investigar cosas opuestas. Corolario: cuanto más genérico el mensaje, más temprano falló.
3. **`Phase: init  Status: error`** en CloudWatch = fallo al cargar el módulo, no error de lógica. Y el
   error aparece duplicado en el log por el reintento del init: es un problema, no dos.
4. **Se factura igual aunque el código no corra.** El init fallido consume ~85 ms de `Billed Duration`.
5. **Un `describe-stacks` con nombre equivocado puede tener éxito** en una cuenta compartida y devolver
   recursos ajenos, sin error ni exit code distinto de cero. Verificar `echo "URL=[$URL]"` y, ante un 403,
   **comparar la URL con la de la corrida anterior**: si cambió sin redeploy, estás en otro stack.

### Sobre el ciclo de trabajo

6. **`sam build` no compila Python**, solo empaqueta dependencias. Un `py_compile` de 0,1 s antes de cada
   deploy reemplaza un ciclo de build + deploy + curl + logs de varios minutos.
7. **Las guías traen `--stack-name techmoda-ai`; este entorno es `techmoda-ai-diego-pina`.** Todo comando
   copiado de una `GUIA.md` necesita ese ajuste, y omitirlo falla de forma silenciosa (insight 5).

### Sobre guardrails específicamente — los dos fallos silenciosos

8. **Guardrail sin env var no da error: da un 200 sin filtrar.** Por el `if GUARDRAIL_ID:` del código, la
   feature se apaga sola. Es el peor modo de fallo de S09 porque **parece éxito**. Regla: la ausencia de
   error no es evidencia de que el guardrail funciona; la única evidencia es un input que *debía* ser
   bloqueado y efectivamente lo fue.
9. **Un `converse` duplicado también falla en silencio**, y encima cuesta: evalúa el guardrail, paga los
   tokens de las dos llamadas y descarta el resultado protegido. Si el guardrail hubiera bloqueado la
   entrada, la segunda llamada *anula* el bloqueo.
10. **La env var activa, el permiso autoriza.** Faltando la env var falla en silencio (200 sin filtrar);
    faltando el permiso falla ruidosamente (502 con `AccessDeniedException` en el `detail`). Los dos
    síntomas son tan distintos que sirven para saber cuál de los dos falta.
11. **Permiso IAM ≠ Model access.** Son dos compuertas independientes de Bedrock: el rol puede tener todos
    los permisos y la llamada fallar igual porque el modelo no está habilitado en **Bedrock → Model access**
    de esa región (es un setting por región, se activa en la consola). Un `AccessDeniedException` puede
    venir de cualquiera de las dos; ver `docs/IAM.md`.
12. **La Lambda nunca llama a `ApplyGuardrail` en el código.** Lo ejecuta Bedrock por su cuenta, con el rol
    de la Lambda, al ver el `guardrailConfig`. Por eso el permiso hace falta aunque ese nombre no aparezca
    en ningún `app.py` — y por eso es fácil de olvidar.
13. **`DRAFT` no es una versión.** Es el borrador editable: quien edite el guardrail en la consola cambia el
    comportamiento de producción al instante, sin deploy y sin rastro en CloudFormation. Para algo parecido
    a producción, versión publicada.
14. **Que el guardrail intervenga no es una excepción.** `converse` devuelve 200 con
    `stopReason: guardrail_intervened`. Cualquier manejo de errores que espere una excepción para detectar
    el bloqueo está mal planteado.

### Sobre validar PII (§9)

15. **`ANONYMIZE` no se puede validar por `curl` al endpoint.** El enmascarado ocurre entre el cliente y el
    modelo; la respuesta HTTP no lo refleja. `BLOCK` sí es visible, `ANONYMIZE` no. Para verlo hace falta
    `apply-guardrail`.
16. **`apply-guardrail` es la herramienta de diagnóstico del guardrail.** Lo evalúa aislado, sin modelo, sin
    Lambda y casi sin costo — útil justamente cuando la Lambda está rota.
17. **`action: NONE` no es un fallo**, es "evalué y no había nada que hacer". Interpretarlo como error lleva
    a recrear el recurso sin necesidad.
18. **`usage.*PolicyUnits: 1` no prueba que la política tenga reglas**, solo que se facturó su evaluación.
    Para saber qué hay configurado de verdad: `get-guardrail`.
19. **El archivo de config y el recurso en AWS pueden divergir.** `guardrail-config.json` es la *intención*;
    `get-guardrail` es el *estado*. Y si hay que corregirlo, `update-guardrail` en vez de recrear: recrear
    cambia el id y arrastra el template.
20. **El guardrail no cubre solo la dirección que uno supone.** Entrada y salida se protegen con mecanismos
    distintos (Comprehend en S03 vs el guardrail acá). Asumir que una capa cubre todo el flujo es el error
    conceptual que el dominio D4 apunta a corregir.

---

## 11. Lo que NO se modificó

Por instrucción explícita del usuario, en esta sesión Claude **no editó ningún archivo** salvo esta
bitácora: todo el trabajo fue de lectura, diagnóstico y explicación. Hay además una razón estructural para
los archivos de S08: `capstone/CLAUDE.md` tiene una regla —añadida en la sesión de S08, ver
`Bitacoras/S08-Edits.md`— que prohíbe editar cualquier cosa bajo `sessions/SNN-*/`, porque cada sesión es el
guion de una clase de ~1 h y un cambio ahí desincroniza la guía respecto de lo que el alumno ve en pantalla.
Aplica **incluso cuando el cambio es un bug real**, como es el caso. El procedimiento correcto es reportarlo
para que lo aplique la persona.

### Pendientes, en manos del usuario

| Pendiente | Archivo | Criticidad |
|---|---|---|
| `SyntaxError` línea 135 + `converse` duplicado | `sessions/S08-…/functions/shopping-assistant/app.py` | **bloqueante** — S08 no arranca |
| `BEDROCK_GUARDRAIL_VERSION`, si se quiere versión fija en vez de `DRAFT` | `template.yaml` | opcional |
| `${AWS::Region}` en vez de `us-east-1` literal en el ARN del guardrail | `template.yaml` | cosmético |
| Verificar el manejo de `stopReason: guardrail_intervened` | `sessions/S08-…/app.py` | a comprobar al probar (§8) |
| Correr las pruebas **A** y **B** de §9 para cerrar la hipótesis de `ANONYMIZE` en entrada vs salida | — (solo CLI) | investigación abierta |

### Estado previo que no se tocó

Estos archivos ya llegaban modificados por el usuario al inicio de la sesión, y se dejaron exactamente como
estaban:

- `sessions/S06-…/app.py` — cableado del guardrail, **correcto y compila**.
- `sessions/S08-…/app.py` — cableado del guardrail presente, pero con los dos defectos de §3.
- `sessions/S08-…/GUIA.md` — con ediciones pendientes de revertir desde la sesión anterior (documentadas en
  `Bitacoras/S08-Edits.md` §4).
- `sessions/S09-…/guardrail-config.json` — `name` cambiado a `techmoda-ai-diego-pina-guardrail`.
- `template.yaml` — env var + permiso ya agregados en las dos funciones (§7).
