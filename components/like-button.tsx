'use client'

import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
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
    const controls = useAnimation()

    // Optimistic UI update immediately
    const handleLike = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        if (isLoading) return

        const previousState = isLiked
        const newState = !previousState
        setIsLiked(newState) // Immediate feedback
        setIsLoading(true)

        if (newState) {
            controls.start({
                scale: [1, 1.5, 1],
                transition: { duration: 0.4, type: "spring" }
            })
        }

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
                    icon: <Heart className="fill-red-500 text-red-500 h-4 w-4" />
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
                "relative p-3 rounded-full transition-all duration-300 group z-30",
                isLiked
                    ? "bg-red-50 text-red-500 hover:bg-red-100 shadow-md ring-2 ring-red-100"
                    : "bg-black/20 backdrop-blur-md text-white hover:bg-black/40 hover:scale-110",
                className
            )}
        >
            <AnimatePresence>
                {isLiked && (
                    <>
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1.5, opacity: 0 }}
                            exit={{ scale: 0 }}
                            transition={{ duration: 0.5 }}
                            className="absolute inset-0 rounded-full bg-red-400 opacity-50"
                        />
                        {[...Array(6)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 1, x: 0, y: 0, scale: 0.5 }}
                                animate={{
                                    opacity: 0,
                                    x: (Math.random() - 0.5) * 40,
                                    y: (Math.random() - 0.5) * 40,
                                    scale: 0
                                }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                                className="absolute top-1/2 left-1/2 w-2 h-2 bg-red-500 rounded-full"
                                style={{
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)'
                                }}
                            />
                        ))}
                    </>
                )}
            </AnimatePresence>

            <motion.div animate={controls}>
                <Heart
                    className={cn(
                        "h-5 w-5 transition-all duration-300",
                        isLiked ? "fill-current" : "scale-100"
                    )}
                />
            </motion.div>
        </motion.button>
    )
}
