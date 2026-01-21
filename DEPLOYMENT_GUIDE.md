# 🚀 SOS-NOW 멀티 플랫폼 배포 가이드

## 📱 배포 플랫폼
1. **웹** (Vercel)
2. **Android** (Google Play Store)
3. **iOS** (Apple App Store)
4. **원스토어/인앱토스** (국내 앱마켓)

---

## 🌐 Phase 1: 웹 배포 (Vercel)

### 1-1. Vercel 배포 (5분)

#### 방법 1: GitHub 연동 (추천)
```bash
# GitHub에 푸시
git add .
git commit -m "Phase 4+ 완료 - 멀티 플랫폼 배포 준비"
git push origin main
```

1. [Vercel](https://vercel.com) 접속
2. "Import Project" 클릭
3. GitHub 저장소 선택
4. 환경 변수 입력:
   ```
   NEMC_SERVICE_KEY=공공데이터포털_키
   NEXT_PUBLIC_NAVER_MAP_CLIENT_ID=네이버맵_키
   NEXT_PUBLIC_SUPABASE_URL=Supabase_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY=Supabase_Key
   ```
5. "Deploy" 클릭

**결과**: `https://sos-now.vercel.app` (또는 커스텀 도메인)

#### 방법 2: CLI로 배포
```bash
npm install -g vercel
vercel
```

### 1-2. 프로덕션 빌드 체크
```bash
npm run build
npm run start
```

---

## 📱 Phase 2: PWA 설정 (앱처럼 동작)

### 2-1. PWA 플러그인 설치
```bash
npm install next-pwa
```

### 2-2. next.config.ts 수정
```typescript
import type { NextConfig } from "next";
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
});

const nextConfig: NextConfig = {
  // 기존 설정
};

export default withPWA(nextConfig);
```

### 2-3. manifest.json 생성
```json
// public/manifest.json
{
  "name": "SOS-NOW - 응급 의료 정보",
  "short_name": "SOS-NOW",
  "description": "실시간 응급실, 약국, AED 위치",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0F172A",
  "theme_color": "#EF4444",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

### 2-4. 아이콘 생성
**필요한 아이콘**:
- `icon-192.png` (192x192)
- `icon-512.png` (512x512)
- `apple-touch-icon.png` (180x180)

**무료 생성 도구**: https://www.pwabuilder.com/imageGenerator

---

## 🤖 Phase 3: Android 앱 (Capacitor)

### 3-1. Capacitor 설치
```bash
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android
npx cap init
```

**입력값**:
- App name: `SOS-NOW`
- App ID: `com.sosnow.app`
- Web directory: `out` (또는 `.next`)

### 3-2. Static Export 설정
```typescript
// next.config.ts
const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true
  }
};
```

### 3-3. Android 프로젝트 생성
```bash
npm run build
npx cap add android
npx cap sync
```

### 3-4. Android Studio에서 열기
```bash
npx cap open android
```

**Android Studio에서**:
1. `Build > Generate Signed Bundle/APK` 클릭
2. Keystore 생성 (첫 실행 시)
3. APK/AAB 파일 생성

### 3-5. Google Play Console 업로드
1. [Google Play Console](https://play.google.com/console) 접속
2. "앱 만들기" 클릭
3. AAB 파일 업로드
4. 스토어 등록 정보 작성:
   - 스크린샷 (5개 이상)
   - 설명, 아이콘
   - 개인정보처리방침 URL

**심사 기간**: 약 1~3일

---

## 🍎 Phase 4: iOS 앱

### 4-1. iOS 프로젝트 추가
```bash
npm install @capacitor/ios
npx cap add ios
npx cap sync
```

### 4-2. Xcode에서 열기
```bash
npx cap open ios
```

**Xcode에서**:
1. Signing & Capabilities 설정
2. Apple Developer 계정 연결
3. Bundle Identifier: `com.sosnow.app`
4. Archive 생성

### 4-3. App Store Connect 업로드
1. [App Store Connect](https://appstoreconnect.apple.com) 접속
2. "내 앱 > + 버튼" 클릭
3. 앱 정보 입력
4. Xcode에서 Archive 업로드
5. 심사 제출

**필요 자료**:
- 앱 아이콘 (1024x1024)
- 스크린샷 (iPhone, iPad 각각)
- 개인정보처리방침 URL

**심사 기간**: 약 1~7일

---

## 🇰🇷 Phase 5: 원스토어 / 인앱토스

### 5-1. 원스토어 (ONE store)

**Android APK 재사용 가능**:
1. [원스토어 개발자센터](https://dev.onestore.co.kr) 접속
2. "앱 등록" 클릭
3. Google Play용 APK 업로드
4. 앱 정보 입력 (한국어)

**심사 기간**: 약 1~3일

### 5-2. 인앱토스

**참고**: 인앱토스는 일반적인 앱스토어가 아닌 것 같습니다.
- **SKT T Store**: SKT 고객 대상
- **삼성 Galaxy Store**: 삼성 기기 전용

**필요시 추가 안내 가능**

---

## 📊 배포 체크리스트

### 공통 준비물
- [ ] 앱 아이콘 (192x192, 512x512, 1024x1024)
- [ ] 스크린샷 (5개 이상)
- [ ] 앱 설명 (한국어/영어)
- [ ] 개인정보처리방침 URL
- [ ] 서비스 이용약관 URL

### 플랫폼별 계정
- [ ] Vercel 계정 (무료)
- [ ] Google Play Console ($25 일회성)
- [ ] Apple Developer ($99/년)
- [ ] 원스토어 계정 (무료)

### 기술적 준비
- [ ] 프로덕션 빌드 테스트
- [ ] PWA manifest.json
- [ ] 아이콘 생성
- [ ] 환경 변수 설정

---

## 💡 빠른 배포 순서 (추천)

### Day 1: 웹 + PWA
1. Vercel 배포 (10분)
2. PWA 설정 (30분)
3. 아이콘 생성 (20분)
→ **총 1시간, 웹에서 앱처럼 사용 가능**

### Day 2: Android
1. Capacitor 설정 (30분)
2. Android 빌드 (30분)
3. Google Play Console 등록 (1시간)
→ **총 2시간, APK 생성**

### Day 3: iOS (Mac 필요)
1. iOS 프로젝트 생성 (30분)
2. Xcode 빌드 (30분)
3. App Store Connect 등록 (1시간)
→ **총 2시간**

### Day 4: 국내 마켓
1. 원스토어 등록 (30분)
2. 기타 마켓 등록 (30분)
→ **총 1시간**

---

## 🆘 문제 해결

### Capacitor 빌드 에러
```bash
# 캐시 삭제 후 재시도
rm -rf .next out
npm run build
npx cap sync
```

### 지도 API 안 뜰 때
- Naver Maps API에서 도메인/앱 등록 필요
- Capacitor의 경우: `capacitor://localhost` 허용

### iOS 서명 문제
- Apple Developer Program 가입 필수
- Xcode에서 Automatically manage signing 체크

---

## 📞 다음 단계

**어떤 플랫폼부터 시작할까요?**

1. **웹 먼저** (가장 빠름, 10분)
2. **PWA** (앱처럼 사용, 1시간)
3. **Android** (Google Play, 2시간)
4. **전체 진행** (순차적으로 모두)

---

*질문이나 막히는 부분이 있으면 언제든 말씀해주세요!*
