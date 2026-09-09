participant:/workshop$ bash capstone/ai/seed/seed-products.sh 
→ Resolviendo ApiUrl del stack 'techmoda-ai-diego-pina' en us-east-1...
→ Sembrando productos en https://ztlckzl7n5h2e44bho5ip4dwly0tnbse.lambda-url.us-east-1.on.aws//products
  ✓ Vestido midi floral  →  productId=40b4f736-c537-428f-9df4-c4d094340ab4
  ✓ Chaqueta de mezclilla oversize  →  productId=9d4f5396-83ad-4780-a3ee-d4ead506f046
  ✓ Tenis blancos minimalistas  →  productId=47abe295-f969-4a42-9e3f-5200566600d1
  ✓ Bolso tote de lona  →  productId=88a9f4b1-38ef-4947-83fb-03ef24d9f8ea
✓ Seed completo. Recordá subir imágenes reales a s3://techmoda-ai-diego-pina-frontend/assets/ y
  actualizar el imageUrl de cada producto antes de las sesiones de visión (S1/S2).
participant:/workshop$ cd capstone/
participant:/workshop/capstone$ bash capstone/scripts/deploy.sh
bash: capstone/scripts/deploy.sh: No such file or directory
participant:/workshop/capstone$ bash scripts/deploy.sh
Deploying SAM application (Function URLs, sin API Gateway)...
=============================================================
  Stack:  techmoda-ai-diego-pina
  Region: us-east-1

📦 sam build...
Starting Build use cache                                                                                                                       
Building codeuri: /workshop/capstone/functions runtime: nodejs22.x architecture: x86_64 functions: RouterFunction                              
Manifest is not changed for (EnrichLabelsFunction), running incremental build                                                                  
Building codeuri: /workshop/capstone/sessions/S01-rekognition-labels/functions/enrich-labels runtime: python3.12 architecture: x86_64          
functions: EnrichLabelsFunction                                                                                                                
package.json file not found. Continuing the build without dependencies.                                                                        
 Running PythonPipBuilder:CopySource                                                                                                           
 Running NodejsNpmBuilder:CopySource                                                                                                           
 Running PythonPipBuilder:CopySource                                                                                                           

Build Succeeded

Built Artifacts  : .aws-sam/build
Built Template   : .aws-sam/build/template.yaml

Commands you can use next
=========================
[*] Validate SAM template: sam validate
[*] Invoke Function: sam local invoke
[*] Test Function in the Cloud: sam sync --stack-name {{stack-name}} --watch
[*] Deploy: sam deploy --guided
🚀 sam deploy...
📝 Usando configuración existente en samconfig.toml

        Managed S3 bucket: aws-sam-cli-managed-default-samclisourcebucket-lygcp6suvfg2
        Auto resolution of buckets can be turned off by setting resolve_s3=False
        To use a specific S3 bucket, set --s3-bucket=<bucket_name>
        Above settings can be stored in samconfig.toml
                                                                                                                                               
        File with same data already exists at 250af3cf4ffaefe45f7a083fb16a743d, skipping upload                                                
                                                                                                                                               
        File with same data already exists at 0b6c503b9bade3c63a1b0d115fa8190e, skipping upload                                                

        Deploying with following values
        ===============================
        Stack name                   : techmoda-ai-diego-pina
        Region                       : us-east-1
        Confirm changeset            : False
        Disable rollback             : False
        Deployment s3 bucket         : aws-sam-cli-managed-default-samclisourcebucket-lygcp6suvfg2
        Capabilities                 : ["CAPABILITY_IAM", "CAPABILITY_AUTO_EXPAND"]
        Parameter overrides          : {}
        Signing Profiles             : {}

Initiating deployment
=====================

                                                                                                                                               
        File with same data already exists at b6607ad0540f6a21b6c9b88f69e55af1.template, skipping upload                                       


Waiting for changeset to be created..

