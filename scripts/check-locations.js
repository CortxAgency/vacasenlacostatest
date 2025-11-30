const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function checkLocations() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    console.log('\n🔍 DIAGNÓSTICO DE UBICACIONES\n')

    const { data: properties, error } = await supabase
        .from('properties')
        .select('id, title, address, location')
        .eq('status', 'active')

    if (error) {
        console.error('❌ Error:', error)
        return
    }

    console.log(`Total de propiedades activas: ${properties.length}\n`)

    properties.forEach((prop, i) => {
        console.log(`${i + 1}. "${prop.title}"`)
        console.log(`   Dirección: ${prop.address}`)
        console.log(`   Location (raw): "${prop.location}"`)

        // Intentar parsear
        if (prop.location) {
            const match = prop.location.match(/\(([^,]+),([^)]+)\)/)
            if (match) {
                const lat = parseFloat(match[1])
                const lng = parseFloat(match[2])
                console.log(`   Coordenadas parseadas: lat=${lat}, lng=${lng}`)

                if (lat === 0 && lng === 0) {
                    console.log(`   ⚠️  PROBLEMA: Ubicación en (0,0) - No se guardó correctamente`)
                } else if (Math.abs(lat) > 90 || Math.abs(lng) > 180) {
                    console.log(`   ⚠️  PROBLEMA: Coordenadas inválidas`)
                } else {
                    console.log(`   ✅ Ubicación válida`)
                }
            } else {
                console.log(`   ⚠️  PROBLEMA: Formato inválido, no se puede parsear`)
            }
        } else {
            console.log(`   ⚠️  PROBLEMA: Campo location es NULL`)
        }
        console.log('')
    })

    // Resumen
    const nullLocations = properties.filter(p => !p.location).length
    const zeroLocations = properties.filter(p => p.location === '(0,0)').length
    const validLocations = properties.filter(p => {
        if (!p.location) return false
        const match = p.location.match(/\(([^,]+),([^)]+)\)/)
        if (!match) return false
        const lat = parseFloat(match[1])
        const lng = parseFloat(match[2])
        return lat !== 0 || lng !== 0
    }).length

    console.log('📊 RESUMEN:')
    console.log(`   NULL: ${nullLocations}`)
    console.log(`   (0,0): ${zeroLocations}`)
    console.log(`   Válidas: ${validLocations}`)
    console.log('')
}

checkLocations()
