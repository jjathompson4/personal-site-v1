
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyRLS() {
    console.log('Applying RLS policies...');

    // 1. Storage Policies (Standard objects table in storage schema)
    // Note: We can't easily manipulate SQL schema via JS client for storage schema tables usually, 
    // but we can check if we can insert logic via SQL function or if we just need to use the dashboard.
    // Actually, standard usage is to run SQL migration. Since I don't have direct SQL prompt, 
    // I will check if 'media' table allows inserts.

    // Checking 'media' table simple insert
    const { data, error } = await supabase.from('media').insert({
        file_url: 'test',
        file_type: 'image',
        filename: 'test-policy.jpg',
        file_size: 100,
        sort_order: 0,
        metadata: {}
    }).select();

    if (error) {
        console.error('Media table Insert Failed:', error);
    } else {
        console.log('Media table Insert Success (Service Role):', data);
        // Cleanup
        await supabase.from('media').delete().eq('id', data[0].id);
    }
}

applyRLS();
