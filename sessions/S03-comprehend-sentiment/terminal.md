participant:/workshop$ sam build && sam deploy
Error: Template file not found at /workshop/template.yml
participant:/workshop$ cd capstone/
participant:/workshop/capstone$ sam build && sam deploy
Starting Build use cache                                                                                                                       
Building codeuri: /workshop/capstone/functions runtime: nodejs22.x architecture: x86_64 functions: RouterFunction                              
Manifest is not changed for (EnrichLabelsFunction), running incremental build                                                                  
Building codeuri: /workshop/capstone/sessions/S01-rekognition-labels/functions/enrich-labels runtime: python3.12 architecture: x86_64          
functions: EnrichLabelsFunction                                                                                                                
Manifest is not changed for (ModerateImageFunction), running incremental build                                                                 
Building codeuri: /workshop/capstone/sessions/S02-moderation-alttext/functions/moderate-image runtime: python3.12 architecture: x86_64         
functions: ModerateImageFunction                                                                                                               
Manifest file is changed (new hash: cacc28ae47a06143bdf6e075862f38cb) or dependency folder (.aws-sam/deps/52976664-364b-4cfa-b35e-38b21f2a2309)
is missing for (AnalyzeSentimentFunction), downloading dependencies and copying/building source                                                
Building codeuri: /workshop/capstone/sessions/S03-comprehend-sentiment/functions/analyze-sentiment runtime: python3.12 architecture: x86_64    
functions: AnalyzeSentimentFunction                                                                                                            
 Running PythonPipBuilder:CopySource                                                                                                           
 Running PythonPipBuilder:CopySource                                                                                                           
package.json file not found. Continuing the build without dependencies.                                                                        
 Running NodejsNpmBuilder:CopySource                                                                                                           
 Running PythonPipBuilder:CleanUp                                                                                                              
 Running PythonPipBuilder:ResolveDependencies                                                                                                  
 Running PythonPipBuilder:CopySource                                                                                                           
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
                                                                                                                                               
        File with same data already exists at df9c3b547342b8db2ff5be64877f8f71, skipping upload                                                

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

        Uploading to 88b84d9c9f1ef659d592f671f586cd9f.template  7518 / 7518  (100.00%)


Waiting for changeset to be created..

CloudFormation stack changeset
-----------------------------------------------------------------------------------------------------------------------------------------
Operation                          LogicalResourceId                  ResourceType                       Replacement                      
-----------------------------------------------------------------------------------------------------------------------------------------
+ Add                              AnalyzeSentimentFunctionRole       AWS::IAM::Role                     N/A                              
+ Add                              AnalyzeSentimentFunctionURLInvok   AWS::Lambda::Permission            N/A                              
                                   eAllowPublicAccess                                                                                     
+ Add                              AnalyzeSentimentFunctionUrlPubli   AWS::Lambda::Permission            N/A                              
                                   cPermissions                                                                                           
+ Add                              AnalyzeSentimentFunctionUrl        AWS::Lambda::Url                   N/A                              
+ Add                              AnalyzeSentimentFunction           AWS::Lambda::Function              N/A                              
-----------------------------------------------------------------------------------------------------------------------------------------


Changeset created successfully. arn:aws:cloudformation:us-east-1:281248178297:changeSet/samcli-deploy1788298094/39aab336-06a5-4d83-b81f-866de279e45b


2026-09-01 21:28:25 - Waiting for stack create/update to complete

CloudFormation events from stack operations (refresh every 5.0 seconds)
-----------------------------------------------------------------------------------------------------------------------------------------
ResourceStatus                     ResourceType                       LogicalResourceId                  ResourceStatusReason             
-----------------------------------------------------------------------------------------------------------------------------------------
UPDATE_IN_PROGRESS                 AWS::CloudFormation::Stack         techmoda-ai-diego-pina             User Initiated                   
CREATE_IN_PROGRESS                 AWS::IAM::Role                     AnalyzeSentimentFunctionRole       -                                
CREATE_IN_PROGRESS                 AWS::IAM::Role                     AnalyzeSentimentFunctionRole       Resource creation Initiated      
CREATE_COMPLETE                    AWS::IAM::Role                     AnalyzeSentimentFunctionRole       -                                
CREATE_IN_PROGRESS                 AWS::Lambda::Function              AnalyzeSentimentFunction           -                                
CREATE_IN_PROGRESS                 AWS::Lambda::Function              AnalyzeSentimentFunction           Resource creation Initiated      
CREATE_COMPLETE                    AWS::Lambda::Function              AnalyzeSentimentFunction           -                                
CREATE_IN_PROGRESS                 AWS::Lambda::Permission            AnalyzeSentimentFunctionUrlPubli   -                                
                                                                      cPermissions                                                        
