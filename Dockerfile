# 1. Node.js 기본 이미지 선택
FROM node:24.15-alpine

# 2. 

# 2. 컨테이너 내부 작업 디렉토리 설정
WORKDIR /app

# 3. 패키지 파일 복사 및 의존성 설치
COPY package*.json .
RUN npm install

# 4. 나머지 소스 코드 복사
COPY . .

# 6. Next.js 빌드 진행
RUN npm run build


# 5. Next.js 프로덕션 서버 실행 (3000 포트 오픈)
CMD ["npm", "start"]
