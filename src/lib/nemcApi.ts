import { XMLParser } from 'fast-xml-parser';

const NEMC_BASE_URL = 'http://apis.data.go.kr/B552657/ErmctInfoInqireService';
const SERVICE_KEY = '1LzH1VYMNnqzGqD05xDYYVJxJY/5LHSKsZY9dSONrit7zBAKqW3vO3v3thvd7yCHDQW60SXEmwoNaDtaVbLWzQ==';

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

// ... (Existing interfaces)

/**
 * 전국 약국 목록 조회
 */
export async function fetchPharmacyList(city?: string, district?: string) {
    const PHARMACY_URL = 'http://apis.data.go.kr/B552657/ErmctInsttInfoInqireService/getParmacyListInfoInqire';
    const params = new URLSearchParams();
    params.append('serviceKey', SERVICE_KEY);
    if (city) params.append('Q0', city);
    if (district) params.append('Q1', district);
    params.append('numOfRows', '3000'); // Fetch a large batch
    params.append('pageNo', '1');

    const finalUrl = `${PHARMACY_URL}?${params.toString()}`;
    console.log('Fetching Pharmacies from:', finalUrl);

    try {
        const response = await fetch(finalUrl);
        const xmlData = await response.text();
        const result = parser.parse(xmlData);
        const items = result.response?.body?.items?.item || [];
        console.log(`Fetched ${Array.isArray(items) ? items.length : (items ? 1 : 0)} pharmacies`);
        return items;
    } catch (error) {
        console.error('Pharmacy Fetch Error:', error);
        return [];
    }
}

/**
 * 전국 AED 목록 조회
 */
export async function fetchAEDList(city?: string, district?: string) {
    const AED_URL = 'http://apis.data.go.kr/B552657/AEDInfoInqireService/getAedLcinfoInqire';
    const params = new URLSearchParams();
    params.append('serviceKey', SERVICE_KEY);
    if (city) params.append('Q0', city);
    if (district) params.append('Q1', district);
    params.append('numOfRows', '3000');
    params.append('pageNo', '1');

    const finalUrl = `${AED_URL}?${params.toString()}&_=${Date.now()}`;
    console.log('Fetching AEDs from:', finalUrl);

    try {
        const response = await fetch(finalUrl, { cache: 'no-store' });
        const xmlData = await response.text();
        const result = parser.parse(xmlData);
        const items = result.response?.body?.items?.item || [];
        console.log(`Fetched ${Array.isArray(items) ? items.length : (items ? 1 : 0)} AEDs`);
        return items;
    } catch (error) {
        console.error('AED Fetch Error:', error);
        return [];
    }
}

/**
 * 전국 동물병원 목록 조회
 * (농림축산식품부_동물병원정보)
 */
export async function fetchAnimalHospitalList(city: string = '서울특별시', district?: string) {
    // 농림축산식품부 동물병원 정보 조회 서비스
    const ANIMAL_URL = 'http://apis.data.go.kr/1543061/animalHosptlInfoService/animalHosptlInfo';
    const params = new URLSearchParams();
    // 이 API는 파라미터 이름이 다를 수 있으므로 일반적인 공공데이터 표준을 따름
    // 만약 실패하면 문서를 확인해야 함.
    // 보통: serviceKey, numOfRows, pageNo, ...
    // 지역 필터가 없을 수도 있음. 일단 전체 조회를 시도하거나 서울시 위주로.

    // 참고: 동물병원 API는 시도/시군구 파라미터가 없을 수 있음.
    // 일단 1000개 요청
    params.append('numOfRows', '1000');

    const finalUrl = `${ANIMAL_URL}?serviceKey=${SERVICE_KEY}&${params.toString()}`;

    console.log('Fetching Animal Hospitals from:', finalUrl);
    const response = await fetch(finalUrl);
    const xmlData = await response.text();
    const result = parser.parse(xmlData);

    const items = result.response?.body?.items?.item || [];
    console.log(`Real API Response: Fetched ${Array.isArray(items) ? items.length : (items ? 1 : 0)} Animal Hospitals`);
    return items;
}
