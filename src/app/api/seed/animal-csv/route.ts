import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';
import iconv from 'iconv-lite';
import Papa from 'papaparse';
import proj4 from 'proj4';

// Define projection for Local Data (Bessel 1841 Middle Zone) -> EPSG:5174
const EPSG_5174 = "+proj=tmerc +lat_0=38 +lon_0=127.0028902777778 +k=1 +x_0=200000 +y_0=500000 +ellps=bessel +units=m +no_defs +towgs84=-115.80,474.99,674.11,1.16,-2.31,-1.63,6.43";
const EPSG_4326 = "EPSG:4326"; // WGS84

export async function GET() {
    try {
        const filePath = path.join(process.cwd(), 'public', '동물_동물병원.csv');

        if (!fs.existsSync(filePath)) {
            return NextResponse.json({ success: false, error: 'File not found in public/동물_동물병원.csv' }, { status: 404 });
        }

        console.log('Reading file:', filePath);
        const buffer = fs.readFileSync(filePath);
        const decodedContent = iconv.decode(buffer, 'euc-kr'); // Decode EUC-KR to UTF-8

        console.log('Parsing CSV...');
        const parseResult = Papa.parse(decodedContent, {
            header: true,
            skipEmptyLines: true,
        });

        if (parseResult.errors.length > 0) {
            console.warn('CSV Parse Warnings:', parseResult.errors.slice(0, 5));
        }

        const data = parseResult.data;
        console.log(`Parsed ${data.length} records.`);

        const updates = data
            .filter((item: any) => {
                // 1. Filter by Status
                const status = item['영업상태명'] || item['상세영업상태명'] || '';
                // Check for '영업' or '정상' (sometimes it's '영업/정상')
                const isValid = status.includes('영업') || status.includes('정상');

                if (!isValid && Math.random() < 0.001) {
                    console.log(`Skipping item: ${item['사업장명']} (Status: ${status})`);
                }
                return isValid;
            })
            .map((item: any) => {
                let lat = null;
                let lng = null;

                // 2. Coordinate Conversion
                if (item['위도'] && item['경도']) {
                    lat = parseFloat(item['위도']);
                    lng = parseFloat(item['경도']);
                } else if (item['좌표정보(Y)'] && item['좌표정보(X)']) {
                    const x = parseFloat(item['좌표정보(X)']);
                    const y = parseFloat(item['좌표정보(Y)']);

                    if (!isNaN(x) && !isNaN(y)) {
                        if (x > 120 && x < 135 && y > 30 && y < 45) {
                            lng = x;
                            lat = y;
                        } else {
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
                    address: item['도로명주소'] || item['지번주소'],
                    phone: item['전화번호'],
                    lat: lat,
                    lng: lng,
                    is_24h: false,
                    business_hours: null,
                    last_verified: new Date().toISOString()
                };
            })
            .filter((item: any) => {
                const hasCoords = item.lat && item.lng;
                if (!hasCoords && Math.random() < 0.001) {
                    console.log(`Skipping item (No Coords): ${item.name}`);
                }
                return hasCoords && item.name;
            });

        console.log(`Valid records to insert: ${updates.length}`);

        if (updates.length === 0) {
            // Debug: Print first item to see what's wrong
            if (data.length > 0) {
                console.log('First item sample:', data[0]);
            }
            return NextResponse.json({ success: false, error: 'No valid records found. Check server logs for sample data.' }, { status: 400 });
        }

        // 3. Delete Existing Data
        await supabase.from('emergency_stores').delete().eq('type', 'ANIMAL_HOSPITAL');

        // 4. Insert New Data (Batch insert)
        const BATCH_SIZE = 1000;
        let insertedCount = 0;
        for (let i = 0; i < updates.length; i += BATCH_SIZE) {
            const batch = updates.slice(i, i + BATCH_SIZE);
            const { error } = await supabase.from('emergency_stores').insert(batch);
            if (error) {
                console.error('Insert Error:', error);
                throw error;
            }
            insertedCount += batch.length;
            console.log(`Inserted batch ${i} - ${i + batch.length}`);
        }

        return NextResponse.json({
            success: true,
            count: insertedCount,
            message: 'Seed successful'
        });

    } catch (error: any) {
        console.error('Seed Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
