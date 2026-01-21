import { NextResponse } from 'next/server';
import { fetchPharmacyList } from '@/lib/nemcApi';
import { supabase } from '@/lib/supabase';

export async function GET() {
    try {
        const pharmacyList = await fetchPharmacyList();
        const items = Array.isArray(pharmacyList) ? pharmacyList : [pharmacyList];

        if (items.length === 0) {
            return NextResponse.json({ success: true, count: 0, message: 'No pharmacies found' });
        }

        const updates = items.map((item: any) => ({
            type: 'PHARMACY',
            name: item.dutyName,
            address: item.dutyAddr,
            phone: item.dutyTel1,
            lat: item.wgs84Lat ? parseFloat(item.wgs84Lat) : null,
            lng: item.wgs84Lon ? parseFloat(item.wgs84Lon) : null,
            is_24h: false,
            business_hours: {
                mon: item.dutyTime1s && item.dutyTime1c ? `${item.dutyTime1s}-${item.dutyTime1c}` : null,
                tue: item.dutyTime2s && item.dutyTime2c ? `${item.dutyTime2s}-${item.dutyTime2c}` : null,
                wed: item.dutyTime3s && item.dutyTime3c ? `${item.dutyTime3s}-${item.dutyTime3c}` : null,
                thu: item.dutyTime4s && item.dutyTime4c ? `${item.dutyTime4s}-${item.dutyTime4c}` : null,
                fri: item.dutyTime5s && item.dutyTime5c ? `${item.dutyTime5s}-${item.dutyTime5c}` : null,
                sat: item.dutyTime6s && item.dutyTime6c ? `${item.dutyTime6s}-${item.dutyTime6c}` : null,
                sun: item.dutyTime7s && item.dutyTime7c ? `${item.dutyTime7s}-${item.dutyTime7c}` : null,
                hol: item.dutyTime8s && item.dutyTime8c ? `${item.dutyTime8s}-${item.dutyTime8c}` : null,
            },
            last_verified: new Date().toISOString()
        }));

        // 기존 약국 데이터 삭제 후 재삽입 (중복 방지)
        await supabase.from('emergency_stores').delete().eq('type', 'PHARMACY');

        const { error } = await supabase
            .from('emergency_stores')
            .insert(updates);

        if (error) throw error;

        return NextResponse.json({
            success: true,
            count: updates.length,
            message: 'Pharmacies synced successfully'
        });

    } catch (error: any) {
        console.error('Pharmacy Sync Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
