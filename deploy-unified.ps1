# JobHub Frontend 통합 배포 스크립트
param(
    [string]$EC2_IP = "3.35.136.37",
    [string]$EC2_USER = "ec2-user",
    [string]$KEY_PATH = "C:\Users\user\.ssh\jobhub-key.pem"
)

Write-Host "🚀 JobHub Frontend 통합 배포 시작..." -ForegroundColor Green

try {
    # 1. 최신 코드로 빌드
    Write-Host "📦 Docker 이미지 빌드 중..." -ForegroundColor Yellow
    docker build -t jobhub-frontend:latest .
    if ($LASTEXITCODE -ne 0) { throw "Docker 빌드 실패" }

    # 2. 이미지를 tar 파일로 저장
    Write-Host "💾 Docker 이미지를 tar 파일로 저장 중..." -ForegroundColor Yellow
    docker save jobhub-frontend:latest -o jobhub-frontend.tar
    if ($LASTEXITCODE -ne 0) { throw "Docker save 실패" }

    # 3. EC2 연결 테스트
    Write-Host "🔍 EC2 연결 테스트 중..." -ForegroundColor Yellow
    ssh -o ConnectTimeout=10 -i $KEY_PATH ${EC2_USER}@${EC2_IP} "echo 'SSH 연결 성공'"
    if ($LASTEXITCODE -ne 0) { throw "SSH 연결 실패" }

    # 4. EC2로 파일 전송
    Write-Host "📤 EC2로 이미지 전송 중..." -ForegroundColor Yellow
    scp -i $KEY_PATH -o ConnectTimeout=30 jobhub-frontend.tar ${EC2_USER}@${EC2_IP}:~/
    if ($LASTEXITCODE -ne 0) { throw "파일 전송 실패" }

    # 5. EC2에서 배포 실행
    Write-Host "🛠️  EC2에서 배포 실행 중..." -ForegroundColor Yellow
    
    $deployCommands = "sudo docker stop jobhub-frontend jobhub-frontend-test 2>/dev/null || true; sudo docker rm jobhub-frontend jobhub-frontend-test 2>/dev/null || true; sudo docker load < jobhub-frontend.tar; sudo docker run -d --name jobhub-frontend -p 3000:80 --restart unless-stopped jobhub-frontend:latest; sudo docker ps | grep jobhub; rm -f ~/jobhub-frontend.tar"

    ssh -i $KEY_PATH -o ConnectTimeout=30 ${EC2_USER}@${EC2_IP} $deployCommands
    if ($LASTEXITCODE -ne 0) { throw "EC2 배포 실행 실패" }

    # 6. 로컬 정리
    Write-Host "🧹 로컬 파일 정리 중..." -ForegroundColor Yellow
    Remove-Item -Path "jobhub-frontend.tar" -Force -ErrorAction SilentlyContinue

    # 7. 배포 확인
    Write-Host "✅ 배포 확인 중..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
    
    try {
        $response = Invoke-WebRequest -Uri "http://${EC2_IP}:3000" -TimeoutSec 15 -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Host "🎉 배포 성공! 프론트엔드가 http://${EC2_IP}:3000 에서 실행 중입니다." -ForegroundColor Green
        }
    }
    catch {
        Write-Host "⚠️  배포는 완료되었지만 웹 확인 중 오류 발생. 수동으로 확인해주세요." -ForegroundColor Yellow
        Write-Host "URL: http://${EC2_IP}:3000" -ForegroundColor Cyan
    }

    Write-Host "🏁 배포 프로세스 완료!" -ForegroundColor Green
}
catch {
    Write-Host "❌ 배포 실패: $($_.Exception.Message)" -ForegroundColor Red
    Remove-Item -Path "jobhub-frontend.tar" -Force -ErrorAction SilentlyContinue
    exit 1
}
