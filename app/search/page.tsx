'use client'

import dynamic from 'next/dynamic'
import { PropertyCard } from '@/components/property-card'
import { PropertyCardSkeleton } from '@/components/property-card-skeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Map as MapIcon, List, SlidersHorizontal } from 'lucide-react'
import { useState, useEffect, Suspense } from 'react'
import { SearchFilters } from '@/components/search-filters'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { getProperties } from '@/actions/get-properties'
import { useSearchParams } from 'next/navigation'

// Dynamically import Map to avoid SSR issues with Leaflet
const PropertyMap = dynamic(() => import('@/components/property-map'), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-muted animate-pulse flex items-center justify-center">Cargando mapa...</div>
})

function SearchContent() {
    const searchParams = useSearchParams()
    const [showMap, setShowMap] = useState(false)
    const [properties, setProperties] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchProps = async () => {
            setLoading(true)
            const operation = searchParams.get('op') || undefined
            const minPrice = searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!) : undefined
            const maxPrice = searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : undefined
            const rooms = searchParams.get('rooms') ? parseInt(searchParams.get('rooms')!) : undefined

            const data = await getProperties({
                operation_type: operation,
                minPrice,
                maxPrice,
                rooms
            })
            setProperties(data || [])
            setLoading(false)
        }
        fetchProps()
    }, [searchParams])

    return (
        <div className="container py-8 min-h-[calc(100vh-4rem)] flex flex-col">
            <div className="flex flex-col md:flex-row gap-6 mb-8 items-end shrink-0 bg-card/50 p-6 rounded-3xl border shadow-sm backdrop-blur-sm">
                <div className="flex-1 w-full space-y-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Explorar Propiedades</h1>
                        <p className="text-muted-foreground">Encontrá el lugar perfecto para tus próximas vacaciones</p>
                    </div>
                    <div className="flex gap-3">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por ciudad, zona o barrio..."
                                className="pl-10 h-12 rounded-xl border-slate-200 bg-white focus-visible:ring-primary/20"
                            />
                        </div>
                        <Button className="h-12 px-8 rounded-xl font-semibold shadow-lg shadow-primary/20">
                            Buscar
                        </Button>

                        {/* Mobile Filter Button */}
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="outline" className="md:hidden h-12 px-4 rounded-xl border-slate-200">
                                    <SlidersHorizontal className="h-4 w-4" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                                <div className="mt-6">
                                    <SearchFilters />
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
                <Button
                    variant="outline"
                    onClick={() => setShowMap(!showMap)}
                    className="h-12 px-6 rounded-xl border-slate-200 hover:bg-slate-50 hover:text-primary transition-colors"
                >
                    {showMap ? <List className="mr-2 h-4 w-4" /> : <MapIcon className="mr-2 h-4 w-4" />}
                    {showMap ? 'Ver Lista' : 'Ver Mapa'}
                </Button>
            </div>

            <div className="flex gap-8">
                {/* Desktop Sidebar Filters */}
                <div className="hidden md:block w-64 shrink-0">
                    <div className="sticky top-24 p-6 rounded-3xl border bg-card/50 backdrop-blur-sm shadow-sm">
                        <h3 className="font-bold text-lg mb-4">Filtros</h3>
                        <SearchFilters />
                    </div>
                </div>

                {/* Results Area */}
                <div className="flex-1 min-w-0">
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <PropertyCardSkeleton key={i} />
                            ))}
                        </div>
                    ) : properties.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-muted/30 rounded-3xl border border-dashed border-muted-foreground/25">
                            <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center">
                                <Search className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-slate-900">No encontramos propiedades</h2>
                                <p className="text-muted-foreground max-w-sm mx-auto mt-1">
                                    Intenta ajustar los filtros o buscar en otra ubicación.
                                </p>
                            </div>
                            <Button variant="link" className="text-primary font-semibold" onClick={() => window.location.href = '/search'}>
                                Limpiar filtros
                            </Button>
                        </div>
                    ) : (
                        <div className="flex-1 min-h-0 relative">
                            {showMap ? (
                                <div className="h-[600px] w-full rounded-3xl overflow-hidden border shadow-xl">
                                    <PropertyMap properties={properties} />
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pb-10">
                                    {properties.map((property) => (
                                        <PropertyCard key={property.id} property={property} />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default function SearchPage() {
    return (
        <Suspense fallback={<div className="container py-8">Cargando buscador...</div>}>
            <SearchContent />
        </Suspense>
    )
}
