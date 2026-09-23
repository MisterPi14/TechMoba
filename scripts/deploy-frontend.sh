#!/bin/bash
set -e

# Get stack name from samconfig.toml or use default
STACK_NAME="techmoda-ai"
if [ -f "samconfig.toml" ]; then
    STACK_NAME=$(grep 'stack_name' samconfig.toml | cut -d'"' -f2 || echo "techmoda-ai")
fi

echo "Deploying frontend to S3..."

# Get bucket name from CloudFormation outputs
BUCKET_NAME=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --query 'Stacks[0].Outputs[?OutputKey==`FrontendBucketName`].OutputValue' \
    --output text)

if [ -z "$BUCKET_NAME" ]; then
    echo "Error: Could not find frontend bucket. Deploy the SAM template first."
    exit 1
fi

# Get API URL
API_URL=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --query 'Stacks[0].Outputs[?OutputKey==`ApiUrl`].OutputValue' \
    --output text)

# S8 · Function URL del asistente de compras. Es OPCIONAL: solo existe si se
# desplegó S8 (template.full.yaml o el snippet pegado). Si no está, queda vacía y
# el frontend no monta el chat. El `|| true` evita que `set -e` corte el deploy.
ASSISTANT_URL=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --query 'Stacks[0].Outputs[?OutputKey==`ShoppingAssistantUrl`].OutputValue' \
    --output text 2>/dev/null || true)

if [ "$ASSISTANT_URL" = "None" ]; then
    ASSISTANT_URL=""
fi

echo "Bucket: $BUCKET_NAME"
echo "API URL: $API_URL"
if [ -n "$ASSISTANT_URL" ]; then
    echo "Assistant URL (S8): $ASSISTANT_URL"
else
    echo "Assistant URL (S8): no desplegado — el chat no se monta"
fi
echo ""

# Inject runtime environment configuration
echo "🔧 Injecting runtime configuration..."
./scripts/inject-env.sh \
    --api-url "$API_URL" \
    --assistant-url "$ASSISTANT_URL" \
    --dist-dir frontend/dist
echo ""

# Sync to S3
aws s3 sync frontend/dist/ s3://$BUCKET_NAME/ --delete

echo ""
echo "Frontend deployed successfully!"
echo "CloudFront URL: https://$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --query 'Stacks[0].Outputs[?OutputKey==`FrontendUrl`].OutputValue' \
    --output text | sed 's/https:\/\///')"
