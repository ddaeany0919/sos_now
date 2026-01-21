-- SOS-NOW 프로젝트를 위한 Supabase 데이터베이스 스키마
-- 이 스크립트를 Supabase SQL Editor에서 실행하세요.

-- 1. PostGIS 확장 활성화 (위치 기반 반경 검색용)
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. UUID 생성 확장 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 3. 응급의료기관(병원) 테이블
CREATE TABLE IF NOT EXISTS public.emergency_hospitals (
    hp_id TEXT PRIMARY KEY, -- 기관 ID (NEMC API 연동 키: hpid)
    name TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    emergency_phone TEXT,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    location GEOGRAPHY(POINT, 4326), -- PostGIS 위치 데이터
    beds_available INTEGER DEFAULT 0, -- 가용 병상 수
    beds_total INTEGER DEFAULT 0,     -- 전체 병상 수
    recent_msg TEXT,        -- 실시간 특이사항 메시지
    is_severe_capable BOOLEAN DEFAULT FALSE, -- 중증질환 수용 가능 여부
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 심야 약국 및 24시 동물병원 테이블
CREATE TABLE IF NOT EXISTS public.emergency_stores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    external_id TEXT UNIQUE, -- NEMC API의 hpid 등
    type TEXT CHECK (type IN ('PHARMACY', 'ANIMAL_HOSPITAL')),
    name TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    location GEOGRAPHY(POINT, 4326),
    is_24h BOOLEAN DEFAULT FALSE,
    business_hours JSONB, -- 요일별 상세 운영 시간
    last_verified TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. AED(자동심장충격기) 테이블
CREATE TABLE IF NOT EXISTS public.aeds (
    id TEXT PRIMARY KEY,
    place_name TEXT,
    address TEXT,
    model TEXT,
    manager_phone TEXT,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    location GEOGRAPHY(POINT, 4326),
    last_check_date DATE,
    status TEXT
);

-- 6. 실시간 유저 제보 테이블
CREATE TABLE IF NOT EXISTS public.real_time_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    target_id TEXT, -- 병원 hp_id 또는 스토어 id
    report_type TEXT, -- 'OPEN', 'CLOSED', 'CROWDED', 'WAITING'
    content TEXT,
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. 위치 기반 검색을 위한 GIST 인덱스 생성 (초고속 검색용)
CREATE INDEX IF NOT EXISTS idx_hospitals_location ON public.emergency_hospitals USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_stores_location ON public.emergency_stores USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_aeds_location ON public.aeds USING GIST (location);

-- 8. 위도/경도 입력 시 자동으로 location(GEOGRAPHY) 컬럼을 업데이트하는 트리거 함수
CREATE OR REPLACE FUNCTION update_location_geog()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.lat IS NOT NULL AND NEW.lng IS NOT NULL THEN
        NEW.location := ST_SetSRID(ST_MakePoint(NEW.lng, NEW.lat), 4326)::geography;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 적용
CREATE TRIGGER trg_update_hospital_location
BEFORE INSERT OR UPDATE ON public.emergency_hospitals
FOR EACH ROW EXECUTE FUNCTION update_location_geog();

CREATE TRIGGER trg_update_store_location
BEFORE INSERT OR UPDATE ON public.emergency_stores
FOR EACH ROW EXECUTE FUNCTION update_location_geog();

CREATE TRIGGER trg_update_aed_location
BEFORE INSERT OR UPDATE ON public.aeds
FOR EACH ROW EXECUTE FUNCTION update_location_geog();
