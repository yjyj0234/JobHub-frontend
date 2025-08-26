#!/bin/bash

# JobHub Frontend Deployment Script
# This script automates the deployment of React frontend to EC2

set -e  # Exit on error

# Configuration
EC2_IP="3.35.136.37"
EC2_USER="ec2-user"
KEY_PATH="$HOME/.ssh/id_rsa"
CONTAINER_NAME="jobhub-frontend"
IMAGE_NAME="jobhub-frontend:latest"
HOST_PORT="3000"
CONTAINER_PORT="80"

echo "🚀 Starting JobHub Frontend Deployment..."

# 1. Build Docker image locally
echo "📦 Building Docker image..."
docker build -t $IMAGE_NAME .

# 2. Save image to tar file
echo "💾 Saving Docker image to tar file..."
docker save $IMAGE_NAME > jobhub-frontend.tar

# 3. Copy image to EC2
echo "📤 Copying image to EC2..."
scp -i $KEY_PATH jobhub-frontend.tar $EC2_USER@$EC2_IP:~/

# 4. Deploy on EC2
echo "🛠️ Deploying on EC2..."
ssh -i $KEY_PATH $EC2_USER@$EC2_IP << 'EOF'
    echo "Loading Docker image..."
    docker load < jobhub-frontend.tar
    
    echo "Stopping existing container if running..."
    docker stop jobhub-frontend 2>/dev/null || true
    docker rm jobhub-frontend 2>/dev/null || true
    
    echo "Starting new container..."
    docker run -d \
        --name jobhub-frontend \
        -p 3000:80 \
        --restart unless-stopped \
        jobhub-frontend:latest
    
    echo "Cleaning up..."
    rm -f jobhub-frontend.tar
    
    echo "Container status:"
    docker ps | grep jobhub-frontend
EOF

# 5. Clean up local tar file
echo "🧹 Cleaning up local files..."
rm -f jobhub-frontend.tar

# 6. Verify deployment
echo "✅ Verifying deployment..."
if curl -f -s http://$EC2_IP:$HOST_PORT > /dev/null; then
    echo "🎉 Deployment successful! Frontend is accessible at http://$EC2_IP:$HOST_PORT"
else
    echo "⚠️ Deployment completed but verification failed. Please check manually."
fi

echo "🏁 Deployment process completed!"