CREATE_IN_PROGRESS                 AWS::Lambda::Url                   AnalyzeSentimentFunctionUrl        -                                
CREATE_IN_PROGRESS                 AWS::Lambda::Permission            AnalyzeSentimentFunctionURLInvok   -                                
                                                                      eAllowPublicAccess                                                  
CREATE_IN_PROGRESS                 AWS::Lambda::Permission            AnalyzeSentimentFunctionURLInvok   Resource creation Initiated      
                                                                      eAllowPublicAccess                                                  
CREATE_IN_PROGRESS                 AWS::Lambda::Url                   AnalyzeSentimentFunctionUrl        Resource creation Initiated      
CREATE_IN_PROGRESS                 AWS::Lambda::Permission            AnalyzeSentimentFunctionUrlPubli   Resource creation Initiated      
                                                                      cPermissions                                                        
CREATE_COMPLETE                    AWS::Lambda::Permission            AnalyzeSentimentFunctionURLInvok   -                                
                                                                      eAllowPublicAccess                                                  
CREATE_COMPLETE                    AWS::Lambda::Url                   AnalyzeSentimentFunctionUrl        -                                
CREATE_COMPLETE                    AWS::Lambda::Permission            AnalyzeSentimentFunctionUrlPubli   -                                
                                                                      cPermissions                                                        
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

Key                 AnalyzeSentimentUrl                                                                                                    
Description         -                                                                                                                      
Value               https://7uv7cw44gtn7266hsrkdeysjni0enorm.lambda-url.us-east-1.on.aws/                                                  

Key                 FrontendUrl                                                                                                            
Description         CloudFront URL for the frontend                                                                                        
Value               https://dk5812p03o32t.cloudfront.net                                                                                   
--------------------------------------------------------------------------------------------------------------------------------------------


Successfully created/updated stack - techmoda-ai-diego-pina in us-east-1

participant:/workshop/capstone$ URL=$(aws cloudformation describe-stacks --stack-name techmoda-ai --region us-east-1 \
  --query "Stacks[0].Outputs[?OutputKey=='AnalyzeSentimentUrl'].OutputValue" --output text)
participant:/workshop/capstone$ echo $URL

participant:/workshop/capstone$ URL=$(aws cloudformation describe-stacks --stack-name techmoda-ai-diego-pina --region us-east-1 \
  --query "Stacks[0].Outputs[?OutputKey=='AnalyzeSentimentUrl'].OutputValue" --output text)
participant:/workshop/capstone$ echo $URL
https://7uv7cw44gtn7266hsrkdeysjni0enorm.lambda-url.us-east-1.on.aws/
participant:/workshop/capstone$ curl -s -X POST "${URL%/}/sentiment" \
  -H "Content-Type: application/json" \
  -d '{"text":"Me encantó la tela y el corte, llegó rapidísimo. Lo volvería a comprar."}' \
  | python3 -m json.tool
Expecting value: line 1 column 1 (char 0)
participant:/workshop/capstone$ echo $URL
https://7uv7cw44gtn7266hsrkdeysjni0enorm.lambda-url.us-east-1.on.aws/
participant:/workshop/capstone$ ^C
participant:/workshop/capstone$ curl -s -X POST "${URL%/}/sentiment"   -H "Content-Type: application/json"   -d '{"text":"Me encantó la tela y el corte, llegó rapidísimo. Lo volvería a comprar."}'
Internal Server Errorparticipantbash scripts/logs.sh get AnalyzeSentimentFunction --errorsmentFunction --errors
Error: Unknown option AnalyzeSentimentFunction

Usage: scripts/logs.sh [OPTIONS] [FUNCTION]

View CloudWatch logs for TechModa Lambda functions

Arguments:
  FUNCTION              Function to view (optional, defaults to all)
                        Options: list, create, get, update, delete, all

Options:
  -t, --tail            Follow log output (live tail)
  -f, --filter PATTERN  Filter logs by pattern (case-insensitive)
  -e, --errors          Show only ERROR level logs
  -s, --since TIME      Show logs since time ago (e.g., 10m, 1h, 1d)
                        Default: 10m (10 minutes)
  -h, --help            Show this help message

