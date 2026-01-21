import { NextResponse } from 'next/server';
import { fetchAEDList } from '@/lib/nemcApi';
import { supabase } from '@/lib/supabase';

export async function GET() {
    try {
        const aedList = await fetchAEDList();
        const items = Array.isArray(aedList) ? aedList : [aedList];

        if (items.length === 0) {
            return NextResponse.json({ success: true, count: 0, message: 'No AEDs found' });
        }

        const updates = items.map((item: any) => ({
            id: item.serialSeq || item.wgs84Lat + item.wgs84Lon, // serialSeq를 고유 ID로 사용
            place_name: item.buildPlace,
            address: item.buildAddress,
            model: item.model,
            manager_phone: item.managerTel,
            lat: item.wgs84Lat ? parseFloat(item.wgs84Lat) : null,
            lng: item.wgs84Lon ? parseFloat(item.wgs84Lon) : null,
            status: 'AVAILABLE',
            last_check_date: new Date().toISOString().split('T')[0]
        }));

        // 기존 데이터 삭제 후 재삽입
        await supabase.from('aeds').delete().neq('id', '');

        const { error } = await supabase
            .from('aeds')
            .insert(updates);

        if (error) throw error;

        return NextResponse.json({
            success: true,
            count: updates.length,
            message: 'AEDs synced successfully'
        });

    } catch (error: any) {
        console.error('AED Sync Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
