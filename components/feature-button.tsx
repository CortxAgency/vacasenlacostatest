'use client'

import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'
import Link from 'next/link'

export function FeatureButton({ propertyId, isFeatured }: { propertyId: string, isFeatured: boolean }) {
    if (isFeatured) {
        return (
            <div className="flex items-center gap-1 text-amber-500 font-medium text-sm bg-amber-50 px-3 py-1 rounded-full border border-amber-200" title="Tu propiedad está destacada">
                <Sparkles className="h-3 w-3 fill-current" />
                Destacado
            </div>
        )
    }

    return (
        <Link href={`/dashboard/promote/${propertyId}`}>
            <Button
                variant="outline"
                size="sm"
                className="border-amber-200 text-amber-600 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300 transition-colors"
            >
                <Sparkles className="h-3 w-3 mr-1" />
                Destacar
            </Button>
        </Link>
    )
}
