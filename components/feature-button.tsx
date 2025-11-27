'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sparkles, Loader2 } from 'lucide-react'
import { createPreference } from '@/actions/mercadopago'
import { toast } from 'sonner'

export function FeatureButton({ propertyId, isFeatured }: { propertyId: string, isFeatured: boolean }) {
    const [loading, setLoading] = useState(false)

    const handleFeature = async () => {
        if (isFeatured) return;

        setLoading(true)
        try {
            const { url } = await createPreference(propertyId)
            if (url) {
                window.location.href = url
            }
        } catch (error) {
            console.error(error)
            toast.error('Error al iniciar el pago')
        } finally {
            setLoading(false)
        }
    }

    if (isFeatured) {
        return (
            <div className="flex items-center gap-1 text-amber-500 font-medium text-sm bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                <Sparkles className="h-3 w-3 fill-current" />
                Destacado
            </div>
        )
    }

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleFeature}
            disabled={loading}
            className="border-amber-200 text-amber-600 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300 transition-colors"
        >
            {loading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Sparkles className="h-3 w-3 mr-1" />}
            Destacar
        </Button>
    )
}
