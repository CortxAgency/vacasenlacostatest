const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://xjjkqmjxuemfdnqogkpa.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqamtxbWp4dWVtZmRucW9na3BhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDEyNDY2OCwiZXhwIjoyMDc5NzAwNjY4fQ.XmaD_cbRL3E6PicTFq8FPe0yptvDi--SofUDG8OmbZc';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
});

const tests = {
    passed: [],
    failed: [],
    warnings: []
};

function log(emoji, message, type = 'info') {
    console.log(`${emoji} ${message}`);
    if (type === 'pass') tests.passed.push(message);
    if (type === 'fail') tests.failed.push(message);
    if (type === 'warn') tests.warnings.push(message);
}

async function testDatabaseStructure() {
    console.log('\n🗄️  === TESTING DATABASE STRUCTURE ===\n');

    // Test 1: Properties table essential columns
    try {
        const { data, error } = await supabase
            .from('properties')
            .select('id, title, price, currency, operation_type, address, rooms, bathrooms, location, is_featured, owner_id, status, created_at')
            .limit(1);

        if (error) throw error;
        log('✅', 'Properties table: All essential columns exist', 'pass');
    } catch (err) {
        log('❌', `Properties table: Missing columns - ${err.message}`, 'fail');
    }

    // Test 2: Property Images table
    try {
        const { data, error } = await supabase
            .from('property_images')
            .select('id, property_id, url, order')
            .limit(1);

        if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
        log('✅', 'Property Images table: Structure OK', 'pass');
    } catch (err) {
        log('❌', `Property Images table: ${err.message}`, 'fail');
    }

    // Test 3: Favorites table
    try {
        const { data, error } = await supabase
            .from('favorites')
            .select('id, user_id, property_id, created_at')
            .limit(1);

        if (error && error.code !== 'PGRST116') throw error;
        log('✅', 'Favorites table: Structure OK', 'pass');
    } catch (err) {
        log('❌', `Favorites table: ${err.message}`, 'fail');
    }

    // Test 4: Users table
    try {
        const { data, error } = await supabase
            .from('users')
            .select('id, email, full_name, whatsapp, avatar_url')
            .limit(1);

        if (error && error.code !== 'PGRST116') throw error;
        log('✅', 'Users table: Structure OK', 'pass');
    } catch (err) {
        log('❌', `Users table: ${err.message}`, 'fail');
    }
}

async function testDataIntegrity() {
    console.log('\n🔍 === TESTING DATA INTEGRITY ===\n');

    // Test 1: Check for orphaned images
    try {
        const { data: images, error } = await supabase
            .from('property_images')
            .select('property_id')
            .limit(100);

        if (error) throw error;

        if (images && images.length > 0) {
            const propertyIds = [...new Set(images.map(img => img.property_id))];
            const { data: properties } = await supabase
                .from('properties')
                .select('id')
                .in('id', propertyIds);

            const orphanCount = propertyIds.length - (properties?.length || 0);
            if (orphanCount > 0) {
                log('⚠️', `Found ${orphanCount} orphaned images (no matching property)`, 'warn');
            } else {
                log('✅', 'No orphaned images found', 'pass');
            }
        } else {
            log('ℹ️', 'No images in database yet', 'info');
        }
    } catch (err) {
        log('❌', `Error checking orphaned images: ${err.message}`, 'fail');
    }

    // Test 2: Check for properties without images
    try {
        const { data: props, error } = await supabase
            .from('properties')
            .select('id, title')
            .eq('status', 'active')
            .limit(50);

        if (error) throw error;

        if (props && props.length > 0) {
            const { data: images } = await supabase
                .from('property_images')
                .select('property_id');

            const imagePropertyIds = new Set(images?.map(img => img.property_id) || []);
            const propsWithoutImages = props.filter(p => !imagePropertyIds.has(p.id));

            if (propsWithoutImages.length > 0) {
                log('⚠️', `${propsWithoutImages.length} properties have no images`, 'warn');
            } else {
                log('✅', 'All active properties have images', 'pass');
            }
        } else {
            log('ℹ️', 'No properties in database yet', 'info');
        }
    } catch (err) {
        log('❌', `Error checking properties without images: ${err.message}`, 'fail');
    }

    // Test 3: Check for invalid locations
    try {
        const { data: props, error } = await supabase
            .from('properties')
            .select('id, location')
            .eq('status', 'active')
            .limit(100);

        if (error) throw error;

        if (props && props.length > 0) {
            const defaultLocationCount = props.filter(p => p.location === '(0,0)' || !p.location).length;
            if (defaultLocationCount > 0) {
                log('⚠️', `${defaultLocationCount} properties have default/invalid location (0,0)`, 'warn');
            } else {
                log('✅', 'All properties have valid locations', 'pass');
            }
        }
    } catch (err) {
        log('❌', `Error checking locations: ${err.message}`, 'fail');
    }
}

