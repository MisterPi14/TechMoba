participant:/workshop$ sam build && sam deploy
Error: Template file not found at /workshop/template.yml
participant:/workshop$ cd capstone/
participant:/workshop/capstone$ sam build && sam deploy
Starting Build use cache                                                                                                                       
Building codeuri: /workshop/capstone/functions runtime: nodejs22.x architecture: x86_64 functions: RouterFunction                              
Manifest is not changed for (ModerateImageFunction), running incremental build                                                                 
Building codeuri: /workshop/capstone/sessions/S02-moderation-alttext/functions/moderate-image runtime: python3.12 architecture: x86_64         
functions: ModerateImageFunction                                                                                                               
Manifest is not changed for (AnalyzeSentimentFunction), running incremental build                                                              
Manifest is not changed for (EnrichLabelsFunction), running incremental build                                                                  
Building codeuri: /workshop/capstone/sessions/S01-rekognition-labels/functions/enrich-labels runtime: python3.12 architecture: x86_64          
functions: EnrichLabelsFunction                                                                                                                
Building codeuri: /workshop/capstone/sessions/S03-comprehend-sentiment/functions/analyze-sentiment runtime: python3.12 architecture: x86_64    
functions: AnalyzeSentimentFunction                                                                                                            
Manifest file is changed (new hash: cacc28ae47a06143bdf6e075862f38cb) or dependency folder (.aws-sam/deps/cf6a125a-171c-44d7-b0e7-81e261fdd37d)
is missing for (TranslateCatalogFunction), downloading dependencies and copying/building source                                                
Building codeuri: /workshop/capstone/sessions/S04-translate-multilang/functions/translate-catalog runtime: python3.12 architecture: x86_64     
functions: TranslateCatalogFunction                                                                                                            
 Running PythonPipBuilder:CopySource                                                                                                           
 Running PythonPipBuilder:CopySource                                                                                                           
package.json file not found. Continuing the build without dependencies.                                                                        
 Running NodejsNpmBuilder:CopySource                                                                                                           
 Running PythonPipBuilder:CopySource                                                                                                           
 Running PythonPipBuilder:CleanUp                                                                                                              
 Running PythonPipBuilder:ResolveDependencies                                                                                                  
 Running PythonPipBuilder:CopySource                                                                                                           
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
                                                                                                                                               
        File with same data already exists at 1dcbc0f244cd755d14fdf1e81e96f035, skipping upload                                                

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

        Uploading to bf4e9d81ef4946add1f8c862bcffde0e.template  8526 / 8526  (100.00%)


Waiting for changeset to be created..

CloudFormation stack changeset
-----------------------------------------------------------------------------------------------------------------------------------------
Operation                          LogicalResourceId                  ResourceType                       Replacement                      
-----------------------------------------------------------------------------------------------------------------------------------------
+ Add                              TranslateCatalogFunctionRole       AWS::IAM::Role                     N/A                              
+ Add                              TranslateCatalogFunctionURLInvok   AWS::Lambda::Permission            N/A                              
                                   eAllowPublicAccess                                                                                     
+ Add                              TranslateCatalogFunctionUrlPubli   AWS::Lambda::Permission            N/A                              
                                   cPermissions                                                                                           
+ Add                              TranslateCatalogFunctionUrl        AWS::Lambda::Url                   N/A                              
+ Add                              TranslateCatalogFunction           AWS::Lambda::Function              N/A                              
-----------------------------------------------------------------------------------------------------------------------------------------


Changeset created successfully. arn:aws:cloudformation:us-east-1:281248178297:changeSet/samcli-deploy1788301756/4efd1f88-a1d8-42b0-a6af-3fecc2a0c9b7


2026-09-01 22:29:27 - Waiting for stack create/update to complete

