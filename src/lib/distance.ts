/**
 * 거리 계산 유틸리티
 * Haversine 공식을 사용한 두 지점 간 거리 계산
 */

/**
 * 두 좌표 간의 직선 거리 계산 (km 단위)
 * @param lat1 출발지 위도
 * @param lon1 출발지 경도
 * @param lat2 목적지 위도
 * @param lon2 목적지 경도
 * @returns 거리 (km)
 */
export function getDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const R = 6371; // 지구 반경 (km)
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
}

/**
 * 도(degree)를 라디안(radian)으로 변환
 */
function toRad(degrees: number): number {
    return (degrees * Math.PI) / 180;
}

/**
 * 거리를 보기 좋은 문자열로 변환
 * @param distanceKm 거리 (km)
 * @returns 포맷된 문자열 (예: "1.2km", "350m")
 */
export function formatDistance(distanceKm: number): string {
    if (distanceKm < 1) {
        const meters = Math.round(distanceKm * 1000);
        return `${meters}m`;
    } else {
        return `${distanceKm.toFixed(1)}km`;
    }
}

/**
 * 아이템 배열을 사용자 위치 기준으로 거리순 정렬
 */
export function sortByDistance(
    items: any[],
    userLat: number,
    userLng: number
): any[] {
    return items
        .map(item => ({
            ...item,
            distance: getDistance(userLat, userLng, item.lat, item.lng)
        }))
        .sort((a, b) => a.distance - b.distance);
}

/**
 * 특정 범위 내의 아이템만 필터링
 * @param items 아이템 배열
 * @param userLat 사용자 위도
 * @param userLng 사용자 경도
 * @param radiusKm 반경 (km)
 */
export function filterByRadius(
    items: any[],
    userLat: number,
    userLng: number,
    radiusKm: number
): any[] {
    return items.filter(item => {
        const distance = getDistance(userLat, userLng, item.lat, item.lng);
        return distance <= radiusKm;
    });
}

/**
 * 현재 위치 가져오기 (Promise)
 */
export function getCurrentLocation(): Promise<{ lat: number; lng: number }> {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by this browser.'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            position => {
                resolve({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
            },
            error => {
                reject(error);
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        );
    });
}