Examples:
  scripts/logs.sh                              # View all functions (last 10 minutes)
  scripts/logs.sh list                         # View list-items function logs
  scripts/logs.sh --tail                       # Live tail all functions
  scripts/logs.sh create --tail                # Live tail create-item function
  scripts/logs.sh --errors                     # Show only errors from all functions
  scripts/logs.sh list --filter "product"      # Filter list function logs
  scripts/logs.sh --since 1h                   # Show logs from last hour
  scripts/logs.sh update --since 30m --errors  # Show errors from last 30 min

Function names (short aliases):
  list   → ListItemsFunction
  create → CreateItemFunction
  get    → GetItemFunction
  update → UpdateItemFunction
  delete → DeleteItemFunction
  all    → All functions (default)

participant:/workshop/capstone$ aws logs tail /aws/lambda/techmoda-ai-diego-pina-AnalyzeSentiment --follow --region us-east-1
2026-09-01T21:42:56.909000+00:00 2026/09/01/[$LATEST]0ceac769d51f4bcfa00ebd7a42f5bc80 INIT_START Runtime Version: python:3.12.mainlinev2.v31  Runtime Version ARN: arn:aws:lambda:us-east-1::runtime:c1ab740f3656a72d7917665a940f8634df245489445f5a660de5a634d06c5433
2026-09-01T21:42:57.781000+00:00 2026/09/01/[$LATEST]0ceac769d51f4bcfa00ebd7a42f5bc80 START RequestId: c2ebafd0-93fa-4042-af9d-a30e9019293d Version: $LATEST
2026-09-01T21:42:57.781000+00:00 2026/09/01/[$LATEST]0ceac769d51f4bcfa00ebd7a42f5bc80 Event: {"version": "2.0", "routeKey": "$default", "rawPath": "/sentiment", "rawQueryString": "", "headers": {"x-amzn-tls-cipher-suite": "TLS_AES_128_GCM_SHA256", "content-length": "86", "x-amzn-tls-version": "TLSv1.3", "x-amzn-trace-id": "Self=1-6a9746e0-14a823f62843bae349328801;Root=1-6a9746e0-1f360dc5748286e234bbf832", "x-forwarded-proto": "https", "host": "7uv7cw44gtn7266hsrkdeysjni0enorm.lambda-url.us-east-1.on.aws", "x-forwarded-port": "443", "content-type": "application/json", "x-forwarded-for": "98.92.54.45", "accept": "*/*", "user-agent": "curl/8.5.0"}, "requestContext": {"accountId": "anonymous", "apiId": "7uv7cw44gtn7266hsrkdeysjni0enorm", "domainName": "7uv7cw44gtn7266hsrkdeysjni0enorm.lambda-url.us-east-1.on.aws", "domainPrefix": "7uv7cw44gtn7266hsrkdeysjni0enorm", "http": {"method": "POST", "path": "/sentiment", "protocol": "HTTP/1.1", "sourceIp": "98.92.54.45", "userAgent": "curl/8.5.0"}, "requestId": "c2ebafd0-93fa-4042-af9d-a30e9019293d", "routeKey": "$default", "stage": "$default", "time": "01/Sep/2026:21:42:56 +0000", "timeEpoch": 1788298976636}, "body": "{\"text\":\"Me encant\u00f3 la tela y el corte, lleg\u00f3 rapid\u00edsimo. Lo volver\u00eda a comprar.\"}", "isBase64Encoded": false}
2026-09-01T21:42:57.837000+00:00 2026/09/01/[$LATEST]0ceac769d51f4bcfa00ebd7a42f5bc80 [ERROR] ClientError: An error occurred (AccessDeniedException) when calling the DetectDominantLanguage operation: User: arn:aws:sts::281248178297:assumed-role/techmoda-ai-diego-pina-AnalyzeSentimentFunctionRole-JLWVJfdLWTLR/techmoda-ai-diego-pina-AnalyzeSentiment is not authorized to perform: comprehend:DetectDominantLanguage because no identity-based policy allows the comprehend:DetectDominantLanguage action
Traceback (most recent call last):
  File "/var/task/app.py", line 74, in lambda_handler
    results = [_analyze_one(t) for t in texts]
  File "/var/task/app.py", line 48, in _analyze_one
    lang = _detect_language(text)
  File "/var/task/app.py", line 40, in _detect_language
    resp = comprehend.detect_dominant_language(Text=text)
  File "/var/task/botocore/client.py", line 606, in _api_call
    return self._make_api_call(operation_name, kwargs)
  File "/var/task/botocore/context.py", line 123, in wrapper
    return func(*args, **kwargs)
  File "/var/task/botocore/client.py", line 1094, in _make_api_call
    raise error_class(parsed_response, operation_name)