Error: No changes to deploy. Stack techmoda-ai-diego-pina is up to date
participant:/workshop/capstone$ aws s3 ls s3://techmoda-ai-diego-pina-diego-pina-frontend-281248178297 --recursive
2026-08-31 19:46:34      13463 assets/index-BKTQWNVm.css
2026-08-31 19:46:34     159412 assets/index-DZGslLjO.js
2026-08-31 19:57:41      13845 assets/vestido.jpg
2026-08-31 19:46:34        293 env-config.js
2026-08-31 19:46:34        241 env-config.js.template
2026-08-31 19:46:34        595 index.html
participant:/workshop/capstone$ URL=$(aws cloudformation describe-stacks --stack-name techmoda-ai --region us-east-1 \
  --query "Stacks[0].Outputs[?OutputKey=='ModerateImageUrl'].OutputValue" --output text)
participant:/workshop/capstone$ echo $URL
None
participant:/workshop/capstone$ sam build && sam deploy
Starting Build use cache                                                                                                                       
Building codeuri: /workshop/capstone/functions runtime: nodejs22.x architecture: x86_64 functions: RouterFunction                              
Manifest is not changed for (EnrichLabelsFunction), running incremental build                                                                  
Building codeuri: /workshop/capstone/sessions/S01-rekognition-labels/functions/enrich-labels runtime: python3.12 architecture: x86_64          
functions: EnrichLabelsFunction                                                                                                                
Manifest file is changed (new hash: cacc28ae47a06143bdf6e075862f38cb) or dependency folder (.aws-sam/deps/b680c486-efeb-4fe8-97a0-46d96042ae6b)
is missing for (ModerateImageFunction), downloading dependencies and copying/building source                                                   
Building codeuri: /workshop/capstone/sessions/S02-moderation-alttext/functions/moderate-image runtime: python3.12 architecture: x86_64         
functions: ModerateImageFunction                                                                                                               
package.json file not found. Continuing the build without dependencies.                                                                        
 Running NodejsNpmBuilder:CopySource                                                                                                           
 Running PythonPipBuilder:CopySource                                                                                                           
 Running PythonPipBuilder:CleanUp                                                                                                              
 Running PythonPipBuilder:ResolveDependencies                                                                                                  
 Running PythonPipBuilder:CopySource                                                                                                           
 Running PythonPipBuilder:CopySource                                                                                                           
 Running PythonPipBuilder:CopySource                                                                                                           

Build Succeeded

Built Artifacts  : .aws-sam/build
Built Template   : .aws-sam/build/template.yaml

Commands you can use next
=========================
[*] Validate SAM template: sam validate
[*] Invoke Function: sam local invoke
[*] Test Function in the Cloud: sam sync --stack-name {{stack-name}} --watch
[*] Deploy: sam deploy --guided

        Managed S3 bucket: aws-sam-cli-managed-default-samclisourcebucket-lygcp6suvfg2
        Auto resolution of buckets can be turned off by setting resolve_s3=False
        To use a specific S3 bucket, set --s3-bucket=<bucket_name>
        Above settings can be stored in samconfig.toml
                                                                                                                                               
        File with same data already exists at 250af3cf4ffaefe45f7a083fb16a743d, skipping upload                                                
                                                                                                                                               
        File with same data already exists at 0b6c503b9bade3c63a1b0d115fa8190e, skipping upload                                                
                                                                                                                                               
        File with same data already exists at bc23eda72b2deef0cb89b77cf8583df6, skipping upload                                                

        Deploying with following values
        ===============================
        Stack name                   : techmoda-ai-diego-pina
        Region                       : us-east-1
        Confirm changeset            : False
        Disable rollback             : False
        Deployment s3 bucket         : aws-sam-cli-managed-default-samclisourcebucket-lygcp6suvfg2
        Capabilities                 : ["CAPABILITY_IAM", "CAPABILITY_AUTO_EXPAND"]
        Parameter overrides          : {}
        Signing Profiles             : {}

