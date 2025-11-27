'use client'

import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { toggleFavorite, getFavoriteStatus } from '@/actions/favorites'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface LikeButtonProps {
    propertyId: string
    initialIsLiked?: boolean
    className?: string
}

export function LikeButton({ propertyId, initialIsLiked = false, className }: LikeButtonProps) {
    const [isLiked, setIsLiked] = useState(initialIsLiked)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    // Optimistic UI update immediately
    const handleLike = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        if (isLoading) return

        const previousState = isLiked
        setIsLiked(!previousState) // Immediate feedback
        setIsLoading(true)

        try {
            const result = await toggleFavorite(propertyId)

            if (result.error === 'Unauthorized') {
                setIsLiked(previousState) // Revert
                toast.error("Iniciá sesión para guardar tus favoritos", {
                    action: {
                        label: "Ingresar",
                        onClick: () => router.push('/login')
                    }
                })
                return
            }

            // Success feedback
            if (result.isFavorite) {
                toast.success("Guardado en tu colección", {
                    description: "Te avisaremos si baja de precio.",
                    duration: 2000,
                })
            }
        } catch (error) {
            setIsLiked(previousState) // Revert on error
            toast.error("Hubo un error al guardar")
        } finally {
            setIsLoading(false)
        }
    }

    // Check status on mount if not provided
    useEffect(() => {
        if (initialIsLiked === undefined) {
            getFavoriteStatus(propertyId).then(setIsLiked)
        }
    }, [propertyId, initialIsLiked])

    return (
        <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={handleLike}
            className={cn(
                "relative p-3 rounded-full transition-all duration-300 group",
                isLiked
                    ? "bg-red-50 text-red-500 hover:bg-red-100"
                    : "bg-black/20 backdrop-blur-md text-white hover:bg-black/40",
                className
            )}
        >
            <AnimatePresence>
                {isLiked && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1.5, opacity: 0 }}
                        exit={{ scale: 0 }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0 rounded-full bg-red-400 opacity-50"
                    />
                )}
            </AnimatePresence>

            <Heart
                className={cn(
                    "h-5 w-5 transition-all duration-300",
                    isLiked ? "fill-current scale-110" : "scale-100"
                )}
            />
        </motion.button>
    )
}