2026-09-01T21:42:57.840000+00:00 2026/09/01/[$LATEST]0ceac769d51f4bcfa00ebd7a42f5bc80 END RequestId: c2ebafd0-93fa-4042-af9d-a30e9019293d
2026-09-01T21:42:57.840000+00:00 2026/09/01/[$LATEST]0ceac769d51f4bcfa00ebd7a42f5bc80 REPORT RequestId: c2ebafd0-93fa-4042-af9d-a30e9019293d  Duration: 58.70 ms       Billed Duration: 927 ms Memory Size: 1024 MB    Max Memory Used: 91 MB  Init Duration: 868.19 ms
XRAY TraceId: 1-6a9746e0-1f360dc5748286e234bbf832       SegmentId: 2e910e0510a4b5e6     Sampled: true

participant:/workshop/capstonsam build && sam deploy
Starting Build use cache                                                                                                                       
Building codeuri: /workshop/capstone/functions runtime: nodejs22.x architecture: x86_64 functions: RouterFunction                              
Manifest is not changed for (ModerateImageFunction), running incremental build                                                                 
Building codeuri: /workshop/capstone/sessions/S02-moderation-alttext/functions/moderate-image runtime: python3.12 architecture: x86_64         
functions: ModerateImageFunction                                                                                                               
Manifest is not changed for (EnrichLabelsFunction), running incremental build                                                                  
Manifest is not changed for (AnalyzeSentimentFunction), running incremental build                                                              
Building codeuri: /workshop/capstone/sessions/S03-comprehend-sentiment/functions/analyze-sentiment runtime: python3.12 architecture: x86_64    
functions: AnalyzeSentimentFunction                                                                                                            
Building codeuri: /workshop/capstone/sessions/S01-rekognition-labels/functions/enrich-labels runtime: python3.12 architecture: x86_64          
functions: EnrichLabelsFunction                                                                                                                
package.json file not found. Continuing the build without dependencies.                                                                        
 Running PythonPipBuilder:CopySource                                                                                                           
 Running PythonPipBuilder:CopySource                                                                                                           
 Running NodejsNpmBuilder:CopySource                                                                                                           
 Running PythonPipBuilder:CopySource                                                                                                           
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
                                                                                                                                               
        File with same data already exists at df9c3b547342b8db2ff5be64877f8f71, skipping upload                                                

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

        Uploading to e8c87e264de276bbdda350d5f6ee884d.template  7576 / 7576  (100.00%)


Waiting for changeset to be created..

CloudFormation stack changeset
-----------------------------------------------------------------------------------------------------------------------------------------
Operation                          LogicalResourceId                  ResourceType                       Replacement                      
-----------------------------------------------------------------------------------------------------------------------------------------
* Modify                           AnalyzeSentimentFunctionRole       AWS::IAM::Role                     False                            
* Modify                           AnalyzeSentimentFunction           AWS::Lambda::Function              False                            
-----------------------------------------------------------------------------------------------------------------------------------------


Changeset created successfully. arn:aws:cloudformation:us-east-1:281248178297:changeSet/samcli-deploy1788299274/e904432c-937d-4009-a77d-cfcc0681e635


2026-09-01 21:48:05 - Waiting for stack create/update to complete

CloudFormation events from stack operations (refresh every 5.0 seconds)
-----------------------------------------------------------------------------------------------------------------------------------------
ResourceStatus                     ResourceType                       LogicalResourceId                  ResourceStatusReason             
-----------------------------------------------------------------------------------------------------------------------------------------
UPDATE_IN_PROGRESS                 AWS::CloudFormation::Stack         techmoda-ai-diego-pina             User Initiated                   
UPDATE_IN_PROGRESS                 AWS::IAM::Role                     AnalyzeSentimentFunctionRole       -                                
UPDATE_COMPLETE                    AWS::IAM::Role                     AnalyzeSentimentFunctionRole       -                                
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

