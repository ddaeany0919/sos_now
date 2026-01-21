# 🎨 아이콘 생성 가이드

## 필요한 아이콘

1. **icon-192.png** (192x192px)
2. **icon-512.png** (512x512px)
3. **apple-touch-icon.png** (180x180px)

---

## 빠른 생성 방법

### 옵션 1: 무료 온라인 도구 (추천) ⭐
**PWA Builder Image Generator**
- URL: https://www.pwabuilder.com/imageGenerator
- 하나의 이미지(512x512)만 업로드하면 모든 사이즈 자동 생성
- 다운로드 후 `public/` 폴더에 복사

### 옵션 2: AI 이미지 생성 (고품질)
다음 프롬프트로 이미지 생성:
```
"A modern, minimalist app icon for emergency medical services. 
Red cross symbol with a pin/location marker. 
Clean, professional design. 
White background with red and blue accents. 
512x512px, flat design, suitable for PWA."
```

생성 후 사이즈 조절:
- Online Image Resizer: https://imageresizer.com

### 옵션 3: 임시 플레이스홀더
테스트용으로 빠르게 만들기:
1. Canva.com 무료 계정
2. 템플릿 선택: "App Icon"
3. 텍스트 "SOS" + 빨간 십자가 아이콘
4. 3가지 사이즈로 다운로드

---

## 아이콘 배치

생성한 파일을 다음 위치에 복사:
```
public/
├── icon-192.png
├── icon-512.png
└── apple-touch-icon.png
```

---

## 디자인 가이드라인

### 색상
- Primary: #EF4444 (빨강)
- Background: #FFFFFF (흰색)
- Accent: #0F172A (진한 회색)

### 컨셉
- 🚑 응급차 아이콘
- ❤️ 십자가 + 심장
- 📍 위치 핀 + 십자가
- 🏥 병원 건물 실루엣

---

## 테스트

아이콘 생성 후:
1. 브라우저에서 `http://localhost:3000/icon-192.png` 접속
2. 파일이 제대로 보이는지 확인
3. PWA 설치 테스트 (Chrome DevTools > Application > Manifest)