Initiating deployment
=====================

        Uploading to 657b2d254a29aed89c672eb536d35a81.template  6568 / 6568  (100.00%)


Waiting for changeset to be created..

CloudFormation stack changeset
-----------------------------------------------------------------------------------------------------------------------------------------
Operation                          LogicalResourceId                  ResourceType                       Replacement                      
-----------------------------------------------------------------------------------------------------------------------------------------
+ Add                              ModerateImageFunctionRole          AWS::IAM::Role                     N/A                              
+ Add                              ModerateImageFunctionURLInvokeAl   AWS::Lambda::Permission            N/A                              
                                   lowPublicAccess                                                                                        
+ Add                              ModerateImageFunctionUrlPublicPe   AWS::Lambda::Permission            N/A                              
                                   rmissions                                                                                              
+ Add                              ModerateImageFunctionUrl           AWS::Lambda::Url                   N/A                              
+ Add                              ModerateImageFunction              AWS::Lambda::Function              N/A                              
-----------------------------------------------------------------------------------------------------------------------------------------


Changeset created successfully. arn:aws:cloudformation:us-east-1:281248178297:changeSet/samcli-deploy1788290293/d9b32562-9b02-436e-8eb2-bae9f7d60085


2026-09-01 19:18:24 - Waiting for stack create/update to complete

CloudFormation events from stack operations (refresh every 5.0 seconds)
-----------------------------------------------------------------------------------------------------------------------------------------
ResourceStatus                     ResourceType                       LogicalResourceId                  ResourceStatusReason             
-----------------------------------------------------------------------------------------------------------------------------------------
UPDATE_IN_PROGRESS                 AWS::CloudFormation::Stack         techmoda-ai-diego-pina             User Initiated                   
CREATE_IN_PROGRESS                 AWS::IAM::Role                     ModerateImageFunctionRole          -                                
CREATE_IN_PROGRESS                 AWS::IAM::Role                     ModerateImageFunctionRole          Resource creation Initiated      
CREATE_COMPLETE                    AWS::IAM::Role                     ModerateImageFunctionRole          -                                
CREATE_IN_PROGRESS                 AWS::Lambda::Function              ModerateImageFunction              -                                
CREATE_IN_PROGRESS                 AWS::Lambda::Function              ModerateImageFunction              Resource creation Initiated      
CREATE_COMPLETE                    AWS::Lambda::Function              ModerateImageFunction              -                                
CREATE_IN_PROGRESS                 AWS::Lambda::Permission            ModerateImageFunctionUrlPublicPe   -                                
                                                                      rmissions                                                           
CREATE_IN_PROGRESS                 AWS::Lambda::Url                   ModerateImageFunctionUrl           -                                
CREATE_IN_PROGRESS                 AWS::Lambda::Permission            ModerateImageFunctionURLInvokeAl   -                                
                                                                      lowPublicAccess                                                     
CREATE_IN_PROGRESS                 AWS::Lambda::Permission            ModerateImageFunctionUrlPublicPe   Resource creation Initiated      
                                                                      rmissions                                                           
CREATE_IN_PROGRESS                 AWS::Lambda::Url                   ModerateImageFunctionUrl           Resource creation Initiated      
CREATE_IN_PROGRESS                 AWS::Lambda::Permission            ModerateImageFunctionURLInvokeAl   Resource creation Initiated      
                                                                      lowPublicAccess                                                     
CREATE_COMPLETE                    AWS::Lambda::Permission            ModerateImageFunctionUrlPublicPe   -                                
                                                                      rmissions                                                           
CREATE_COMPLETE                    AWS::Lambda::Url                   ModerateImageFunctionUrl           -                                
CREATE_COMPLETE                    AWS::Lambda::Permission            ModerateImageFunctionURLInvokeAl   -                                
                                                                      lowPublicAccess                                                     