Key                 AnalyzeSentimentUrl                                                                                                    
Description         -                                                                                                                      
Value               https://7uv7cw44gtn7266hsrkdeysjni0enorm.lambda-url.us-east-1.on.aws/                                                  

Key                 FrontendUrl                                                                                                            
Description         CloudFront URL for the frontend                                                                                        
Value               https://dk5812p03o32t.cloudfront.net                                                                                   
--------------------------------------------------------------------------------------------------------------------------------------------


Successfully created/updated stack - techmoda-ai-diego-pina in us-east-1

participant:/workshop/capstone$ curl -s -X POST "${URL%/}/sentiment" \
  -H "Content-Type: application/json" \
  -d '{"text":"Me encantó la tela y el corte, llegó rapidísimo. Lo volvería a comprar."}' \
  | python3 -m json.tool
{
    "count": 1,
    "overallSentiment": "POSITIVE",
    "distribution": {
        "POSITIVE": 1
    },
    "results": [
        {
            "text": "Me encant\u00f3 la tela y el corte, lleg\u00f3 rapid\u00edsimo. Lo volver\u00eda a comprar.",
            "language": "es",
            "sentiment": "POSITIVE",
            "scores": {
                "Positive": 0.9998,
                "Negative": 0.0001,
                "Neutral": 0.0001,
                "Mixed": 0.0
            }
        }
    ]
}
participant:/workshop/capstone$ aws dynamodb scan --table-name "$TABLE" --region us-east-1 \  
  --query 'Items[*].[productId, name]' --output table

usage: aws [options] <command> <subcommand> [<subcommand> ...] [parameters]
To see help text, you can run:

  aws help
  aws <command> help
  aws <command> <subcommand> help


aws: [ERROR]: Unknown options:
 : command not found
