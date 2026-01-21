# 🚑 SOS-NOW 프로젝트 빠른 인수인계 가이드

## 📍 **다른 AI에게 전달용**

안녕하세요! SOS-NOW 프로젝트를 이어받으셨군요. 이 문서만 보면 바로 작업을 시작하실 수 있습니다.

---

## 🎯 **프로젝트 3줄 요약**

1. **Next.js 16 + TypeScript** 기반 실시간 응급 의료 정보 플랫폼
2. **네이버 지도 API**로 병원/약국/AED 위치 표시, **Supabase**에 데이터 저장
3. **Phase 4 완료**: 실시간 영업시간 계산, 거리 정렬, 공유 기능 구현됨

---

## 📂 **핵심 파일 구조 (이것만 보면 됨)**

```
sos_now/
├── src/
│   ├── app/
│   │   ├── page.tsx                 # 메인 랜딩 페이지
│   │   ├── map/page.tsx             # 🔥 핵심: 지도 메인 페이지 (검색, 필터, 리스트)
│   │   └── sos-now/page.tsx         # 관리자: 데이터 동기화 페이지
│   │
│   ├── components/
│   │   ├── RawSosMap.tsx            # 🔥 핵심: 네이버 지도 + 마커 렌더링
│   │   └── SosBottomSheet.tsx       # 🔥 핵심: 상세 정보 팝업
│   │
│   ├── lib/
│   │   ├── nemcApi.ts               # ✅ 공공 API 호출 (병원, 약국, AED)
│   │   ├── businessHours.ts         # ✅ NEW: 실시간 영업시간 계산
│   │   ├── distance.ts              # ✅ NEW: 거리 계산 및 정렬
│   │   └── supabase.ts              # Supabase 클라이언트
│   │
│   ├── store/
│   │   └── useSosStore.ts           # 🔥 핵심: Zustand 전역 상태 관리
│   │
│   └── types/
│       └── index.ts                 # TypeScript 타입 정의
│
├── public/
│   └── (아이콘, 이미지)
│
├── README.md                        # 📖 전체 프로젝트 설명
├── PHASE4_IMPROVEMENTS.md           # 📖 Phase 4 상세 개선 내용
├── DEPLOYMENT_GUIDE.md              # 📖 멀티 플랫폼 배포 가이드
└── .env.local                       # 🔑 환경 변수 (API 키)
```

---

## 🔥 **가장 중요한 파일 TOP 5**

### 1. `src/app/map/page.tsx`
**역할**: 지도 메인 페이지, 검색/필터/정렬 로직
**주요 기능**:
- 카테고리 필터 (응급실/약국/AED/즐겨찾기)
- 검색 기능
- 리스트 뷰 / 지도 뷰 전환
- **거리순/이름순 정렬** (Phase 4에서 추가)
- **영업 상태 배지** (Phase 4에서 추가)

**수정 시 참고**:
- Line 25-31: 카테고리 정의
- Line 41-88: 필터링 로직
- Line 155-227: 리스트 뷰 렌더링

---

### 2. `src/components/RawSosMap.tsx`
**역할**: 네이버 지도 렌더링 + 마커 표시
**주요 기능**:
- 네이버 지도 초기화
- 카테고리별 데이터 Supabase에서 가져오기
- 마커 생성 및 클러스터링
- **마커 색상 동적 변경** (Phase 4에서 추가)

**수정 시 참고**:
- Line 76-100: `fetchData()` - DB에서 데이터 가져오기
- Line 102-125: `getMarkerIcon()` - 마커 아이콘 및 색상 결정
- Line 142-201: `updateMarkers()` - 마커 렌더링 및 클러스터링

**중요**: `nemcApi.ts`에 검증된 API 호출 로직이 있으니 참고하세요!

---

### 3. `src/components/SosBottomSheet.tsx`
**역할**: 마커 클릭 시 나오는 상세 정보 팝업
**주요 기능**:
- 병원: 병상 수, 응급실 메시지
- 약국: **실시간 영업 상태** (Phase 4에서 추가)
- AED: 모델명, 최종 점검일
- 전화 걸기, 길찾기, 공유 버튼

**수정 시 참고**:
- Line 98-137: 약국 영업 정보 (실시간 계산)
- Line 155-179: 전화/길찾기 버튼

---

### 4. `src/lib/businessHours.ts` ⭐ **NEW (Phase 4)**
**역할**: 약국 영업시간 실시간 계산
**주요 기능**:
- 요일별 영업시간 파싱 (`dutyTime1s~dutyTime8s`)
- 5가지 상태 구분 (영업중/곧 마감/영업종료/곧 오픈/정보없음)
- 색상 및 아이콘 반환

**함수**:
- `getPharmacyStatus(pharmacy)` - 메인 함수, 어디서든 호출 가능

---

### 5. `src/lib/distance.ts` ⭐ **NEW (Phase 4)**
**역할**: 거리 계산 및 정렬
**주요 기능**:
- Haversine 공식으로 정확한 거리 계산
- 거리 포맷팅 (1.2km, 350m)
- 배열 정렬 유틸리티

**함수**:
- `getDistance(lat1, lon1, lat2, lon2)` - 두 점 간 거리
- `formatDistance(km)` - 거리 표시 문자열
- `sortByDistance(items, userLat, userLng)` - 거리순 정렬

