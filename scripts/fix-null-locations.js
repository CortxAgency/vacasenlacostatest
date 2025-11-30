const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function fixNullLocations() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    console.log('\n🔧 ARREGLANDO UBICACIONES NULL\n')

    // Ubicación por defecto: Pinamar centro
    const DEFAULT_LOCATION = '(-37.1084,-56.8533)'

    // Obtener todas las propiedades
    const { data: allProps } = await supabase
        .from('properties')
        .select('id, title, address, location')
        .eq('status', 'active')

    if (!allProps) {
        console.log('❌ Error obteniendo propiedades')
        return
    }

    // Filtrar las que tienen problemas
    const nullProps = allProps.filter(p =>
        !p.location ||
        p.location === 'null' ||
        p.location === '(0,0)' ||
        p.location.trim() === ''
    )

    if (!nullProps || nullProps.length === 0) {
        console.log('✅ No hay propiedades con ubicaciones inválidas')
        return
    }

    console.log(`Encontradas ${nullProps.length} propiedades con ubicación NULL o (0,0):\n`)

    for (const prop of nullProps) {
        console.log(`📌 Actualizando: "${prop.title}"`)
        console.log(`   Dirección: ${prop.address}`)
        console.log(`   Location anterior: ${prop.location}`)
        console.log(`   Location nueva: ${DEFAULT_LOCATION} (Pinamar centro)`)

        const { error } = await supabase
            .from('properties')
            .update({ location: DEFAULT_LOCATION })
            .eq('id', prop.id)

        if (error) {
            console.log(`   ❌ Error: ${error.message}`)
        } else {
            console.log(`   ✅ Actualizada correctamente`)
        }
        console.log('')
    }

    console.log('✅ Proceso completado')
}

fixNullLocations()
