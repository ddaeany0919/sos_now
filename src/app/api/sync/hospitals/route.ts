import { NextResponse } from 'next/server';
import { fetchHospitalList, fetchRealtimeBeds } from '@/lib/nemcApi';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const shouldClear = searchParams.get('clear') === 'true';

        if (shouldClear) {
            console.log('[Hospital Sync] Clearing existing hospitals...');
            await supabase.from('emergency_hospitals').delete().neq('hp_id', 'placeholder');
        }

        // 1. 실시간 병상 정보 가져오기 (가장 중요)
        const realtimeData = await fetchRealtimeBeds();
        const realtimeItems = Array.isArray(realtimeData) ? realtimeData : [realtimeData];

        // 2. 기본 병원 목록 가져오기 (위치 정보 등)
        const hospitalList = await fetchHospitalList();
        const hospitalItems = Array.isArray(hospitalList) ? hospitalList : [hospitalList];

        // 3. 데이터 매핑 및 DB 업데이트
        const updates = realtimeItems.map((rt: any) => {
            const baseInfo = hospitalItems.find((h: any) => h.hpid === rt.hpid);

            return {
                hp_id: rt.hpid,
                name: rt.dutyName,
                address: baseInfo?.dutyAddr || '',
                phone: baseInfo?.dutyTel1 || '',
                emergency_phone: rt.dutyTel3 || '',
                lat: baseInfo?.wgs84Lat ? parseFloat(baseInfo.wgs84Lat) : null,
                lng: baseInfo?.wgs84Lon ? parseFloat(baseInfo.wgs84Lon) : null,
                beds_available: parseInt(rt.hvec) || 0,
                beds_total: 0, // 전체 병상 수는 다른 API나 수동 입력 필요
                recent_msg: rt.hv1 || '',
                last_updated: new Date().toISOString()
            };
        });

        // Supabase에 Upsert (중복 시 업데이트)
        const { error } = await supabase
            .from('emergency_hospitals')
            .upsert(updates, { onConflict: 'hp_id' });

        if (error) throw error;

        return NextResponse.json({
            success: true,
            count: updates.length,
            message: 'Hospitals synced successfully'
        });

    } catch (error: any) {
        console.error('Sync Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