participant:/workshop/capstone$ aws dynamodb scan --table-name techmoda-ai-diego-pina-Products --region us-east-1
{
    "Items": [
        {
            "imageUrl": {
                "S": "https://t3.ftcdn.net/jpg/12/12/92/70/360_F_1212927000_vRzlEZaNCrJNIyhTkUC7pDEm3Q5u18jY.jpg"
            },
            "updatedAt": {
                "S": "2026-09-01T18:40:03.034Z"
            },
            "category": {
                "S": "Vestidos"
            },
            "createdAt": {
                "S": "2026-09-01T18:40:03.034Z"
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
                "S": "40b4f736-c537-428f-9df4-c4d094340ab4"
            }
        },
        {
            "imageUrl": {
                "S": "https://dcshoes.mx/cdn/shop/files/DC01664_dcshoes_102_frt1.jpg?v=1775585614&width=493"
            },
            "updatedAt": {
                "S": "2026-09-01T18:40:03.172Z"
            },
            "category": {
                "S": "Calzado"
            },
            "createdAt": {
                "S": "2026-09-01T18:40:03.172Z"
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
                "S": "47abe295-f969-4a42-9e3f-5200566600d1"
            }
        },
        {
            "imageUrl": {
                "S": "REEMPLAZAR_CON_TU_IMAGEN: s3://<stack>-frontend/assets/vestido-floral.jpg"
            },
            "updatedAt": {
                "S": "2026-08-31T19:48:51.603Z"
            },
            "category": {
                "S": "Vestidos"
            },
            "createdAt": {
                "S": "2026-08-31T19:48:51.603Z"
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
                "S": "34171c3d-13bb-48ff-b0e2-cb8e20375fb5"
            }
        },
        {
            "imageUrl": {
                "S": "https://resources.claroshop.com/medios-plazavip/t1/17168474877jpg"
            },
            "updatedAt": {
                "S": "2026-09-01T18:40:03.209Z"
            },
            "category": {
                "S": "Accesorios"
            },
            "createdAt": {
                "S": "2026-09-01T18:40:03.209Z"
            },
            "stock": {
                "N": "15"
            },
            "price": {
                "N": "39.99"
            },
            "description": {
                "S": "Bolso tote de lona resistente, asas largas, color arena."
            },
            "name": {
                "S": "Bolso tote de lona"
            },
            "productId": {
                "S": "88a9f4b1-38ef-4947-83fb-03ef24d9f8ea"
            }
        },
        {
            "aiLabels": {
                "L": [
                    {
                        "S": "Clothing"
                    },
                    {
                        "S": "Dress"
                    },
                    {
                        "S": "Formal Wear"
                    },
                    {
                        "S": "Evening Dress"
                    },
                    {
                        "S": "Fashion"
                    },
                    {
                        "S": "Gown"
                    },
                    {
                        "S": "Wedding"
                    },
                    {
                        "S": "Wedding Gown"
                    }
                ]
            },
            "imageUrl": {
                "S": "s3://techmoda-ai-diego-pina-diego-pina-frontend-281248178297/assets/vestido.jpg"
            },
            "updatedAt": {
                "S": "2026-08-31T20:07:00.437Z"
            },
            "category": {
                "S": "Calzado"
            },
            "createdAt": {
                "S": "2026-08-31T19:48:51.709Z"
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
                "S": "9c7fa9fd-1a9e-4694-bf12-66e1525ce442"
            },
            "aiLabelsRaw": {
                "L": [
                    {
                        "M": {
                            "name": {
                                "S": "Clothing"
                            },
                            "confidence": {
                                "N": "100"
                            }
                        }
                    },
                    {
                        "M": {
                            "confidence": {
                                "N": "100"
                            },
                            "name": {
                                "S": "Dress"
                            }
                        }
                    },
                    {
                        "M": {
                            "confidence": {
                                "N": "99.97"
                            },
                            "name": {
                                "S": "Formal Wear"
                            }
                        }
                    },
                    {
                        "M": {
                            "confidence": {
                                "N": "99.88"
                            },
                            "name": {
                                "S": "Evening Dress"
                            }
                        }
                    },
                    {
                        "M": {
                            "confidence": {
                                "N": "98.2"
                            },
                            "name": {
                                "S": "Fashion"
                            }
                        }
                    },
                    {
                        "M": {
                            "name": {
                                "S": "Gown"
                            },
                            "confidence": {
                                "N": "96.45"
                            }
                        }
                    },
                    {
                        "M": {
                            "name": {
                                "S": "Wedding"
                            },
                            "confidence": {
                                "N": "91.79"
                            }
                        }
                    },
                    {
                        "M": {
                            "confidence": {
                                "N": "91.79"
                            },
                            "name": {
                                "S": "Wedding Gown"
                            }
                        }
                    }
                ]
            }
        },
        {
            "imageUrl": {
                "S": "REEMPLAZAR_CON_TU_IMAGEN: s3://<stack>-frontend/assets/bolso-tote.jpg"
            },
            "updatedAt": {
                "S": "2026-08-31T19:48:51.749Z"
            },
            "category": {
                "S": "Accesorios"
            },
            "createdAt": {
                "S": "2026-08-31T19:48:51.749Z"
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
                "S": "f6acd569-cecb-49c3-9eea-bd48ba7e207b"
            }
        },
        {
            "imageUrl": {
                "S": "REEMPLAZAR_CON_TU_IMAGEN: s3://<stack>-frontend/assets/chaqueta-denim.jpg"
            },
            "updatedAt": {
                "S": "2026-08-31T19:48:51.670Z"
            },
            "category": {
                "S": "Chaquetas"
            },
            "createdAt": {
                "S": "2026-08-31T19:48:51.670Z"
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
                "S": "05755354-1e88-43bf-b65b-60d4cd8f0f57"
            }
        },
        {
            "imageUrl": {
                "S": "https://m.media-amazon.com/images/I/517x-fe7x7L._AC_SY1000_.jpg"
            },
            "moderationStatus": {
                "S": "APPROVED"
            },
            "altText": {
                "S": "Imagen de producto que muestra: Clothing, Coat, Jacket, Pants, Jeans."
            },
            "updatedAt": {
                "S": "2026-09-01T18:40:03.129Z"
            },
            "category": {
                "S": "Chaquetas"
            },
            "createdAt": {
                "S": "2026-09-01T18:40:03.129Z"
            },
            "stock": {
                "N": "8"
            },
            "description": {
                "S": "Chaqueta denim oversize, lavado claro, bolsillos frontales."
            },
            "moderationFlags": {
                "L": []
            },
            "price": {
                "N": "89"
            },
            "name": {
                "S": "Chaqueta de mezclilla oversize"
            },
            "productId": {
                "S": "9d4f5396-83ad-4780-a3ee-d4ead506f046"
            }
        }
    ],
    "Count": 8,
    "ScannedCount": 8,
    "ConsumedCapacity": null
}
participant:/workshop/capstone$ echo $PRODUCT_ID

