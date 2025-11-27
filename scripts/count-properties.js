const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function countProperties() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const { count, error } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Active Properties:', count);
    }
}

countProperties();
