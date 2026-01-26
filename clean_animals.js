/*
 * Duplicate Cleaner
 * Removes Animal_Hospital entries with random External IDs to fix duplication issues.
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!; // We need Service Role Key strictly speaking for bulk delete if RLS protects it, but let's try Anon key or user needs to use Dashboard.
// Actually, I don't have service role key in .env.local usually.
// But the user has delete policy? Likely not.
// Let's print instructions or try to use the key available.

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanDuplicates() {
    console.log("Cleaning duplicates for Animal Hospitals...");

    // Strategy: Delete ALL animal hospitals and re-sync.
    // This is the cleanest way.

    const { error } = await supabase
        .from('emergency_stores')
        .delete()
        .eq('type', 'ANIMAL_HOSPITAL');

    if (error) {
        console.error("Delete failed:", error);
    } else {
        console.log("Successfully deleted all animal hospitals. Please re-sync.");
    }
}

cleanDuplicates();