CloudFormation events from stack operations (refresh every 5.0 seconds)
-----------------------------------------------------------------------------------------------------------------------------------------
ResourceStatus                     ResourceType                       LogicalResourceId                  ResourceStatusReason             
-----------------------------------------------------------------------------------------------------------------------------------------
UPDATE_IN_PROGRESS                 AWS::CloudFormation::Stack         techmoda-ai-diego-pina             User Initiated                   
CREATE_IN_PROGRESS                 AWS::IAM::Role                     TranslateCatalogFunctionRole       -                                
CREATE_IN_PROGRESS                 AWS::IAM::Role                     TranslateCatalogFunctionRole       Resource creation Initiated      
CREATE_COMPLETE                    AWS::IAM::Role                     TranslateCatalogFunctionRole       -                                
CREATE_IN_PROGRESS                 AWS::Lambda::Function              TranslateCatalogFunction           -                                
CREATE_IN_PROGRESS                 AWS::Lambda::Function              TranslateCatalogFunction           Resource creation Initiated      
CREATE_COMPLETE                    AWS::Lambda::Function              TranslateCatalogFunction           -                                
CREATE_IN_PROGRESS                 AWS::Lambda::Permission            TranslateCatalogFunctionURLInvok   -                                
                                                                      eAllowPublicAccess                                                  
CREATE_IN_PROGRESS                 AWS::Lambda::Url                   TranslateCatalogFunctionUrl        -                                
CREATE_IN_PROGRESS                 AWS::Lambda::Permission            TranslateCatalogFunctionUrlPubli   -                                
                                                                      cPermissions                                                        
CREATE_IN_PROGRESS                 AWS::Lambda::Url                   TranslateCatalogFunctionUrl        Resource creation Initiated      
CREATE_IN_PROGRESS                 AWS::Lambda::Permission            TranslateCatalogFunctionUrlPubli   Resource creation Initiated      
                                                                      cPermissions                                                        
CREATE_IN_PROGRESS                 AWS::Lambda::Permission            TranslateCatalogFunctionURLInvok   Resource creation Initiated      
                                                                      eAllowPublicAccess                                                  
CREATE_COMPLETE                    AWS::Lambda::Permission            TranslateCatalogFunctionUrlPubli   -                                
                                                                      cPermissions                                                        
CREATE_COMPLETE                    AWS::Lambda::Url                   TranslateCatalogFunctionUrl        -                                
CREATE_COMPLETE                    AWS::Lambda::Permission            TranslateCatalogFunctionURLInvok   -                                
                                                                      eAllowPublicAccess                                                  
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

Key                 TranslateCatalogUrl                                                                                                    
Description         -                                                                                                                      
Value               https://ui2y2vssbhwzavgu7qb6vl2vs40cxxaz.lambda-url.us-east-1.on.aws/                                                  

Key                 FrontendUrl                                                                                                            
Description         CloudFront URL for the frontend                                                                                        
Value               https://dk5812p03o32t.cloudfront.net                                                                                   
--------------------------------------------------------------------------------------------------------------------------------------------


Successfully created/updated stack - techmoda-ai-diego-pina in us-east-1

participant:/workshop/capstone$ URL=$(aws cloudformation describe-stacks --stack-name techmoda-ai --region us-east-1 \
  --query "Stacks[0].Outputs[?OutputKey=='TranslateCatalogUrl'].OutputValue" --output text)

aws: [ERROR]: An error occurred (ValidationError) when calling the DescribeStacks operation: Stack with id techmoda-ai does not exist
participant:/workshop/capstone$ URL=$(aws cloudformation describe-stacks --stack-name techmoda-ai-diego-pina --region us-east-1 \
  --query "Stacks[0].Outputs[?OutputKey=='TranslateCatalogUrl'].OutputValue" --output text)
