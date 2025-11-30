'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, BedDouble, Bath, Ruler, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { Property } from '@/types/types'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { LikeButton } from './like-button'

interface PropertyCardProps {
    property: Property
    priority?: boolean
    index?: number
}

export function PropertyCard({ property, index = 0 }: PropertyCardProps) {
    const [isHovered, setIsHovered] = useState(false)
    const [isNew, setIsNew] = useState(false)

    useEffect(() => {
        if (property.created_at) {
            // eslint-disable-next-line
            setIsNew(new Date(property.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
        }
    }, [property.created_at])

    const formatPrice = (price: number, currency: string) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: currency,
            maximumFractionDigits: 0,
        }).format(price)
    }
    const hasSecondImage = property.property_images?.length > 1
    const displayImage = isHovered && hasSecondImage ? property.property_images[1].url : (property.property_images?.[0]?.url || '/placeholder.jpg')

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -8 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Link href={`/property/${property.id}`}>
                <Card className={cn(
                    "group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-card rounded-[1.5rem] h-full flex flex-col relative",
                    property.is_featured && "border-2 border-yellow-400 shadow-yellow-500/20 ring-2 ring-yellow-400/20"
                )}>
                    {/* Image Container */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10 opacity-60 group-hover:opacity-50 transition-opacity duration-500" />

                        <motion.img
                            key={displayImage}
                            initial={{ scale: 1.1, opacity: 0.8 }}
                            animate={{ scale: isHovered ? 1.05 : 1, opacity: 1 }}
                            transition={{ duration: 0.5 }}
                            src={displayImage}
                            alt={property.title}
                            className="object-cover w-full h-full"
                        />

                        {/* Badges */}
                        <div className="absolute top-3 left-3 z-20 flex flex-wrap gap-2">
                            {property.is_featured && (
                                <Badge className="bg-yellow-400 text-yellow-950 hover:bg-yellow-500 border-0 shadow-lg font-bold">
                                    <Sparkles className="w-3 h-3 mr-1 fill-current" /> Destacado
                                </Badge>
                            )}

                            <Badge className={cn(
                                "font-bold shadow-lg backdrop-blur-md border-0 px-3 py-1",
                                property.operation_type === 'sale' ? "bg-blue-600/90 hover:bg-blue-600" :
                                    property.operation_type === 'rent' ? "bg-emerald-600/90 hover:bg-emerald-600" :
                                        "bg-purple-600/90 hover:bg-purple-600"
                            )}>
                                {property.operation_type === 'sale' ? 'Venta' :
                                    property.operation_type === 'rent' ? 'Alquiler' : 'Temporal'}
                            </Badge>

                            {isNew && !property.is_featured && (
                                <Badge className="bg-amber-500/90 hover:bg-amber-500 text-white border-0 shadow-lg backdrop-blur-md animate-pulse">
                                    <Sparkles className="w-3 h-3 mr-1" /> Nuevo
                                </Badge>
                            )}

                            {property.users?.is_verified && (
                                <Badge variant="secondary" className="bg-white/90 text-black backdrop-blur-md border-0 shadow-sm">
                                    Verificado
                                </Badge>
                            )}
                        </div>

                        {/* Like Button */}
                        <div className="absolute top-3 right-3 z-30">
                            <LikeButton propertyId={property.id} />
                        </div>

                        {/* Price Overlay */}
                        <div className="absolute bottom-4 left-4 z-20 text-white">
                            <p className="text-xs font-medium text-white/80 mb-0.5 uppercase tracking-wider">Precio</p>
                            <p className="text-2xl font-bold tracking-tight drop-shadow-lg">
                                {formatPrice(property.price, property.currency)}
                            </p>
                        </div>
                    </div>

                    {/* Content */}
                    <CardContent className="p-5 flex-1 flex flex-col gap-3 relative">
                        <div className="flex items-start justify-between gap-2">
                            <h3 className="font-bold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-300">
                                {property.title}
                            </h3>
                        </div>

                        <div className="flex items-center text-muted-foreground text-sm">
                            <MapPin className="h-4 w-4 mr-1 shrink-0 text-primary/70" />
                            <span className="truncate">{property.address}</span>
                        </div>

                        {/* Features Grid */}
                        <div className="grid grid-cols-3 gap-2 mt-auto pt-4 border-t border-border/50">
                            <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-muted/30 group-hover:bg-primary/5 transition-colors duration-300">
                                <BedDouble className="h-5 w-5 mb-1 text-muted-foreground group-hover:text-primary group-hover:scale-110 transition-all duration-300" />
                                <span className="text-xs font-medium text-muted-foreground">{property.rooms || 1} Amb</span>
                            </div>
                            <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-muted/30 group-hover:bg-primary/5 transition-colors duration-300">
                                <Bath className="h-5 w-5 mb-1 text-muted-foreground group-hover:text-primary group-hover:scale-110 transition-all duration-300" />
                                <span className="text-xs font-medium text-muted-foreground">{property.bathrooms || 1} Baños</span>
                            </div>
                            {property.features?.area && (
                                <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-muted/30 group-hover:bg-primary/5 transition-colors duration-300">
                                    <Ruler className="h-5 w-5 mb-1 text-muted-foreground group-hover:text-primary group-hover:scale-110 transition-all duration-300" />
                                    <span className="text-xs font-medium text-muted-foreground">{property.features.area} m²</span>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </Link>
        </motion.div>
    )
}
