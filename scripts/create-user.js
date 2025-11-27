const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function createUser() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const email = `e2e_user_${Date.now()}@test.com`;
    const password = 'Password123!';

    console.log(`Creating user: ${email}`);
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    });

    if (error) {
        console.error('Error:', error.message);
    } else {
        console.log('User created:', data.user?.id);
        console.log('Email:', email);
        console.log('Password:', password);
    }
}

createUser();