UPDATE_COMPLETE_CLEANUP_IN_PROGR   AWS::CloudFormation::Stack         techmoda-ai-diego-pina             -                                
ESS                                                                                                                                       
UPDATE_COMPLETE                    AWS::CloudFormation::Stack         techmoda-ai-diego-pina             -                                
-----------------------------------------------------------------------------------------------------------------------------------------

CloudFormation outputs from deployed stack
--------------------------------------------------------------------------------------------------------------------------------------------
Outputs                                                                                                                                    
--------------------------------------------------------------------------------------------------------------------------------------------
Key                 ApiUrl                                                                                                                 
Description         Base API URL (Lambda Function URL del router CRUD). Termina en '/'.                                                    
Value               https://ztlckzl7n5h2e44bho5ip4dwly0tnbse.lambda-url.us-east-1.on.aws/                                                  

Key                 FrontendBucketName                                                                                                     
Description         S3 Bucket name for frontend                                                                                            
Value               techmoda-ai-diego-pina-diego-pina-frontend-281248178297                                                                

Key                 EnrichLabelsUrl                                                                                                        
Description         S1 Function URL                                                                                                        
Value               https://jbhzo7gnrl6eflprz77ldpxlua0ntgrs.lambda-url.us-east-1.on.aws/                                                  

Key                 ModerateImageUrl                                                                                                       
Description         -                                                                                                                      
Value               https://knurth7d3c23mw6crkrcr4elua0mhsgk.lambda-url.us-east-1.on.aws/                                                  

Key                 ProductsTableName                                                                                                      
Description         Name of the DynamoDB Products table                                                                                    
Value               techmoda-ai-diego-pina-Products                                                                                        

Key                 Region                                                                                                                 
Description         AWS Region                                                                                                             
Value               us-east-1                                                                                                              

Key                 FrontendUrl                                                                                                            
Description         CloudFront URL for the frontend                                                                                        
Value               https://dk5812p03o32t.cloudfront.net                                                                                   
--------------------------------------------------------------------------------------------------------------------------------------------


Successfully created/updated stack - techmoda-ai-diego-pina in us-east-1

participant:/workshop/capstone$ URL=$(aws cloudformation describe-stacks --stack-name techmoda-ai --region us-east-1 \
  --query "Stacks[0].Outputs[?OutputKey=='ModerateImageUrl'].OutputValue" --output text)
participant:/workshop/capstone$ echo $URL

participant:/workshop/capstone$ URL=$(aws cloudformation describe-stacks --stack-name techmoda-ai-diego-pina --region us-east-1 \
  --query "Stacks[0].Outputs[?OutputKey=='ModerateImageUrl'].OutputValue" --output text)
participant:/workshop/capstone$ echo $URL
https://knurth7d3c23mw6crkrcr4elua0mhsgk.lambda-url.us-east-1.on.aws/
participant:/workshop/capstone$ API=$(echo"https://ztlckzl7n5h2e44bho5ip4dwly0tnbse.lambda-url.us-east-1.on.aws/")
bash: echohttps://ztlckzl7n5h2e44bho5ip4dwly0tnbse.lambda-url.us-east-1.on.aws/: No such file or directory
participant:/workshop/capstone$ aws cloudformation describe-stacks --stack-name techmoda-ai-diego-pina --region us-east-1 \
  --query 'Stacks[0].Outputs' --output table