participant:/workshop/capstone$ PRODUCT_ID="9d4f5396-83ad-4780-a3ee-d4ead506f046"
participant:/workshop/capstone$ echo $PRODUCT_ID
9d4f5396-83ad-4780-a3ee-d4ead506f046
participant:/workshop/capstone$ curl -s -X POST "${URL%/}/sentiment" \
  -H "Content-Type: application/json" \
  -d '{"productId":"PRODUCT_ID","reviews":[
        "Excelente calidad, súper recomendada.",
        "Buena pero el envío tardó tres semanas."]}' \
  | python3 -m json.tool
{
    "count": 2,
    "overallSentiment": "POSITIVE",
    "distribution": {
        "POSITIVE": 1,
        "MIXED": 1
    },
    "results": [
        {
            "text": "Excelente calidad, s\u00faper recomendada.",
            "language": "es",
            "sentiment": "POSITIVE",
            "scores": {
                "Positive": 0.9999,
                "Negative": 0.0,
                "Neutral": 0.0001,
                "Mixed": 0.0
            }
        },
        {
            "text": "Buena pero el env\u00edo tard\u00f3 tres semanas.",
            "language": "es",
            "sentiment": "MIXED",
            "scores": {
                "Positive": 0.0012,
                "Negative": 0.0037,
                "Neutral": 0.0001,
                "Mixed": 0.995
            }
        }
    ]
}
participant:/workshop/capstone$ aws dynamodb scan --table-name techmoda-ai-diego-pina-Products --region us-east-1
{
    "Items": [
        {
            "imageUrl": {
                "S": "https://t3.ftcdn.net/jpg/12/12/92/70/360_F_1212927000_vRzlEZaNCrJNIyhTkUC7pDEm3Q5u18jY.jpg"
            },
            "updatedAt": {
                "S": "2026-09-01T18:40:03.034Z"
            },
            "category": {
                "S": "Vestidos"
            },
            "createdAt": {
                "S": "2026-09-01T18:40:03.034Z"
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
                "S": "40b4f736-c537-428f-9df4-c4d094340ab4"
            }
        },
        {
            "imageUrl": {
                "S": "https://dcshoes.mx/cdn/shop/files/DC01664_dcshoes_102_frt1.jpg?v=1775585614&width=493"
            },
            "updatedAt": {
                "S": "2026-09-01T18:40:03.172Z"
            },
            "category": {
                "S": "Calzado"
            },
            "createdAt": {
                "S": "2026-09-01T18:40:03.172Z"
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
                "S": "47abe295-f969-4a42-9e3f-5200566600d1"
            }
        },
        {
            "imageUrl": {
                "S": "REEMPLAZAR_CON_TU_IMAGEN: s3://<stack>-frontend/assets/vestido-floral.jpg"
            },
            "updatedAt": {
                "S": "2026-08-31T19:48:51.603Z"
            },
            "category": {
                "S": "Vestidos"
            },
            "createdAt": {
                "S": "2026-08-31T19:48:51.603Z"
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
                "S": "34171c3d-13bb-48ff-b0e2-cb8e20375fb5"
            }
        },
        {
            "imageUrl": {
                "S": "https://resources.claroshop.com/medios-plazavip/t1/17168474877jpg"
            },
            "updatedAt": {
                "S": "2026-09-01T18:40:03.209Z"
            },
            "category": {
                "S": "Accesorios"
            },
            "createdAt": {
                "S": "2026-09-01T18:40:03.209Z"
            },
            "stock": {
                "N": "15"
            },
            "price": {
                "N": "39.99"
            },
            "description": {
                "S": "Bolso tote de lona resistente, asas largas, color arena."
            },
            "name": {
                "S": "Bolso tote de lona"
            },
            "productId": {
                "S": "88a9f4b1-38ef-4947-83fb-03ef24d9f8ea"
            }
        },
        {
            "aiLabels": {
                "L": [
                    {
                        "S": "Clothing"
                    },
                    {
                        "S": "Dress"
                    },
                    {
                        "S": "Formal Wear"
                    },
                    {
                        "S": "Evening Dress"
                    },
                    {
                        "S": "Fashion"
                    },
                    {
                        "S": "Gown"
                    },
                    {
                        "S": "Wedding"
                    },
                    {
                        "S": "Wedding Gown"
                    }
                ]
            },
            "imageUrl": {
                "S": "s3://techmoda-ai-diego-pina-diego-pina-frontend-281248178297/assets/vestido.jpg"
            },
            "updatedAt": {
                "S": "2026-08-31T20:07:00.437Z"
            },
            "category": {
                "S": "Calzado"
            },
            "createdAt": {
                "S": "2026-08-31T19:48:51.709Z"
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
                "S": "9c7fa9fd-1a9e-4694-bf12-66e1525ce442"
            },
            "aiLabelsRaw": {
                "L": [
                    {
                        "M": {
                            "name": {
                                "S": "Clothing"
                            },
                            "confidence": {
                                "N": "100"
                            }
                        }
                    },
                    {
                        "M": {
                            "confidence": {
                                "N": "100"
                            },
                            "name": {
                                "S": "Dress"
                            }
                        }
                    },
                    {
                        "M": {
                            "confidence": {
                                "N": "99.97"
                            },
                            "name": {
                                "S": "Formal Wear"
                            }
                        }
                    },
                    {
                        "M": {
                            "confidence": {
                                "N": "99.88"
                            },
                            "name": {
                                "S": "Evening Dress"
                            }
                        }
                    },
                    {
                        "M": {
                            "confidence": {
                                "N": "98.2"
                            },
                            "name": {
                                "S": "Fashion"
                            }
                        }
                    },
                    {
                        "M": {
                            "name": {
                                "S": "Gown"
                            },
                            "confidence": {
                                "N": "96.45"
                            }
                        }
                    },
                    {
                        "M": {
                            "name": {
                                "S": "Wedding"
                            },
                            "confidence": {
                                "N": "91.79"
                            }
                        }
                    },
                    {
                        "M": {
                            "confidence": {
                                "N": "91.79"
                            },
                            "name": {
                                "S": "Wedding Gown"
                            }
                        }
                    }
                ]
            }
        },
        {
            "imageUrl": {
                "S": "REEMPLAZAR_CON_TU_IMAGEN: s3://<stack>-frontend/assets/bolso-tote.jpg"
            },
            "updatedAt": {
                "S": "2026-08-31T19:48:51.749Z"
            },
            "category": {
                "S": "Accesorios"
            },
            "createdAt": {
                "S": "2026-08-31T19:48:51.749Z"
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
                "S": "f6acd569-cecb-49c3-9eea-bd48ba7e207b"
            }
        },
        {
            "imageUrl": {
                "S": "REEMPLAZAR_CON_TU_IMAGEN: s3://<stack>-frontend/assets/chaqueta-denim.jpg"
            },
            "updatedAt": {
                "S": "2026-08-31T19:48:51.670Z"
            },
            "category": {
                "S": "Chaquetas"
            },
            "createdAt": {
                "S": "2026-08-31T19:48:51.670Z"
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
                "S": "05755354-1e88-43bf-b65b-60d4cd8f0f57"
            }
        },
        {
            "imageUrl": {
                "S": "https://m.media-amazon.com/images/I/517x-fe7x7L._AC_SY1000_.jpg"
            },
            "moderationStatus": {
                "S": "APPROVED"
            },
            "altText": {
                "S": "Imagen de producto que muestra: Clothing, Coat, Jacket, Pants, Jeans."
            },
            "updatedAt": {
                "S": "2026-09-01T18:40:03.129Z"
            },
            "category": {
                "S": "Chaquetas"
            },
            "createdAt": {
                "S": "2026-09-01T18:40:03.129Z"
            },
            "stock": {
                "N": "8"
            },
            "description": {
                "S": "Chaqueta denim oversize, lavado claro, bolsillos frontales."
            },
            "moderationFlags": {
                "L": []
            },
            "price": {
                "N": "89"
            },
            "name": {
                "S": "Chaqueta de mezclilla oversize"
            },
            "productId": {
                "S": "9d4f5396-83ad-4780-a3ee-d4ead506f046"
            }
        },
        {
            "productId": {
                "S": "PRODUCT_ID"
            },
            "reviewSentiment": {
                "S": "POSITIVE"
            },
            "reviewSentimentCounts": {
                "M": {
                    "MIXED": {
                        "N": "1"
                    },
                    "POSITIVE": {
                        "N": "1"
                    }
                }
            }
        }
    ],
    "Count": 9,
    "ScannedCount": 9,
    "ConsumedCapacity": null
}