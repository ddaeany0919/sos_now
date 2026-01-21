import { XMLParser } from 'fast-xml-parser';

const NEMC_BASE_URL = 'http://apis.data.go.kr/B552657/ErmctInfoInqireService';
const SERVICE_KEY = process.env.NEMC_SERVICE_KEY;

const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_"
});

export interface NemcHospital {
    hpid: string;
    dutyName: string;
    dutyAddr: string;
    dutyTel1: string;
    dutyTel3: string; // 응급실 전화
    wgs84Lat: number;
    wgs84Lon: number;
}

export interface NemcRealtimeBed {
    hpid: string;
    dutyName: string;
    hvec: number; // 응급실 가용 병상 수
    hvicu: number; // 중환자실 가용 병상 수
    hvgc: number; // 입원실 가용 병상 수
    dutyTel3: string;
    hv1: string; // 당직의 정보 등 메시지
}

/**
 * 전국 응급의료기관 목록 조회 (기본 정보)
 */
export async function fetchHospitalList(city?: string, district?: string) {
    const url = new URL(`${NEMC_BASE_URL}/getEgytListInfoInqire`);
    url.searchParams.append('serviceKey', SERVICE_KEY || '');
    if (city) url.searchParams.append('Q0', city);
    if (district) url.searchParams.append('Q1', district);
    url.searchParams.append('numOfRows', '1000'); // 최대치

    const response = await fetch(url.toString());
    const xmlData = await response.text();
    const result = parser.parse(xmlData);

    return result.response?.body?.items?.item || [];
}

/**
 * 실시간 응급실 가용병상정보 조회
 */
export async function fetchRealtimeBeds(city?: string, district?: string) {
    const url = new URL(`${NEMC_BASE_URL}/getEmrrmRltmUsefulSckbdInfoInqire`);
    url.searchParams.append('serviceKey', SERVICE_KEY || '');
    if (city) url.searchParams.append('Q0', city);
    if (district) url.searchParams.append('Q1', district);
    url.searchParams.append('numOfRows', '1000');

    const response = await fetch(url.toString());
    const xmlData = await response.text();
    const result = parser.parse(xmlData);

    return result.response?.body?.items?.item || [];
}

/**
 * 응급실 및 중증질환 메시지 조회
 */
export async function fetchEmergencyMessages(hpid: string) {
    const url = new URL(`${NEMC_BASE_URL}/getEmrrmSrsillDissMsgInqire`);
    url.searchParams.append('serviceKey', SERVICE_KEY || '');
    url.searchParams.append('HPID', hpid);

    const response = await fetch(url.toString());
    const xmlData = await response.text();
    const result = parser.parse(xmlData);

    return result.response?.body?.items?.item || [];
}

/**
 * 전국 약국 목록 조회
 */
export async function fetchPharmacyList(city: string = '서울특별시', district?: string) {
    // 공공데이터포털의 실제 오퍼레이션 명칭은 'getParmacy' (h가 없음)인 경우가 많음
    const PHARMACY_URL = 'http://apis.data.go.kr/B552657/ErmctInsttInfoInqireService/getParmacyListInfoInqire';
    const params = new URLSearchParams();
    if (city) params.append('Q0', city);
    if (district) params.append('Q1', district);
    params.append('numOfRows', '100');

    const finalUrl = `${PHARMACY_URL}?serviceKey=${SERVICE_KEY}&${params.toString()}`;

    console.log('Fetching Pharmacies from:', finalUrl);
    const response = await fetch(finalUrl);
    const xmlData = await response.text();
    const result = parser.parse(xmlData);

    const items = result.response?.body?.items?.item || [];
    console.log(`Real API Response: Fetched ${Array.isArray(items) ? items.length : (items ? 1 : 0)} pharmacies`);
    return items;
}

/**
 * 전국 AED 목록 조회
 */
export async function fetchAEDList(city: string = '서울특별시', district?: string) {
    // AED 서비스는 엔드포인트에 AED가 대문자이며, 오퍼레이션 명칭이 Lcinfo임
    const AED_URL = 'http://apis.data.go.kr/B552657/AEDInfoInqireService/getAedLcinfoInqire';
    const params = new URLSearchParams();
    if (city) params.append('Q0', city);
    if (district) params.append('Q1', district);
    params.append('numOfRows', '100');

    const finalUrl = `${AED_URL}?serviceKey=${SERVICE_KEY}&${params.toString()}`;

    console.log('Fetching AEDs from:', finalUrl);
    const response = await fetch(finalUrl);
    const xmlData = await response.text();
    const result = parser.parse(xmlData);

    const items = result.response?.body?.items?.item || [];
    console.log(`Real API Response: Fetched ${Array.isArray(items) ? items.length : (items ? 1 : 0)} AEDs`);
    return items;
}