participant:/workshop/capstone$ echo $URL
https://ui2y2vssbhwzavgu7qb6vl2vs40cxxaz.lambda-url.us-east-1.on.aws/
participant:/workshop/capstone$ PRODUCT_ID="9d4f5396-83ad-4780-a3ee-d4ead506f046"
participant:/workshop/capstone$ curl -s -X POST "${URL%/}/products/PRODUCT_ID/translate" \
  -H "Content-Type: application/json" -d '{"target":"en"}' | python3 -m json.tool
{
    "productId": "PRODUCT_ID",
    "target": "en",
    "translation": {
        "name": "",
        "description": ""
    }
}
participant:/workshop/capstone$ curl -s -X POST "${URL%/}/products/$PRODUCT_ID/translate"   -H "Content-Type: application/json" -d '{"target":"
en"}' | python3 -m json.tool
{
    "error": "Fallo al traducir",
    "detail": "An error occurred (AccessDeniedException) when calling the TranslateText operation: com.amazonaws.translate.dataplane.DownstreamDependencyAccessDeniedException: User: arn:aws:sts::281248178297:assumed-role/techmoda-ai-diego-pina-TranslateCatalogFunctionRole-8reTZBkgMJiG/techmoda-ai-diego-pina-TranslateCatalog is not authorized to perform: comprehend:DetectDominantLanguage because no identity-based policy allows the comprehend:DetectDominantLanguage action"
}
participant:/workshop/capstone$ curl -s -X POST "${URL%/}/products/9d4f5396-83ad-4780-a3ee-d4ead506f046/translate"   -H "Content-Type: applicat
ion/json" -d '{"target":"en"}' | python3 -m json.tool
{
    "error": "Fallo al traducir",
    "detail": "An error occurred (AccessDeniedException) when calling the TranslateText operation: com.amazonaws.translate.dataplane.DownstreamDependencyAccessDeniedException: User: arn:aws:sts::281248178297:assumed-role/techmoda-ai-diego-pina-TranslateCatalogFunctionRole-8reTZBkgMJiG/techmoda-ai-diego-pina-TranslateCatalog is not authorized to perform: comprehend:DetectDominantLanguage because no identity-based policy allows the comprehend:DetectDominantLanguage action"
}
participant:/workshop/capstone$ curl -s -X POST "${URL%/}/products/9d4f5396-83ad-4780-a3ee-d4ead506f046/translate"   -H "Content-Type: application/json" -d '{"target":"en"}' | python3 -m json.tool
{
    "error": "Fallo al traducir",
    "detail": "An error occurred (AccessDeniedException) when calling the TranslateText operation: com.amazonaws.translate.dataplane.DownstreamDependencyAccessDeniedException: User: arn:aws:sts::281248178297:assumed-role/techmoda-ai-diego-pina-TranslateCatalogFunctionRole-8reTZBkgMJiG/techmoda-ai-diego-pina-TranslateCatalog is not authorized to perform: comprehend:DetectDominantLanguage because no identity-based policy allows the comprehend:DetectDominantLanguage action"
}
participant:/workshop/capstone$ curl -s -X POST "${URL%/}/products/9d4f5396-83ad-4780-a3ee-d4ead506f046/translate"   -H "Content-Type: application/json" -d '{"target":"en"}' | python3 -m json.tool
{
    "error": "Fallo al traducir",
    "detail": "An error occurred (AccessDeniedException) when calling the TranslateText operation: com.amazonaws.translate.dataplane.DownstreamDependencyAccessDeniedException: User: arn:aws:sts::281248178297:assumed-role/techmoda-ai-diego-pina-TranslateCatalogFunctionRole-8reTZBkgMJiG/techmoda-ai-diego-pina-TranslateCatalog is not authorized to perform: comprehend:DetectDominantLanguage because no identity-based policy allows the comprehend:DetectDominantLanguage action"
}
participant:/workshop/capstone$ curl -s -X POST "${URL%/}/products/9d4f5396-83ad-4780-a3ee-d4ead506f046/translate"   -H "Content-Type: application/json" -d '{"target":"en"}' | python3 -m json.tool
{
    "error": "Fallo al traducir",
    "detail": "An error occurred (AccessDeniedException) when calling the TranslateText operation: com.amazonaws.translate.dataplane.DownstreamDependencyAccessDeniedException: User: arn:aws:sts::281248178297:assumed-role/techmoda-ai-diego-pina-TranslateCatalogFunctionRole-8reTZBkgMJiG/techmoda-ai-diego-pina-TranslateCatalog is not authorized to perform: comprehend:DetectDominantLanguage because no identity-based policy allows the comprehend:DetectDominantLanguage action"
}
participant:/workshop/capstone$ sam build && sam deploy
Starting Build use cache                                                                                                                       
Building codeuri: /workshop/capstone/functions runtime: nodejs22.x architecture: x86_64 functions: RouterFunction                              
Manifest is not changed for (EnrichLabelsFunction), running incremental build                                                                  
Building codeuri: /workshop/capstone/sessions/S01-rekognition-labels/functions/enrich-labels runtime: python3.12 architecture: x86_64          
functions: EnrichLabelsFunction                                                                                                                
Manifest is not changed for (AnalyzeSentimentFunction), running incremental build                                                              
Building codeuri: /workshop/capstone/sessions/S03-comprehend-sentiment/functions/analyze-sentiment runtime: python3.12 architecture: x86_64    
functions: AnalyzeSentimentFunction                                                                                                            
Manifest is not changed for (ModerateImageFunction), running incremental build                                                                 
Building codeuri: /workshop/capstone/sessions/S02-moderation-alttext/functions/moderate-image runtime: python3.12 architecture: x86_64         
functions: ModerateImageFunction                                                                                                               
Manifest is not changed for (TranslateCatalogFunction), running incremental build                                                              
Building codeuri: /workshop/capstone/sessions/S04-translate-multilang/functions/translate-catalog runtime: python3.12 architecture: x86_64     
functions: TranslateCatalogFunction                                                                                                            
package.json file not found. Continuing the build without dependencies.                                                                        
 Running PythonPipBuilder:CopySource                                                                                                           
 Running PythonPipBuilder:CopySource                                                                                                           
 Running NodejsNpmBuilder:CopySource                                                                                                           
 Running PythonPipBuilder:CopySource                                                                                                           
 Running PythonPipBuilder:CopySource                                                                                                           
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
                                                                                                                                               
        File with same data already exists at 1dcbc0f244cd755d14fdf1e81e96f035, skipping upload                                                

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

        Uploading to 27811bffcaa507bc337431b9735672da.template  8584 / 8584  (100.00%)


