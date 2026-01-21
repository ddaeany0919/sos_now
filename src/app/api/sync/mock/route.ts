import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
    try {
        // 1. Mock Pharmacies
        const pharmacies = [
            {
                type: 'PHARMACY',
                name: '24시 온누리약국',
                address: '서울특별시 종로구 종로 123',
                phone: '02-1234-5678',
                lat: 37.5700,
                lng: 126.9850,
                is_24h: true,
                business_hours: { mon: '00:00-24:00', tue: '00:00-24:00', wed: '00:00-24:00', thu: '00:00-24:00', fri: '00:00-24:00', sat: '00:00-24:00', sun: '00:00-24:00' }
            },
            {
                type: 'PHARMACY',
                name: '서울약국',
                address: '서울특별시 중구 명동길 456',
                phone: '02-2345-6789',
                lat: 37.5635,
                lng: 126.9861,
                is_24h: false,
                business_hours: { mon: '09:00-22:00', tue: '09:00-22:00', wed: '09:00-22:00', thu: '09:00-22:00', fri: '09:00-22:00', sat: '09:00-18:00', sun: 'closed' }
            }
        ];

        // 2. Mock Animal Hospitals
        const animalHospitals = [
            {
                type: 'ANIMAL_HOSPITAL',
                name: '청담 24시 동물병원',
                address: '서울특별시 강남구 학동로 456',
                phone: '02-555-0000',
                lat: 37.5190,
                lng: 127.0400,
                is_24h: true,
                business_hours: { mon: '00:00-24:00', tue: '00:00-24:00', wed: '00:00-24:00', thu: '00:00-24:00', fri: '00:00-24:00', sat: '00:00-24:00', sun: '00:00-24:00' }
            },
            {
                type: 'ANIMAL_HOSPITAL',
                name: '홍대 야간 동물메디컬센터',
                address: '서울특별시 마포구 양화로 123',
                phone: '02-333-7777',
                lat: 37.5550,
                lng: 126.9230,
                is_24h: true,
                business_hours: { mon: '00:00-24:00', tue: '00:00-24:00', wed: '00:00-24:00', thu: '00:00-24:00', fri: '00:00-24:00', sat: '00:00-24:00', sun: '00:00-24:00' }
            }
        ];

        // 3. Mock AEDs
        const aeds = [
            {
                id: 'AED_001',
                place_name: 'AED - 서울시청 1층',
                address: '서울특별시 중구 세종대로 110',
                model: 'CU-SP1',
                manager_phone: '02-120',
                lat: 37.5663,
                lng: 126.9779,
                last_check_date: '2025-11-15',
                status: '정상'
            },
            {
                id: 'AED_002',
                place_name: 'AED - 광화문역 대합실',
                address: '서울특별시 종로구 세종로 지하',
                model: 'NF1200',
                manager_phone: '02-1234-5678',
                lat: 37.5720,
                lng: 126.9762,
                last_check_date: '2025-09-10',
                status: '점검필요'
            }
        ];

        // Delete existing mock data
        await supabase.from('emergency_stores').delete().in('type', ['PHARMACY', 'ANIMAL_HOSPITAL']);
        await supabase.from('aeds').delete().neq('id', '');

        // Insert Stores
        const { error: storeError } = await supabase
            .from('emergency_stores')
            .insert([...pharmacies, ...animalHospitals]);

        if (storeError) throw storeError;

        // Insert AEDs
        const { error: aedError } = await supabase
            .from('aeds')
            .insert(aeds);

        if (aedError) throw aedError;

        return NextResponse.json({
            success: true,
            message: 'Mock data for Phase 1 synced successfully',
            counts: {
                stores: pharmacies.length + animalHospitals.length,
                aeds: aeds.length
            }
        });

    } catch (error: any) {
        console.error('Mock Sync Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
