const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Env Vars");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStats() {
    try {
        console.log("Checking Database Stats (CJS)...");

        const { count: aedCount } = await supabase.from('aeds').select('*', { count: 'exact', head: true });
        const { count: animalCount } = await supabase.from('emergency_stores').select('*', { count: 'exact', head: true }).eq('type', 'ANIMAL_HOSPITAL');
        const { count: pharmacyCount } = await supabase.from('emergency_stores').select('*', { count: 'exact', head: true }).eq('type', 'PHARMACY');

        console.log("STATS_JSON:" + JSON.stringify({
            aed: aedCount || 0,
            animal_hospital: animalCount || 0,
            pharmacy: pharmacyCount || 0,
        }));
    } catch (e) {
        console.error(e);
    }
}

checkStats();
