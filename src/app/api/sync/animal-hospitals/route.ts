import { NextResponse } from 'next/server';
import { fetchAnimalHospitalList } from '@/lib/nemcApi';
import { supabase } from '@/lib/supabase';

export async function GET() {
    try {
        // 1. Fetch from Public Data Portal
        const hospitalList = await fetchAnimalHospitalList();
        const items = Array.isArray(hospitalList) ? hospitalList : [hospitalList];

        if (items.length === 0) {
            return NextResponse.json({ success: true, count: 0, message: 'No animal hospitals found (Check API Key or URL)' });
        }

        // 2. Transform Data
        const updates = items.map((item: any) => ({
            type: 'ANIMAL_HOSPITAL',
            name: item.bizplcNm || item.dutyName, // API 필드명 확인 필요 (보통 bizplcNm 사용)
            address: item.rdnWhlAddr || item.dutyAddr || item.locplcAddr, // 도로명 or 지번
            phone: item.telno || item.dutyTel1,
            lat: item.lat ? parseFloat(item.lat) : (item.wgs84Lat ? parseFloat(item.wgs84Lat) : null), // 좌표 필드 확인 필요
            lng: item.lon ? parseFloat(item.lon) : (item.wgs84Lon ? parseFloat(item.wgs84Lon) : null),
            is_24h: false, // 기본값
            business_hours: null, // 상세 정보 없음
            last_verified: new Date().toISOString()
        })).filter((item: any) => item.lat && item.lng); // 좌표 없는 데이터 제외

        // 3. Delete Existing Data
        await supabase.from('emergency_stores').delete().eq('type', 'ANIMAL_HOSPITAL');

        // 4. Insert New Data
        if (updates.length > 0) {
            const { error } = await supabase
                .from('emergency_stores')
                .insert(updates);

            if (error) throw error;
        }

        return NextResponse.json({
            success: true,
            count: updates.length,
            message: 'Animal Hospitals synced successfully'
        });

    } catch (error: any) {
        console.error('Animal Hospital Sync Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