------------------------------------------------------------------------------------------------------------------------------------------------------------------------
|                                                                            DescribeStacks                                                                            |
+----------------------------------------------------------------------+---------------------+-------------------------------------------------------------------------+
|                              Description                             |      OutputKey      |                               OutputValue                               |
+----------------------------------------------------------------------+---------------------+-------------------------------------------------------------------------+
|  Base API URL (Lambda Function URL del router CRUD). Termina en '/'. |  ApiUrl             |  https://ztlckzl7n5h2e44bho5ip4dwly0tnbse.lambda-url.us-east-1.on.aws/  |
|  S3 Bucket name for frontend                                         |  FrontendBucketName |  techmoda-ai-diego-pina-diego-pina-frontend-281248178297                |
|  S1 Function URL                                                     |  EnrichLabelsUrl    |  https://jbhzo7gnrl6eflprz77ldpxlua0ntgrs.lambda-url.us-east-1.on.aws/  |
|                                                                      |  ModerateImageUrl   |  https://knurth7d3c23mw6crkrcr4elua0mhsgk.lambda-url.us-east-1.on.aws/  |
|  Name of the DynamoDB Products table                                 |  ProductsTableName  |  techmoda-ai-diego-pina-Products                
participant:/workshop/capstone$ aws dynamodb scan --table-name "$TABLE" --region us-east-1 \  
  --query 'Items[*].[productId, name]' --output table

usage: aws [options] <command> <subcommand> [<subcommand> ...] [parameters]
To see help text, you can run:

  aws help
  aws <command> help
  aws <command> <subcommand> help


aws: [ERROR]: Unknown options:
 : command not found
participant:/workshop/capstone$ bash scripts/status.sh
==========================================
  TechModa - Estado del Despliegue
==========================================

🔍 Buscando stack: techmoda-ai-diego-pina

📊 Estado del Stack
-------------------------------------------
Nombre: techmoda-ai-diego-pina
Estado: UPDATE_COMPLETE

📋 Información del Despliegue
-------------------------------------------
🔗 API Backend:
   https://ztlckzl7n5h2e44bho5ip4dwly0tnbse.lambda-url.us-east-1.on.aws/

   Endpoints disponibles:
   • GET    https://ztlckzl7n5h2e44bho5ip4dwly0tnbse.lambda-url.us-east-1.on.aws//products
   • POST   https://ztlckzl7n5h2e44bho5ip4dwly0tnbse.lambda-url.us-east-1.on.aws//products
   • GET    https://ztlckzl7n5h2e44bho5ip4dwly0tnbse.lambda-url.us-east-1.on.aws//products/{id}
   • PUT    https://ztlckzl7n5h2e44bho5ip4dwly0tnbse.lambda-url.us-east-1.on.aws//products/{id}
   • DELETE https://ztlckzl7n5h2e44bho5ip4dwly0tnbse.lambda-url.us-east-1.on.aws//products/{id}

🌐 Frontend Web:
   https://dk5812p03o32t.cloudfront.net

🗄️  Base de Datos:
   Tabla: techmoda-ai-diego-pina-Products
   Productos: 8

==========================================

📝 Comandos útiles:
   • Probar API:     curl https://ztlckzl7n5h2e44bho5ip4dwly0tnbse.lambda-url.us-east-1.on.aws//products
   • Ver logs:       ./scripts/logs.sh
   • Tail logs:      ./scripts/logs.sh --tail
   • Ver errores:    ./scripts/logs.sh --errors
   • Re-desplegar:   ./scripts/deploy-all.sh
   • Eliminar todo:  ./scripts/delete-all.sh
