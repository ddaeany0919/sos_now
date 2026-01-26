import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        const { origin } = new URL(request.url);

        console.log('[Sync All] Starting full synchronization...');

        // Sequential fetch to avoid hitting API rate limits or DB pool limits too hard
        const results: any = {};

        // 1. Hospital (Clear & Sync)
        const resH = await fetch(`${origin}/api/sync/hospitals?clear=true`);
        results.hospitals = await resH.json();

        // 2. Pharmacy (Always clears in current implementation)
        const resP = await fetch(`${origin}/api/sync/pharmacies`);
        results.pharmacies = await resP.json();

        // 3. AED (Always clears in current implementation)
        const resA = await fetch(`${origin}/api/sync/aeds`);
        results.aeds = await resA.json();

        // 4. Animal Hospital (Clear & Sync)
        const resAn = await fetch(`${origin}/api/sync/animal-hospitals?clear=true`);
        results.animal_hospitals = await resAn.json();

        return NextResponse.json({
            success: true,
            results,
            message: 'All categories synced successfully after clearing.'
        });

    } catch (error: any) {
        console.error('[Sync All] Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
