#!/usr/bin/env bash
set -e
NAMESPACE=realtime
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/redis-deployment.yaml
kubectl apply -f k8s/chat-deployment.yaml
kubectl apply -f k8s/chat-service.yaml
kubectl apply -f k8s/alb-ingress.yaml
