import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import proj4 from 'proj4';

// Define projection for Local Data (Bessel 1841 Middle Zone) -> EPSG:5174
// Note: Local Data often uses a specific variation. 
// Common for Korea Local Data: "+proj=tmerc +lat_0=38 +lon_0=127.0028902777778 +k=1 +x_0=200000 +y_0=500000 +ellps=bessel +units=m +no_defs"
// Or EPSG:2097? Let's try the standard 5174 definition first.
const EPSG_5174 = "+proj=tmerc +lat_0=38 +lon_0=127.0028902777778 +k=1 +x_0=200000 +y_0=500000 +ellps=bessel +units=m +no_defs +towgs84=-115.80,474.99,674.11,1.16,-2.31,-1.63,6.43";
const EPSG_4326 = "EPSG:4326"; // WGS84

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { type, data } = body;

        if (type !== 'ANIMAL_HOSPITAL') {
            return NextResponse.json({ success: false, error: 'Invalid type' }, { status: 400 });
        }

        if (!data || !Array.isArray(data)) {
            return NextResponse.json({ success: false, error: 'Invalid data format' }, { status: 400 });
        }

        console.log(`Processing ${data.length} records...`);

        const updates = data
            .filter((item: any) => {
                // 1. Filter by Status (영업상태명: 영업/정상)
                const status = item['영업상태명'] || item['상세영업상태명'];
                return status === '영업' || status === '정상';
            })
            .map((item: any) => {
                let lat = null;
                let lng = null;

                // 2. Coordinate Conversion
                // If '좌표정보(X)' and '좌표정보(Y)' exist, convert them.
                // Sometimes they are already WGS84 in '위도', '경도' columns.
                if (item['위도'] && item['경도']) {
                    lat = parseFloat(item['위도']);
                    lng = parseFloat(item['경도']);
                } else if (item['좌표정보(Y)'] && item['좌표정보(X)']) {
                    const x = parseFloat(item['좌표정보(X)']);
                    const y = parseFloat(item['좌표정보(Y)']);

                    if (!isNaN(x) && !isNaN(y)) {
                        // Check if they look like WGS84 (small numbers)
                        if (x > 120 && x < 135 && y > 30 && y < 45) {
                            lng = x;
                            lat = y;
                        } else {
                            // Assume EPSG:5174 and convert
                            try {
                                const [wgsLng, wgsLat] = proj4(EPSG_5174, EPSG_4326, [x, y]);
                                lat = wgsLat;
                                lng = wgsLng;
                            } catch (e) {
                                console.error('Projection Error:', e);
                            }
                        }
                    }
                }

                return {
                    type: 'ANIMAL_HOSPITAL',
                    name: item['사업장명'],
                    address: item['도로명전체주소'] || item['소재지전체주소'],
                    phone: item['소재지전화'],
                    lat: lat,
                    lng: lng,
                    is_24h: false, // CSV doesn't usually have this, default to false
                    business_hours: null,
                    last_verified: new Date().toISOString()
                };
            })
            .filter((item: any) => item.lat && item.lng && item.name); // Valid records only

        if (updates.length === 0) {
            return NextResponse.json({ success: false, error: 'No valid records found (Check CSV format)' }, { status: 400 });
        }

        // 3. Delete Existing Data
        await supabase.from('emergency_stores').delete().eq('type', 'ANIMAL_HOSPITAL');

        // 4. Insert New Data (Batch insert to avoid payload limit)
        const BATCH_SIZE = 1000;
        for (let i = 0; i < updates.length; i += BATCH_SIZE) {
            const batch = updates.slice(i, i + BATCH_SIZE);
            const { error } = await supabase.from('emergency_stores').insert(batch);
            if (error) {
                console.error('Insert Error:', error);
                throw error;
            }
        }

        return NextResponse.json({
            success: true,
            count: updates.length,
            message: 'Upload successful'
        });

    } catch (error: any) {
        console.error('Upload Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
