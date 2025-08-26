# JobHub Frontend Deployment Script for PowerShell
# This script automates the deployment of React frontend to EC2

param(
    [string]$EC2_IP = "3.35.136.37",
    [string]$EC2_USER = "ec2-user",
    [string]$KEY_PATH = "$env:USERPROFILE\.ssh\id_rsa",
    [string]$CONTAINER_NAME = "jobhub-frontend",
    [string]$IMAGE_NAME = "jobhub-frontend:latest",
    [string]$HOST_PORT = "3000",
    [string]$CONTAINER_PORT = "80"
)

Write-Host "🚀 Starting JobHub Frontend Deployment..." -ForegroundColor Green

try {
    # 1. Build Docker image locally
    Write-Host "📦 Building Docker image..." -ForegroundColor Yellow
    docker build -t $IMAGE_NAME .
    if ($LASTEXITCODE -ne 0) { throw "Docker build failed" }

    # 2. Save image to tar file
    Write-Host "💾 Saving Docker image to tar file..." -ForegroundColor Yellow
    docker save $IMAGE_NAME -o jobhub-frontend.tar
    if ($LASTEXITCODE -ne 0) { throw "Docker save failed" }

    # 3. Copy image to EC2
    Write-Host "📤 Copying image to EC2..." -ForegroundColor Yellow
    scp -i $KEY_PATH jobhub-frontend.tar ${EC2_USER}@${EC2_IP}:~/
    if ($LASTEXITCODE -ne 0) { throw "SCP copy failed" }

    # 4. Deploy on EC2
    Write-Host "🛠️ Deploying on EC2..." -ForegroundColor Yellow
    
    $sshCommands = @"
echo 'Loading Docker image...'
docker load < jobhub-frontend.tar

echo 'Stopping existing container if running...'
docker stop $CONTAINER_NAME 2>/dev/null || true
docker rm $CONTAINER_NAME 2>/dev/null || true

echo 'Starting new container...'
docker run -d \
    --name $CONTAINER_NAME \
    -p ${HOST_PORT}:${CONTAINER_PORT} \
    --restart unless-stopped \
    $IMAGE_NAME

echo 'Cleaning up...'
rm -f jobhub-frontend.tar

echo 'Container status:'
docker ps | grep $CONTAINER_NAME
"@

    ssh -i $KEY_PATH ${EC2_USER}@${EC2_IP} $sshCommands
    if ($LASTEXITCODE -ne 0) { throw "SSH deployment failed" }

    # 5. Clean up local tar file
    Write-Host "🧹 Cleaning up local files..." -ForegroundColor Yellow
    Remove-Item -Path "jobhub-frontend.tar" -Force -ErrorAction SilentlyContinue

    # 6. Verify deployment
    Write-Host "✅ Verifying deployment..." -ForegroundColor Yellow
    try {
        $response = Invoke-WebRequest -Uri "http://${EC2_IP}:${HOST_PORT}" -TimeoutSec 10 -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Host "🎉 Deployment successful! Frontend is accessible at http://${EC2_IP}:${HOST_PORT}" -ForegroundColor Green
        }
    }
    catch {
        Write-Host "⚠️ Deployment completed but verification failed. Please check manually." -ForegroundColor Yellow
    }

    Write-Host "🏁 Deployment process completed!" -ForegroundColor Green
}
catch {
    Write-Host "❌ Deployment failed: $($_.Exception.Message)" -ForegroundColor Red
    # Clean up on failure
    Remove-Item -Path "jobhub-frontend.tar" -Force -ErrorAction SilentlyContinue
    exit 1
}
