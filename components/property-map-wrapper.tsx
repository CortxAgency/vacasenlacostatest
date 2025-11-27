'use client'

import dynamic from 'next/dynamic'

const PropertyMap = dynamic(() => import('@/components/property-map'), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-muted animate-pulse rounded-3xl flex items-center justify-center text-muted-foreground">Cargando mapa...</div>
})

export default PropertyMap
