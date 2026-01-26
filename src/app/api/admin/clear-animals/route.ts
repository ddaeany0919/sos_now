import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
    try {
        console.log("Cleaning all ANIMAL_HOSPITAL data...");
        const { error } = await supabase
            .from('emergency_stores')
            .delete()
            .eq('type', 'ANIMAL_HOSPITAL');

        if (error) throw error;

        return NextResponse.json({ success: true, message: 'All Animal Hospitals deleted. Ready for clean sync.' });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message });
    }
}
