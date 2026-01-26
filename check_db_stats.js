import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStats() {
    console.log("Checking Database Stats...");

    // Check AED count
    const { count: aedCount, error: aedError } = await supabase
        .from('aeds')
        .select('*', { count: 'exact', head: true });

    // Check Animal Hospital count
    const { count: animalCount, error: animalError } = await supabase
        .from('emergency_stores')
        .select('*', { count: 'exact', head: true })
        .eq('type', 'ANIMAL_HOSPITAL');

    // Check Pharmacy count
    const { count: pharmacyCount, error: pharmacyError } = await supabase
        .from('emergency_stores')
        .select('*', { count: 'exact', head: true })
        .eq('type', 'PHARMACY');

    console.log({
        aed: aedCount || 0,
        animal_hospital: animalCount || 0,
        pharmacy: pharmacyCount || 0,
    });

    // Check for duplicates in AEDs by location? 
    // Or just look at some samples.
}

checkStats();
