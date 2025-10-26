#!/usr/bin/env bash
set -e
ACCOUNT="662792376491"
REGION="us-east-1"
REPO="chat-app"

# create ecr repo if not exists
aws ecr describe-repositories --repository-names "$REPO" --region "$REGION" >/dev/null 2>&1 || \
  aws ecr create-repository --repository-name "$REPO" --region "$REGION" >/dev/null

# build
docker build -t $REPO:latest ./app

ecr_uri="$ACCOUNT.dkr.ecr.$REGION.amazonaws.com/$REPO:latest"

aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ACCOUNT.dkr.ecr.$REGION.amazonaws.com

docker tag $REPO:latest $ecr_uri
docker push $ecr_uri

echo $ecr_uri
