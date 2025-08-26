#!/bin/bash

# JobHub Frontend 자동 배포 스크립트 (EC2에서 실행용)
# 사용법: EC2에서 이 스크립트를 다운로드하고 실행

echo "=== JobHub Frontend 자동 배포 시작 ==="

# 1. 기존 컨테이너 정리
echo "1. 기존 컨테이너 정리 중..."
sudo docker stop jobhub-frontend jobhub-frontend-test 2>/dev/null || true
sudo docker rm jobhub-frontend jobhub-frontend-test 2>/dev/null || true

# 2. 소스 코드 업데이트
echo "2. 소스 코드 업데이트 중..."
if [ -d "JobHub-frontend" ]; then
    cd JobHub-frontend
    sudo git fetch origin
    sudo git checkout son
    sudo git pull origin son
else
    sudo git clone https://github.com/yjyj0234/JobHub-frontend.git
    cd JobHub-frontend
    sudo git checkout son
fi

# 3. Docker 이미지 빌드
echo "3. Docker 이미지 빌드 중..."
sudo docker build -t jobhub-frontend-latest .

# 4. 새 컨테이너 실행
echo "4. 새 컨테이너 실행 중..."
sudo docker run -d \
  --name jobhub-frontend \
  -p 3000:80 \
  --restart unless-stopped \
  jobhub-frontend-latest

# 5. 상태 확인
echo "5. 배포 상태 확인..."
sudo docker ps | grep jobhub-frontend

# 6. 사용하지 않는 이미지 정리
echo "6. 이미지 정리 중..."
sudo docker image prune -f

echo "=== 배포 완료 ==="
echo "프론트엔드가 포트 3000에서 실행 중입니다."
echo "접속 URL: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):3000"