==========================================
participant:/workshop/capstone$ aws dynamodb scan --table-name techmoda-ai-Products --region us-east-1
{
    "Items": [
        {
            "imageUrl": {
                "S": "REEMPLAZAR_CON_TU_IMAGEN: s3://<stack>-frontend/assets/tenis-blancos.jpg"
            },
            "updatedAt": {
                "S": "2026-09-01T19:12:17.193Z"
            },
            "category": {
                "S": "Calzado"
            },
            "createdAt": {
                "S": "2026-09-01T19:12:17.193Z"
            },
            "stock": {
                "N": "25"
            },
            "description": {
                "S": "Sneakers de cuero sintético blanco, suela de goma."
            },
            "price": {
                "N": "74.5"
            },
            "name": {
                "S": "Tenis blancos minimalistas"
            },
            "productId": {
                "S": "62edad8e-e5ac-4c6f-962d-06e331a3dbfe"
            }
        },
        {
            "imageUrl": {
                "S": "REEMPLAZAR_CON_TU_IMAGEN: s3://<stack>-frontend/assets/vestido-floral.jpg"
            },
            "updatedAt": {
                "S": "2026-09-01T19:12:35.847Z"
            },
            "category": {
                "S": "Vestidos"
            },
            "createdAt": {
                "S": "2026-09-01T19:12:35.847Z"
            },
            "stock": {
                "N": "12"
            },
            "price": {
                "N": "59.9"
            },
            "description": {
                "S": "Vestido midi de gasa con estampado floral, manga corta."
            },
            "name": {
                "S": "Vestido midi floral"
            },
            "productId": {
                "S": "fa715e81-c197-4bd4-8c5d-5eb30fdcd4ce"
            }
        },
        {
            "imageUrl": {
                "S": "REEMPLAZAR_CON_TU_IMAGEN: s3://<stack>-frontend/assets/bolso-tote.jpg"
            },
            "updatedAt": {
                "S": "2026-09-01T19:12:35.983Z"
            },
            "category": {
                "S": "Accesorios"
            },
            "createdAt": {
                "S": "2026-09-01T19:12:35.983Z"
            },
            "stock": {
                "N": "15"
            },
            "description": {
                "S": "Bolso tote de lona resistente, asas largas, color arena."
            },
            "price": {
                "N": "39.99"
            },
            "name": {
                "S": "Bolso tote de lona"
            },
            "productId": {
                "S": "fa14e775-6c01-4da5-a5cd-8307a5942b69"
            }
        },
        {
            "imageUrl": {
                "S": "REEMPLAZAR_CON_TU_IMAGEN: s3://<stack>-frontend/assets/vestido-floral.jpg"
            },
            "updatedAt": {
                "S": "2026-09-01T19:12:17.000Z"
            },
            "category": {
                "S": "Vestidos"
            },
            "createdAt": {
                "S": "2026-09-01T19:12:17.000Z"
            },
            "stock": {
                "N": "12"
            },
            "price": {
                "N": "59.9"
            },
            "description": {
                "S": "Vestido midi de gasa con estampado floral, manga corta."
            },
            "name": {
                "S": "Vestido midi floral"
            },
            "productId": {
                "S": "af08c00c-4a9f-424b-a914-32433951151c"
            }
        },
        {
            "imageUrl": {
                "S": "REEMPLAZAR_CON_TU_IMAGEN: s3://<stack>-frontend/assets/chaqueta-denim.jpg"
            },
            "updatedAt": {
                "S": "2026-09-01T19:12:35.903Z"
            },
            "category": {
                "S": "Chaquetas"
            },
            "createdAt": {
                "S": "2026-09-01T19:12:35.903Z"
            },
            "stock": {
                "N": "8"
            },
            "price": {
                "N": "89"
            },
            "description": {
                "S": "Chaqueta denim oversize, lavado claro, bolsillos frontales."
            },
            "name": {
                "S": "Chaqueta de mezclilla oversize"
            },
            "productId": {
                "S": "5bfbdbda-385d-4f7a-a3ad-e40ed4aad7e1"
            }
        },
        {
            "imageUrl": {
                "S": "https://m.media-amazon.com/images/I/31uF7aHXBhL._AC_SY1000_.jpg"
            },
            "updatedAt": {
                "S": "2026-09-01T19:24:11.550Z"
            },
            "category": {
                "S": "Ropa"
            },
            "createdAt": {
                "S": "2026-09-01T19:24:11.550Z"
            },
            "stock": {
                "N": "2"
            },
            "description": {
                "S": "camisa de lana azul"
            },
            "price": {
                "N": "2000"
            },
            "name": {
                "S": "camisa"
            },
            "productId": {
                "S": "f9308a02-9efb-4f7d-883f-ac9709786166"
            }
        },
        {
            "imageUrl": {
                "S": "REEMPLAZAR_CON_TU_IMAGEN: s3://<stack>-frontend/assets/tenis-blancos.jpg"
            },
            "updatedAt": {
                "S": "2026-09-01T19:12:35.941Z"
            },
            "category": {
                "S": "Calzado"
            },
            "createdAt": {
                "S": "2026-09-01T19:12:35.941Z"
            },
            "stock": {
                "N": "25"
            },
            "description": {
                "S": "Sneakers de cuero sintético blanco, suela de goma."
            },
            "price": {
                "N": "74.5"
            },
            "name": {
                "S": "Tenis blancos minimalistas"
            },
            "productId": {
                "S": "d08dfda8-284e-438d-a488-bf724c8092a3"
participant:/workshop/capstone$ PRODUCT_ID="f9308a02-9efb-4f7d-883f-ac9709786166"
participant:/workshop/capstone$ echo $PRODUCT_ID
f9308a02-9efb-4f7d-883f-ac9709786166
participant:/workshop/capstone$ curl -s -X POST "${URL%/}/products/PRODUCT_ID/moderate" | python3 -m json.tool
{
    "error": "Producto PRODUCT_ID no encontrado."
}
participant:/workshop/capstone$ API=$(aws cloudformation describe-stacks --stack-name techmoda-ai-diego-pina --region us-east-1 \
       --query "Stacks[0].Outputs[?OutputKey=='ApiUrl'].OutputValue" --output text)
curl -s "${API%/}/products" | python3 -m json.tool
{
    "products": [
        {
            "imageUrl": "https://t3.ftcdn.net/jpg/12/12/92/70/360_F_1212927000_vRzlEZaNCrJNIyhTkUC7pDEm3Q5u18jY.jpg",
            "updatedAt": "2026-09-01T18:40:03.034Z",
            "category": "Vestidos",
            "createdAt": "2026-09-01T18:40:03.034Z",
            "stock": 12,
            "price": 59.9,
            "description": "Vestido midi de gasa con estampado floral, manga corta.",
            "name": "Vestido midi floral",
            "productId": "40b4f736-c537-428f-9df4-c4d094340ab4"
        },
        {
            "imageUrl": "https://dcshoes.mx/cdn/shop/files/DC01664_dcshoes_102_frt1.jpg?v=1775585614&width=493",
            "updatedAt": "2026-09-01T18:40:03.172Z",
            "category": "Calzado",
            "createdAt": "2026-09-01T18:40:03.172Z",
            "stock": 25,
            "description": "Sneakers de cuero sint\u00e9tico blanco, suela de goma.",
            "price": 74.5,
            "name": "Tenis blancos minimalistas",
            "productId": "47abe295-f969-4a42-9e3f-5200566600d1"
        },
        {
            "imageUrl": "REEMPLAZAR_CON_TU_IMAGEN: s3://<stack>-frontend/assets/vestido-floral.jpg",
            "updatedAt": "2026-08-31T19:48:51.603Z",
            "category": "Vestidos",
            "createdAt": "2026-08-31T19:48:51.603Z",
            "stock": 12,
            "price": 59.9,
            "description": "Vestido midi de gasa con estampado floral, manga corta.",
            "name": "Vestido midi floral",
            "productId": "34171c3d-13bb-48ff-b0e2-cb8e20375fb5"
        },
        {
            "imageUrl": "https://resources.claroshop.com/medios-plazavip/t1/17168474877jpg",
            "updatedAt": "2026-09-01T18:40:03.209Z",
            "category": "Accesorios",
            "createdAt": "2026-09-01T18:40:03.209Z",
            "stock": 15,
            "price": 39.99,
            "description": "Bolso tote de lona resistente, asas largas, color arena.",
            "name": "Bolso tote de lona",
            "productId": "88a9f4b1-38ef-4947-83fb-03ef24d9f8ea"
        },
        {
            "aiLabels": [
                "Clothing",
                "Dress",
                "Formal Wear",
                "Evening Dress",
                "Fashion",
                "Gown",
                "Wedding",
                "Wedding Gown"
            ],
            "imageUrl": "s3://techmoda-ai-diego-pina-diego-pina-frontend-281248178297/assets/vestido.jpg",
            "updatedAt": "2026-08-31T20:07:00.437Z",
            "category": "Calzado",
            "createdAt": "2026-08-31T19:48:51.709Z",
            "stock": 25,
            "description": "Sneakers de cuero sint\u00e9tico blanco, suela de goma.",
            "price": 74.5,
            "name": "Tenis blancos minimalistas",
            "productId": "9c7fa9fd-1a9e-4694-bf12-66e1525ce442",
            "aiLabelsRaw": [
                {
                    "name": "Clothing",
                    "confidence": 100
                },
                {
                    "confidence": 100,
                    "name": "Dress"
                },
                {
                    "confidence": 99.97,
                    "name": "Formal Wear"
                },
                {
                    "confidence": 99.88,
                    "name": "Evening Dress"
                },
                {
                    "confidence": 98.2,
                    "name": "Fashion"
                },
                {
                    "name": "Gown",
                    "confidence": 96.45
                },
                {
                    "name": "Wedding",
                    "confidence": 91.79
                },
                {
                    "confidence": 91.79,
                    "name": "Wedding Gown"
                }
            ]
        },
        {
            "imageUrl": "REEMPLAZAR_CON_TU_IMAGEN: s3://<stack>-frontend/assets/bolso-tote.jpg",
            "updatedAt": "2026-08-31T19:48:51.749Z",
            "category": "Accesorios",
            "createdAt": "2026-08-31T19:48:51.749Z",
            "stock": 15,
            "description": "Bolso tote de lona resistente, asas largas, color arena.",
            "price": 39.99,
            "name": "Bolso tote de lona",
            "productId": "f6acd569-cecb-49c3-9eea-bd48ba7e207b"
        },
        {
            "imageUrl": "REEMPLAZAR_CON_TU_IMAGEN: s3://<stack>-frontend/assets/chaqueta-denim.jpg",
            "updatedAt": "2026-08-31T19:48:51.670Z",
            "category": "Chaquetas",
            "createdAt": "2026-08-31T19:48:51.670Z",
            "stock": 8,
            "price": 89,
            "description": "Chaqueta denim oversize, lavado claro, bolsillos frontales.",
            "name": "Chaqueta de mezclilla oversize",
            "productId": "05755354-1e88-43bf-b65b-60d4cd8f0f57"
        },
        {
            "imageUrl": "https://m.media-amazon.com/images/I/517x-fe7x7L._AC_SY1000_.jpg",
            "updatedAt": "2026-09-01T18:40:03.129Z",
            "category": "Chaquetas",
            "createdAt": "2026-09-01T18:40:03.129Z",
            "stock": 8,
            "description": "Chaqueta denim oversize, lavado claro, bolsillos frontales.",
            "price": 89,
            "name": "Chaqueta de mezclilla oversize",
            "productId": "9d4f5396-83ad-4780-a3ee-d4ead506f046"
        }
    ]
}
participant:/workshop/capstone$ PRODUCT_ID="9d4f5396-83ad-4780-a3ee-d4ead506f046"
participant:/workshop/capstone$ curl -s -X POST "${URL%/}/products/PRODUCT_ID/moderate" | python3 -m json.tool
{
    "error": "Producto PRODUCT_ID no encontrado."
}
participant:/workshop/capstone$ echo $URL
https://knurth7d3c23mw6crkrcr4elua0mhsgk.lambda-url.us-east-1.on.aws/
participant:/workshop/capstone$ curl -s -X POST "${URL%/}/products/$PRODUCT_ID/moderate" | python3 -m json.tool
{
    "productId": "9d4f5396-83ad-4780-a3ee-d4ead506f046",
    "moderationStatus": "APPROVED",
    "moderationFlags": [],
    "altText": "Imagen de producto que muestra: Clothing, Coat, Jacket, Pants, Jeans."
}