import { NextResponse } from 'next/server';
import { fetchAEDList } from '@/lib/nemcApi';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    try {
        console.log('[AED Sync] Starting sync process...');

        // 1. Fetch from API
        const aedList = await fetchAEDList();
        const items = Array.isArray(aedList) ? aedList : [aedList];

        if (items.length === 0) {
            return NextResponse.json({ success: true, count: 0, message: 'No AEDs found' });
        }

        console.log(`[AED Sync] Total items fetched from API: ${items.length}`);

        // 2. Filter Data
        const filteredItems = items.filter((item: any) => {
            // Check place_name, org, and buildPlace
            const nameToCheck = (
                (item.place_name || '') +
                (item.org || '') +
                (item.buildPlace || '')
            ).replace(/\s+/g, '');

            const excludeKeywords = ['병원', '의료원', '보건소', '장례식장', '요양원', '의료재단', '보건지소', '보건진료소'];

            if (excludeKeywords.some(keyword => nameToCheck.includes(keyword))) {
                return false;
            }

            // Filter out invalid coordinates
            if (!item.wgs84Lat || !item.wgs84Lon) return false;

            return true;
        });

        console.log(`[AED Sync] Items remaining after filter: ${filteredItems.length}`);

        // 3. Transform Data
        const updates = filteredItems.map((item: any) => ({
            id: `AED_${item.rnum || Math.random().toString(36).substr(2, 9)}`,
            place_name: item.buildPlace || item.org,
            address: item.buildAddress,
            model: item.model,
            manager_phone: item.managerTel,
            lat: parseFloat(item.wgs84Lat),
            lng: parseFloat(item.wgs84Lon),
            last_check_date: null,
            status: '정상'
        }));

        // 4. Delete & Insert
        // Use a more aggressive delete if needed, but delete().neq('id', 'placeholder') is fine.
        const { error: deleteError } = await supabase.from('aeds').delete().neq('id', 'placeholder');
        if (deleteError) throw deleteError;

        const BATCH_SIZE = 500; // Smaller batch size to be safe
        for (let i = 0; i < updates.length; i += BATCH_SIZE) {
            const batch = updates.slice(i, i + BATCH_SIZE);
            const { error: insertError } = await supabase.from('aeds').insert(batch);
            if (insertError) {
                console.error('[AED Sync] Insert Error:', insertError);
                throw insertError;
            }
        }

        return NextResponse.json({
            success: true,
            count: updates.length,
            message: `AEDs synced successfully. (Filtered: ${items.length} -> ${updates.length})`,
            timestamp: new Date().toISOString()
        });

    } catch (error: any) {
        console.error('[AED Sync] Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