Waiting for changeset to be created..

CloudFormation stack changeset
-----------------------------------------------------------------------------------------------------------------------------------------
Operation                          LogicalResourceId                  ResourceType                       Replacement                      
-----------------------------------------------------------------------------------------------------------------------------------------
* Modify                           TranslateCatalogFunctionRole       AWS::IAM::Role                     False                            
* Modify                           TranslateCatalogFunction           AWS::Lambda::Function              False                            
-----------------------------------------------------------------------------------------------------------------------------------------


Changeset created successfully. arn:aws:cloudformation:us-east-1:281248178297:changeSet/samcli-deploy1788302736/4a7fc9a3-b5f8-426a-baa9-eda5f32c470f


2026-09-01 22:45:47 - Waiting for stack create/update to complete

CloudFormation events from stack operations (refresh every 5.0 seconds)
-----------------------------------------------------------------------------------------------------------------------------------------
ResourceStatus                     ResourceType                       LogicalResourceId                  ResourceStatusReason             
-----------------------------------------------------------------------------------------------------------------------------------------
UPDATE_IN_PROGRESS                 AWS::CloudFormation::Stack         techmoda-ai-diego-pina             User Initiated                   
UPDATE_IN_PROGRESS                 AWS::IAM::Role                     TranslateCatalogFunctionRole       -                                
UPDATE_COMPLETE                    AWS::IAM::Role                     TranslateCatalogFunctionRole       -                                
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

Key                 TranslateCatalogUrl                                                                                                    
Description         -                                                                                                                      
Value               https://ui2y2vssbhwzavgu7qb6vl2vs40cxxaz.lambda-url.us-east-1.on.aws/                                                  

Key                 FrontendUrl                                                                                                            
Description         CloudFront URL for the frontend                                                                                        
Value               https://dk5812p03o32t.cloudfront.net                                                                                   
--------------------------------------------------------------------------------------------------------------------------------------------


Successfully created/updated stack - techmoda-ai-diego-pina in us-east-1

participant:/workshop/capstone$ curl -s -X POST "${URL%/}/products/9d4f5396-83ad-4780-a3ee-d4ead506f046/translate"   -H "Content-Type: application/json" -d '{"target":"en"}' | python3 -m json.tool
{
    "productId": "9d4f5396-83ad-4780-a3ee-d4ead506f046",
    "target": "en",
    "translation": {
        "name": "Oversized denim jacket",
        "description": "Oversized denim jacket, light wash, front pockets."
    }
}