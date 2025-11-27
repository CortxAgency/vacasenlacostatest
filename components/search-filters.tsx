'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

export function SearchFilters({ onClose }: { onClose?: () => void }) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '')
    const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '')
    const [rooms, setRooms] = useState(searchParams.get('rooms') || '')
    const [operation, setOperation] = useState(searchParams.get('op') || '')

    const handleSearch = () => {
        const params = new URLSearchParams(searchParams.toString())

        if (minPrice) params.set('minPrice', minPrice)
        else params.delete('minPrice')

        if (maxPrice) params.set('maxPrice', maxPrice)
        else params.delete('maxPrice')

        if (rooms) params.set('rooms', rooms)
        else params.delete('rooms')

        if (operation) params.set('op', operation)
        else params.delete('op')

        router.push(`/search?${params.toString()}`)
        if (onClose) onClose()
    }

    const clearFilters = () => {
        setMinPrice('')
        setMaxPrice('')
        setRooms('')
        setOperation('')
        router.push('/search')
        if (onClose) onClose()
    }

    return (
        <div className="space-y-6 p-1">
            <div className="flex items-center justify-between md:hidden">
                <h3 className="font-bold text-lg">Filtros</h3>
                <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="h-5 w-5" />
                </Button>
            </div>

            {/* Operation Type */}
            <div className="space-y-3">
                <Label>Tipo de Operación</Label>
                <div className="flex gap-2">
                    {['rent', 'sale', 'temporary'].map((op) => (
                        <Button
                            key={op}
                            variant={operation === op ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setOperation(operation === op ? '' : op)}
                            className="flex-1 capitalize rounded-xl"
                        >
                            {op === 'rent' ? 'Alquiler' : op === 'sale' ? 'Venta' : 'Temporal'}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Price Range */}
            <div className="space-y-3">
                <Label>Rango de Precio</Label>
                <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">$</span>
                        <Input
                            type="number"
                            placeholder="Mín"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                            className="pl-6 h-10 rounded-xl"
                        />
                    </div>
                    <span className="text-muted-foreground">-</span>
                    <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">$</span>
                        <Input
                            type="number"
                            placeholder="Máx"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                            className="pl-6 h-10 rounded-xl"
                        />
                    </div>
                </div>
            </div>

            {/* Rooms */}
            <div className="space-y-3">
                <Label>Ambientes</Label>
                <div className="flex gap-2">
                    {[1, 2, 3, 4].map((r) => (
                        <Button
                            key={r}
                            variant={rooms === r.toString() ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setRooms(rooms === r.toString() ? '' : r.toString())}
                            className="flex-1 rounded-xl"
                        >
                            {r === 4 ? '4+' : r}
                        </Button>
                    ))}
                </div>
            </div>

            <div className="pt-4 flex gap-3">
                <Button variant="outline" className="flex-1 rounded-xl" onClick={clearFilters}>
                    Limpiar
                </Button>
                <Button className="flex-1 rounded-xl" onClick={handleSearch}>
                    Aplicar
                </Button>
            </div>
        </div>
    )
}
