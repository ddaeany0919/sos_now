import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';
import iconv from 'iconv-lite';
import Papa from 'papaparse';
import proj4 from 'proj4';

// Korean Coordinate Systems
const TM_MID = '+proj=tmerc +lat_0=38 +lon_0=127.0028902777778 +k=1 +x_0=200000 +y_0=500000 +ellps=bessel +units=m +no_defs +towgs84=-115.80,474.99,674.11,1.16,-2.31,-1.63,6.43';
const WGS84 = '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const shouldClear = searchParams.get('clear') === 'true';

        console.log("Starting Animal Hospital Sync via CSV... Clear Mode:", shouldClear);

        if (shouldClear) {
            console.log("Clearing existing animal hospital data...");
            await supabase.from('emergency_stores').delete().eq('type', 'ANIMAL_HOSPITAL');
        }

        const filePath = path.join(process.cwd(), 'public', '동물_동물병원.csv');

        if (!fs.existsSync(filePath)) {
            return NextResponse.json({
                success: false,
                message: 'CSV file not found in /public/동물_동물병원.csv'
            });
        }

        const buffer = fs.readFileSync(filePath);
        const csvContent = iconv.decode(buffer, 'EUC-KR');

        const parsed: any = Papa.parse(csvContent, {
            header: true,
            skipEmptyLines: true,
            dynamicTyping: false
        });

        if (!parsed.data || parsed.data.length === 0) {
            return NextResponse.json({ success: false, message: 'Empty CSV' });
        }

        console.log(`Parsed ${parsed.data.length} rows.`);

        const updates = parsed.data.map((row: any) => {
            const status = row['영업상태명'] || '';
            const statusCode = row['영업상태구분코드'] || '';

            if (status && !status.includes('영업') && !status.includes('정상')) {
                if (statusCode !== '01') return null;
            }

            const name = (row['사업장명'] || '').trim();
            if (!name) return null;

            const address = (row['도로명전체주소'] || row['소재지전체주소'] || '').trim();
            const phone = (row['소재지전화번호'] || '').trim();

            let lat = null;
            let lng = null;

            const xStr = row['좌표정보(X)'];
            const yStr = row['좌표정보(Y)'];

            if (xStr && yStr) {
                const x = parseFloat(xStr);
                const y = parseFloat(yStr);

                if (!isNaN(x) && !isNaN(y)) {
                    try {
                        const p = proj4(TM_MID, WGS84, [x, y]);
                        // Strict Korea Bounds: Lat 33~39, Lng 124~132
                        if (p[0] > 124 && p[0] < 132 && p[1] > 33 && p[1] < 39) {
                            lng = p[0];
                            lat = p[1];
                        }
                    } catch (e) { }
                }
            }

            if (!lat || !lng) return null;

            let extId = row['관리번호'];
            if (!extId) {
                const uniqueString = `${name}_${address}`.replace(/\s/g, '');
                extId = `GEN_${uniqueString}`;
            }

            return {
                external_id: `ANIMAL_${extId}`,
                type: 'ANIMAL_HOSPITAL',
                name: name,
                address: address,
                phone: phone,
                lat: lat,
                lng: lng,
                is_24h: true,
                last_verified: new Date().toISOString()
            };
        }).filter((u: any) => u !== null);

        console.log(`Found ${updates.length} valid animal hospitals after filtering.`);

        const chunkSize = 1000;
        let upsertedCount = 0;

        for (let i = 0; i < updates.length; i += chunkSize) {
            const chunk = updates.slice(i, i + chunkSize);
            const { error } = await supabase
                .from('emergency_stores')
                .upsert(chunk, { onConflict: 'external_id' });

            if (error) {
                console.error("Batch upsert error:", error);
                throw error;
            }
            upsertedCount += chunk.length;
        }

        return NextResponse.json({
            success: true,
            count: upsertedCount,
            message: `Processed CSV and synced ${upsertedCount} animal hospitals`
        });

    } catch (error: any) {
        console.error('Animal Hospital CSV Sync Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
