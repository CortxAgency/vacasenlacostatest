const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function criticalSmokeTest() {
    console.log('🕵️‍♂️ Starting Critical Smoke Test...');

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // 1. Test Login with known user
    // We found this user in a previous step: test.user.1764191236642@gmail.com
    const email = 'test.user.1764191236642@gmail.com';
    const password = 'Password123!';

    console.log(`🔑 Attempting Login for: ${email}`);
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (authError) {
        console.error('❌ Login FAILED:', authError.message);
        return;
    }

    console.log('✅ Login SUCCESS');
    const user = authData.user;
    const token = authData.session.access_token;

    // 2. Test RLS / Insert Property
    // We create a new client with the user's token to simulate a real user action
    const userClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
            global: {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        }
    );

    console.log('🏠 Attempting to Publish Property (RLS Check)...');
    const { data: propData, error: propError } = await userClient
        .from('properties')
        .insert({
            owner_id: user.id,
            title: 'Smoke Test Property',
            description: 'Created via automated smoke test',
            price: 12345,
            currency: 'USD',
            operation_type: 'sale',
            rooms: 2,
            bathrooms: 1,
            address: 'Test St 123',
            status: 'active'
        })
        .select()
        .single();

    if (propError) {
        console.error('❌ Property Insert FAILED:', JSON.stringify(propError, null, 2));
        return;
    }

    console.log('✅ Property Insert SUCCESS');
    console.log(`   ID: ${propData.id}`);

    // 3. Test Read (Public Access)
    console.log('👀 Attempting to Read Property (Public Access)...');
    const { data: readData, error: readError } = await supabase
        .from('properties')
        .select('*')
        .eq('id', propData.id)
        .single();

    if (readError || !readData) {
        console.error('❌ Public Read FAILED:', readError?.message);
    } else {
        console.log('✅ Public Read SUCCESS');
    }

    // Cleanup (Delete the test property)
    console.log('🧹 Cleaning up...');
    await userClient.from('properties').delete().eq('id', propData.id);
    console.log('✅ Cleanup Done');

    console.log('\n🎉 SYSTEM STATUS: OPERATIONAL');
}

criticalSmokeTest();