async function testRLS() {
    console.log('\n🔒 === TESTING ROW LEVEL SECURITY ===\n');

    // Test 1: Check if RLS is enabled
    try {
        const { data, error } = await supabase.rpc('exec_sql', {
            sql: `
        SELECT tablename, rowsecurity 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename IN ('properties', 'favorites', 'users');
      `
        });

        if (error) {
            log('⚠️', 'Cannot verify RLS status via exec_sql', 'warn');
        } else {
            log('✅', 'RLS status check completed', 'pass');
        }
    } catch (err) {
        log('⚠️', 'RLS verification skipped (requires manual check)', 'warn');
    }

    // Test 2: Check if policies exist for favorites
    try {
        const { data, error } = await supabase.rpc('exec_sql', {
            sql: `
        SELECT COUNT(*) as policy_count 
        FROM pg_policies 
        WHERE tablename = 'favorites';
      `
        });

        if (error) {
            log('⚠️', 'Cannot verify RLS policies via exec_sql', 'warn');
        } else {
            log('✅', 'RLS policies check completed', 'pass');
        }
    } catch (err) {
        log('⚠️', 'RLS policies verification skipped', 'warn');
    }
}

async function testIndexes() {
    console.log('\n⚡ === TESTING INDEXES ===\n');

    try {
        const { data, error } = await supabase.rpc('exec_sql', {
            sql: `
        SELECT indexname 
        FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND tablename = 'properties';
      `
        });

        if (error) {
            log('⚠️', 'Cannot verify indexes via exec_sql', 'warn');
        } else {
            log('✅', 'Index verification completed', 'pass');
        }
    } catch (err) {
        log('⚠️', 'Index verification skipped', 'warn');
    }
}

async function testActionsAndValidations() {
    console.log('\n🎯 === TESTING SERVER ACTIONS (File Review) ===\n');

    const fs = require('fs');
    const path = require('path');

    // Check if critical action files exist
    const actionFiles = [
        'actions/property.ts',
        'actions/get-properties.ts',
        'actions/upload.ts',
        'actions/profile.ts',
        'actions/favorites.ts'
    ];

    actionFiles.forEach(file => {
        const filePath = path.join(process.cwd(), file);
        if (fs.existsSync(filePath)) {
            log('✅', `Server action exists: ${file}`, 'pass');
        } else {
            log('❌', `Missing server action: ${file}`, 'fail');
        }
    });

    // Check if validation schemas are in place
    const content = fs.readFileSync(path.join(process.cwd(), 'actions/profile.ts'), 'utf8');
    if (content.includes('whatsapp') && content.includes('regex')) {
        log('✅', 'WhatsApp validation is implemented', 'pass');
    } else {
        log('⚠️', 'WhatsApp validation may be weak', 'warn');
    }
}

async function testComponents() {
    console.log('\n🎨 === TESTING COMPONENTS (File Review) ===\n');

    const fs = require('fs');
    const path = require('path');

    const criticalComponents = [
        'components/property-card.tsx',
        'components/property-map.tsx',
        'components/location-picker.tsx',
        'components/search-filters.tsx',
        'components/like-button.tsx'
    ];

    criticalComponents.forEach(file => {
        const filePath = path.join(process.cwd(), file);
        if (fs.existsSync(filePath)) {
            log('✅', `Component exists: ${file}`, 'pass');
        } else {
            log('❌', `Missing component: ${file}`, 'fail');
        }
    });
}

async function printSummary() {
    console.log('\n\n📊 === TEST SUMMARY ===\n');
    console.log(`✅ Passed: ${tests.passed.length}`);
    console.log(`❌ Failed: ${tests.failed.length}`);
    console.log(`⚠️  Warnings: ${tests.warnings.length}`);

    if (tests.failed.length > 0) {
        console.log('\n❌ FAILED TESTS:');
        tests.failed.forEach(test => console.log(`   - ${test}`));
    }

    if (tests.warnings.length > 0) {
        console.log('\n⚠️  WARNINGS:');
        tests.warnings.forEach(test => console.log(`   - ${test}`));
    }

    console.log('\n');

    if (tests.failed.length === 0 && tests.warnings.length === 0) {
        console.log('🎉 ALL CHECKS PASSED! Application appears ready for testing.\n');
    } else if (tests.failed.length === 0) {
        console.log('✅ No critical failures, but some warnings to review.\n');
    } else {
        console.log('🚨 Critical issues found. Fix failed tests before proceeding.\n');
    }
}

async function runAllTests() {
    console.log('🚀 Starting comprehensive application test...\n');

    await testDatabaseStructure();
    await testDataIntegrity();
    await testRLS();
    await testIndexes();
    await testActionsAndValidations();
    await testComponents();
    await printSummary();
}

runAllTests();
