'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Heart, Share2, Check } from 'lucide-react'
import { toggleFavorite, getFavoriteStatus } from '@/actions/favorites'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface PropertyActionsProps {
    propertyId: string
    propertyTitle: string
}

export function PropertyActions({ propertyId, propertyTitle }: PropertyActionsProps) {
    const [isLiked, setIsLiked] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [hasCopied, setHasCopied] = useState(false)
    const router = useRouter()

    useEffect(() => {
        getFavoriteStatus(propertyId).then(setIsLiked)
    }, [propertyId])

    const handleLike = async () => {
        if (isLoading) return

        const previousState = isLiked
        setIsLiked(!previousState)
        setIsLoading(true)

        try {
            const result = await toggleFavorite(propertyId)

            if (result.error === 'Unauthorized') {
                setIsLiked(previousState)
                toast.error("Iniciá sesión para guardar", {
                    action: {
                        label: "Ingresar",
                        onClick: () => router.push('/login')
                    }
                })
                return
            }

            if (result.isFavorite) {
                toast.success("Guardado en favoritos")
            }
        } catch (error) {
            setIsLiked(previousState)
            toast.error("Error al guardar")
        } finally {
            setIsLoading(false)
        }
    }

    const handleShare = async () => {
        const url = window.location.href

        if (navigator.share) {
            try {
                await navigator.share({
                    title: propertyTitle,
                    text: `Mirá esta propiedad en ArgProp: ${propertyTitle}`,
                    url: url
                })
            } catch (err) {
                // User cancelled or error
            }
        } else {
            // Fallback to clipboard
            try {
                await navigator.clipboard.writeText(url)
                setHasCopied(true)
                toast.success("Link copiado al portapapeles")
                setTimeout(() => setHasCopied(false), 2000)
            } catch (err) {
                toast.error("No se pudo copiar el link")
            }
        }
    }

    return (
        <div className="grid grid-cols-2 gap-3">
            <Button
                variant="outline"
                onClick={handleLike}
                className={cn(
                    "h-12 rounded-xl border-slate-200 transition-colors",
                    isLiked
                        ? "bg-red-50 text-red-500 border-red-200 hover:bg-red-100"
                        : "hover:bg-slate-50 hover:text-red-500 hover:border-red-200"
                )}
            >
                <Heart className={cn("mr-2 h-4 w-4", isLiked && "fill-current")} />
                {isLiked ? "Guardado" : "Guardar"}
            </Button>

            <Button
                variant="outline"
                onClick={handleShare}
                className="h-12 rounded-xl border-slate-200 hover:bg-slate-50 transition-colors"
            >
                {hasCopied ? <Check className="mr-2 h-4 w-4" /> : <Share2 className="mr-2 h-4 w-4" />}
                {hasCopied ? "Copiado" : "Compartir"}
            </Button>
        </div>
    )
}
