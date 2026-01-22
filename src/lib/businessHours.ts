/**
 * 약국 영업시간 계산 유틸리티
 * 공공 API의 dutyTime1s~dutyTime8s 필드를 기반으로 실시간 영업 상태 계산
 */

export interface BusinessStatus {
  status: 'open' | 'closed' | 'closing-soon' | 'opening-soon' | 'unknown';
  message: string;
  color: string;
  textColor: string;
  icon: string;
  closesAt?: string;
  opensAt?: string;
}

/**
 * "0900" 또는 "900" 형식의 시간을 "09:00" 형식으로 변환
 */
function formatTime(time: string): string {
  if (!time) return '--:--';
  if (time.length !== 3 && time.length !== 4) return '--:--';

  const normalizedTime = time.length === 3 ? '0' + time : time;
  return `${normalizedTime.slice(0, 2)}:${normalizedTime.slice(2, 4)}`;
}

/**
 * "0900" 또는 "900" 형식의 시간을 분으로 변환
 * 특수 케이스: "2400" = 다음날 00:00 = 1440분
 */
function timeToMinutes(time: string): number {
  if (!time) return -1;
  if (time.length !== 3 && time.length !== 4) return -1;

  const normalizedTime = time.length === 3 ? '0' + time : time;
  const hours = parseInt(normalizedTime.slice(0, 2), 10);
  const minutes = parseInt(normalizedTime.slice(2, 4), 10);

  if (isNaN(hours) || isNaN(minutes)) return -1;

  // 24:00 (자정) 특별 처리
  if (hours === 24 && minutes === 0) return 1440;

  // 일반 유효성 검사 (00:00 ~ 23:59)
  if (hours > 24 || minutes > 59) return -1;
  if (hours === 24 && minutes > 0) return -1; // 24:01 같은 잘못된 시간

  return hours * 60 + minutes;
}

/**
 * 약국의 실시간 영업 상태 계산
 */
export function getPharmacyStatus(pharmacy: any): BusinessStatus {
  const now = new Date();
  const currentDay = now.getDay(); // 0=일요일, 1=월요일, ..., 6=토요일
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // 24시간 약국 체크
  if (pharmacy.is_24h || pharmacy.dutyTime1s === '0000') {
    return {
      status: 'open',
      message: '24시간 운영',
      color: '#10B981',
      textColor: '#059669',
      icon: '🟢'
    };
  }

  // business_hours가 JSON 객체로 저장된 경우 처리
  let openTime: string | null = null;
  let closeTime: string | null = null;

  if (pharmacy.business_hours && typeof pharmacy.business_hours === 'object') {
    // JSON 객체 형식
    const dayMap = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const dayKey = dayMap[currentDay];
    const hours = pharmacy.business_hours[dayKey];

    if (hours && hours.includes('-')) {
      [openTime, closeTime] = hours.split('-');
    }
  } else {
    // 개별 필드 형식
    const dayIndex = currentDay === 0 ? 7 : currentDay;
    const openTimeField = `dutyTime${dayIndex}s`;
    const closeTimeField = `dutyTime${dayIndex}c`;

    openTime = pharmacy[openTimeField];
    closeTime = pharmacy[closeTimeField];
  }

  // 영업시간 정보가 없는 경우
  if (!openTime || !closeTime) {
    return {
      status: 'unknown',
      message: '영업시간 정보 없음',
      color: '#9CA3AF',
      textColor: '#6B7280',
      icon: '⚪'
    };
  }

  const openMinutes = timeToMinutes(openTime);
  const closeMinutes = timeToMinutes(closeTime);

  // 유효하지 않은 시간 데이터
  if (openMinutes === -1 || closeMinutes === -1) {
    return {
      status: 'unknown',
      message: '영업시간 오류',
      color: '#9CA3AF',
      textColor: '#6B7280',
      icon: '⚪'
    };
  }

  // 영업 중
  if (currentMinutes >= openMinutes && currentMinutes < closeMinutes) {
    const remainingMinutes = closeMinutes - currentMinutes;

    // 30분 이내 마감
    if (remainingMinutes <= 30) {
      return {
        status: 'closing-soon',
        message: `곧 마감 (${formatTime(closeTime)})`,
        color: '#F59E0B',
        textColor: '#D97706',
        icon: '🟡',
        closesAt: formatTime(closeTime)
      };
    }

    return {
      status: 'open',
      message: `영업중 (${formatTime(closeTime)}까지)`,
      color: '#10B981',
      textColor: '#059669',
      icon: '🟢',
      closesAt: formatTime(closeTime)
    };
  }

  // 곧 영업 시작 (30분 이내)
  if (currentMinutes < openMinutes && (openMinutes - currentMinutes) <= 30) {
    return {
      status: 'opening-soon',
      message: `곧 영업 시작 (${formatTime(openTime)})`,
      color: '#3B82F6',
      textColor: '#2563EB',
      icon: '🔵',
      opensAt: formatTime(openTime)
    };
  }

  // 영업 종료
  return {
    status: 'closed',
    message: `영업종료 (${formatTime(openTime)} 오픈)`,
    color: '#EF4444',
    textColor: '#DC2626',
    icon: '🔴',
    opensAt: formatTime(openTime)
  };
}

/**
 * 동물병원 영업시간 계산 (약국과 동일한 로직)
 */
export function getAnimalHospitalStatus(hospital: any): BusinessStatus {
  return getPharmacyStatus(hospital); // 동일한 데이터 구조 사용
}

/**
 * 영업 중인 항목만 필터링 (영업중 필터 사용 시)
 */
export function filterOpenNow(items: any[], categoryType: string): any[] {
  return items.filter(item => {
    if (categoryType === 'EMERGENCY') {
      return true; // 응급실은 기본적으로 24시간
    }

    if (categoryType === 'PHARMACY' || categoryType === 'ANIMAL_HOSPITAL') {
      const status = getPharmacyStatus(item);
      return status.status === 'open' || status.status === 'closing-soon';
    }

    if (categoryType === 'AED') {
      return true; // AED는 항상 사용 가능
    }

    return true;
  });
}