---

## 🛠 **주요 기술 스택**

| 기술 | 용도 | 버전 |
|------|------|------|
| Next.js | 프론트엔드 프레임워크 | 16 (App Router) |
| TypeScript | 타입 안정성 | 5 |
| Tailwind CSS | 스타일링 | 4 |
| Zustand | 상태 관리 | 5 |
| Supabase | 데이터베이스 | PostgreSQL + PostGIS |
| Naver Maps API | 지도 | v3 |
| 공공 API | 데이터 소스 | 국립중앙의료원(NEMC) |

---

## 🔑 **환경 변수 (.env.local)**

```env
# 공공데이터포털 인증키
NEMC_SERVICE_KEY=발급받은_키

# 네이버 지도 클라이언트 ID
NEXT_PUBLIC_NAVER_MAP_CLIENT_ID=네이버맵_ID

# Supabase
NEXT_PUBLIC_SUPABASE_URL=프로젝트_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=익명_키
```

---

## 🚀 **빠른 시작 (3분)**

```bash
# 1. 패키지 설치
npm install

# 2. 환경 변수 설정
# .env.local 파일 생성 후 위 키 입력

# 3. 개발 서버 실행
npm run dev

# 4. 데이터 동기화
# http://localhost:3000/sos-now 접속
# 병원/약국/AED 동기화 버튼 클릭
```

---

## ⚠️ **중요한 주의사항**

### 1. 공공 API 엔드포인트 오타
- 약국 API: `getParmacy` (h 누락!) - `src/lib/nemcApi.ts` L85 참고
- AED API: `getAedLcinfoInqire` (대소문자 주의) - L108 참고
- **절대 수정하지 마세요!** 공공 API가 그렇게 등록되어 있음

### 2. 네이버 지도 스크립트 로딩
- `RawSosMap.tsx`에서 Script 컴포넌트 사용
- 클러스터링 스크립트 순차 로딩 (L211-223)
- 순서 바꾸면 오류 발생

### 3. 영업시간 필드명
- 공공 API: `dutyTime1s` (월 시작), `dutyTime1c` (월 종료)
- 일요일은 `dutyTime7s/c`로 매핑됨
- 자세한 로직은 `businessHours.ts` 참고

---

## 📊 **현재 진행 상황**

### ✅ 완료된 Phase
- [x] **Phase 1**: 기반 구축, UI 개편
- [x] **Phase 2**: 바텀시트 최적화, 지도 컨트롤
- [x] **Phase 3**: 공공 API 연동 (병원/약국/AED)
- [x] **Phase 4**: 실시간 영업시간, 거리 정렬, 공유 기능

### 🔄 다음 Phase
- [ ] **Phase 5**: PWA 전환, 푸시 알림
- [ ] **Phase 6**: 고급 필터, 반경 검색

**상세 로드맵**: `README.md` 참고

---

## 💡 **자주 하는 작업**

### 새로운 카테고리 추가
1. `useSosStore.ts`에 CategoryType 추가
2. `map/page.tsx`의 categories 배열에 추가
3. `RawSosMap.tsx`의 `getMarkerIcon()` 수정
4. `SosBottomSheet.tsx`에 상세 정보 추가

### 마커 아이콘 변경
→ `RawSosMap.tsx` L102-125 `getMarkerIcon()` 함수 수정

### 필터 로직 수정
→ `map/page.tsx` L41-88 필터링 로직

### 영업시간 로직 수정
→ `businessHours.ts` `getPharmacyStatus()` 함수

---

## 🐛 **알려진 이슈**

### 1. 동물병원 데이터 부족
- 현재 샘플 2개만 있음
- 공공 API에 동물병원 데이터가 거의 없음
- **해결 방안**: 카카오맵 API 또는 크롤링 필요

### 2. 위치 권한 거부 시
- 거리 정보가 표시되지 않음
- 현재 에러 처리는 console.log만 (L36, `map/page.tsx`)
- **개선 예정**: 친절한 안내 UI 추가

---

## 📞 **핵심만 요약하면?**

1. **지도 페이지**: `src/app/map/page.tsx` (검색, 필터, 리스트)
2. **지도 컴포넌트**: `src/components/RawSosMap.tsx` (마커, 클러스터링)
3. **상세 팝업**: `src/components/SosBottomSheet.tsx` (정보 표시)
4. **영업시간**: `src/lib/businessHours.ts` (실시간 계산)
5. **거리 계산**: `src/lib/distance.ts` (정렬 및 표시)

**이 5개 파일만 보면 전체 핵심 기능을 파악할 수 있습니다!**

---

## 🎯 **다음 작업자에게**

**현재 작업 완료 시점**: 2026-01-21 Phase 4 완료

**다음 할 일** (우선순위):
1. PWA 설정 (1시간)
2. 프로덕션 배포 (Vercel, 10분)
3. Android/iOS 앱 빌드 (Capacitor, 각 2시간)

**참고 문서**:
- 배포 가이드: `DEPLOYMENT_GUIDE.md`
- Phase 4 상세: `PHASE4_IMPROVEMENTS.md`
- 전체 README: `README.md`

---

**프로젝트 인수인계 완료! 행운을 빕니다! 🚀**
