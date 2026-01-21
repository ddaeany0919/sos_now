# ✅ 배포 전 체크리스트

## 🎯 **현재 완료 상태**

### ✅ 완료된 항목
- [x] 프로덕션 빌드 성공
- [x] PWA manifest.json 생성
- [x] SEO 메타데이터 추가
- [x] layout.tsx에 PWA 설정 추가

### ⏳ 진행 중
- [ ] 아이콘 생성 및 추가
- [ ] 프로덕션 서버 테스트

### 📋 다음 단계
- [ ] Vercel 배포
- [ ] 실제 환경 테스트

---

## 🚀 **배포 순서**

### Step 1: 아이콘 준비 (10분)
**옵션 A - 빠른 테스트용**:
```
1. ICON_GUIDE.md 참고
2. https://www.pwabuilder.com/imageGenerator 접속
3. 간단한 이미지 업로드
4. public/ 폴더에 복사:
   - icon-192.png
   - icon-512.png
   - apple-touch-icon.png
```

**옵션 B - 임시 스킵**:
```
일단 아이콘 없이 배포 후 나중에 추가 가능
(Vercel은 자동으로 재배포됨)
```

### Step 2: 로컬 테스트 (5분)
```bash
# 개발 서버 종료 (현재 실행 중인 npm run dev)
Ctrl + C

# 프로덕션 서버 실행
npm run start

# 브라우저에서 확인
http://localhost:3000
```

**확인사항**:
- [ ] 지도 정상 로드
- [ ] 약국/AED 마커 표시
- [ ] 영업시간 색상 변경
- [ ] 거리 정렬 작동
- [ ] 공유 기능 작동

### Step 3: Vercel 배포 (5분)

#### 방법 A: GitHub 연동 (추천)
```bash
# GitHub에 푸시
git add .
git commit -m "PWA 설정 완료 - 배포 준비"
git push origin main
```

**Vercel 설정**:
1. https://vercel.com 접속
2. "Add New Project" 클릭
3. GitHub 저장소 import
4. 환경 변수 입력:
   ```
   NEMC_SERVICE_KEY=공공데이터_키
   NEXT_PUBLIC_NAVER_MAP_CLIENT_ID=네이버맵_ID
   NEXT_PUBLIC_SUPABASE_URL=Supabase_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY=Supabase_Key
   ```
5. "Deploy" 클릭

#### 방법 B: CLI 배포
```bash
# Vercel CLI 설치
npm install -g vercel

# 로그인
vercel login

# 배포
vercel

# 프로덕션 배포
vercel --prod
```

### Step 4: 배포 후 테스트 (10분)

**테스트 URL**: https://your-project.vercel.app

**체크리스트**:
- [ ] 홈 페이지 로드
- [ ] /map 페이지 작동
- [ ] 지도 렌더링
- [ ] 위치 권한 요청
- [ ] 마커 클릭 → 바텀시트
- [ ] 영업시간 표시
- [ ] 거리 배지 표시
- [ ] 공유 버튼 작동
- [ ] 전화 걸기 작동
- [ ] 모바일 반응형

**PWA 테스트**:
- [ ] Chrome DevTools > Application > Manifest
- [ ] "Install App" 버튼 표시
- [ ] 홈 화면에 추가 가능
- [ ] 독립 실행형으로 작동

---

## 🐛 **예상 문제 및 해결**

### 문제 1: 빌드 에러
```bash
# 캐시 삭제
rm -rf .next
npm run build
```

### 문제 2: 환경 변수 오류
Vercel 대시보드 > Settings > Environment Variables 확인

### 문제 3: 지도 안 보임
- Naver Maps API 도메인 등록 필요
- Vercel 도메인 추가: `*.vercel.app`

### 문제 4: PWA 설치 안 됨
- manifest.json 경로 확인
- 아이콘 파일 존재 확인
- HTTPS 필수 (Vercel은 자동 제공)

---

## 📱 **PWA 설치 테스트 방법**

### Android (Chrome)
1. 배포된 URL 접속
2. 오른쪽 상단 "⋮" 메뉴
3. "홈 화면에 추가" 클릭
4. 홈 화면에서 앱처럼 실행

### iOS (Safari)
1. Safari로 URL 접속
2. 공유 버튼 (↑) 클릭
3. "홈 화면에 추가" 선택

### Desktop (Chrome)
1. 주소창 오른쪽 "⊕" 아이콘
2. "설치" 클릭
3. 독립 창으로 실행

---

## 🎉 **배포 완료 후**

### 공유하기
- 배포 URL을 지인에게 공유
- 피드백 수집

### 모니터링
- Vercel Analytics 활성화
- 오류 로그 확인

### 다음 단계
- [ ] 실제 사용자 테스트
- [ ] 성능 최적화
- [ ] Android/iOS 앱 빌드 (Capacitor)

---

## 💡 **현재 권장 순서**

**가장 빠른 배포** (아이콘 없이):
1. 로컬 프로덕션 테스트 (5분)
2. GitHub 푸시
3. Vercel 배포 (5분)
4. 실제 URL 테스트
→ **총 15분, 웹에서 바로 사용 가능**

**완벽한 배포** (아이콘 포함):
1. 아이콘 생성 (10분)
2. 로컬 테스트 (5분)
3. Vercel 배포 (5분)
4. PWA 설치 테스트 (5분)
→ **총 25분, 앱처럼 완벽하게 작동**

---

**준비되셨나요? 어느 방법으로 진행할까요?** 🚀
