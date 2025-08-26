# JobHub Frontend 완전 재배포 스크립트
param(
    [string]$EC2_IP = "3.35.136.37",
    [string]$EC2_USER = "ec2-user",
    [string]$KEY_PATH = "C:\Users\user\.ssh\jobhub-key.pem"
)

Write-Host "🚀 JobHub Frontend 완전 재배포 시작..." -ForegroundColor Green

try {
    # 1. 이미지를 tar 파일로 저장
    Write-Host "📦 Docker 이미지를 tar 파일로 저장 중..." -ForegroundColor Yellow
    docker save jobhub-frontend-new:latest -o jobhub-frontend-new.tar
    if ($LASTEXITCODE -ne 0) { throw "Docker save 실패" }

    # 2. EC2로 파일 전송
    Write-Host "📤 EC2로 이미지 전송 중..." -ForegroundColor Yellow
    scp -i $KEY_PATH -o ConnectTimeout=30 jobhub-frontend-new.tar ${EC2_USER}@${EC2_IP}:~/
    if ($LASTEXITCODE -ne 0) { throw "파일 전송 실패" }

    # 3. EC2에서 배포 실행
    Write-Host "🛠️  EC2에서 배포 실행 중..." -ForegroundColor Yellow
    
    $deployScript = @"
echo '=== JobHub Frontend 재배포 시작 ==='

# 기존 컨테이너 모두 정리
echo '1. 기존 컨테이너 정리 중...'
docker stop jobhub-frontend jobhub-frontend-test 2>/dev/null || true
docker rm jobhub-frontend jobhub-frontend-test 2>/dev/null || true

# 새 이미지 로드
echo '2. 새 이미지 로드 중...'
docker load < jobhub-frontend-new.tar

# 새 컨테이너 실행 (포트 3000)
echo '3. 새 컨테이너 실행 중...'
docker run -d \
  --name jobhub-frontend \
  -p 3000:80 \
  --restart unless-stopped \
  jobhub-frontend-new:latest

# 상태 확인
echo '4. 배포 상태 확인...'
docker ps | grep jobhub-frontend

# 파일 정리
echo '5. 임시 파일 정리...'
rm -f ~/jobhub-frontend-new.tar

echo '=== 배포 완료 ==='
"@

    ssh -i $KEY_PATH -o ConnectTimeout=30 ${EC2_USER}@${EC2_IP} "$deployScript"
    if ($LASTEXITCODE -ne 0) { throw "EC2 배포 실행 실패" }

    # 4. 로컬 정리
    Write-Host "🧹 로컬 파일 정리 중..." -ForegroundColor Yellow
    Remove-Item -Path "jobhub-frontend-new.tar" -Force -ErrorAction SilentlyContinue

    # 5. 배포 확인
    Write-Host "✅ 배포 확인 중..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
    
    try {
        $response = Invoke-WebRequest -Uri "http://${EC2_IP}:3000" -TimeoutSec 10 -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Host "🎉 배포 성공! 프론트엔드가 http://${EC2_IP}:3000 에서 실행 중입니다." -ForegroundColor Green
        }
    }
    catch {
        Write-Host "⚠️  배포는 완료되었지만 확인 중 오류 발생. 수동으로 확인해주세요." -ForegroundColor Yellow
    }

    Write-Host "🏁 배포 프로세스 완료!" -ForegroundColor Green
}
catch {
    Write-Host "❌ 배포 실패: $($_.Exception.Message)" -ForegroundColor Red
    # 실패 시 정리
    Remove-Item -Path "jobhub-frontend-new.tar" -Force -ErrorAction SilentlyContinue
    exit 1
}
