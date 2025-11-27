const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function listUsers() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const { data, error } = await supabase
        .from('users')
        .select('email, id');

    if (error) {
        console.error('Error:', error.message);
    } else {
        console.log('Users found:', data.length);
        data.forEach(u => console.log(`- ${u.email} (${u.id})`));
    }
}

listUsers();
