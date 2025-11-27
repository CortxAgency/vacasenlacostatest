'use client'

import Link from 'next/link'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, BedDouble, Bath, Ruler, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { LikeButton } from './like-button'

interface PropertyCardProps {
    property: any
    priority?: boolean
}

export function PropertyCard({ property, priority = false }: PropertyCardProps) {
    const [isLiked, setIsLiked] = useState(false)

    const formatPrice = (price: number, currency: string) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: currency,
            maximumFractionDigits: 0,
        }).format(price)
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
        >
            <Link href={`/property/${property.id}`}>
                <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-card rounded-2xl h-full flex flex-col">
                    {/* Image Container */}
                    <div className="relative aspect-[4/3] overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 opacity-60 group-hover:opacity-40 transition-opacity" />

                        <img
                            src={property.property_images?.[0]?.url || '/placeholder.jpg'}
                            alt={property.title}
                            className="object-cover w-full h-full transform group-hover:scale-110 transition-transform duration-700 ease-in-out"
                        />

                        {/* Badges */}
                        <div className="absolute top-3 left-3 z-20 flex gap-2">
                            <Badge className={cn(
                                "font-semibold shadow-sm backdrop-blur-md",
                                property.operation_type === 'sale' ? "bg-blue-600/90 hover:bg-blue-600" :
                                    property.operation_type === 'rent' ? "bg-emerald-600/90 hover:bg-emerald-600" :
                                        "bg-purple-600/90 hover:bg-purple-600"
                            )}>
                                {property.operation_type === 'sale' ? 'Venta' :
                                    property.operation_type === 'rent' ? 'Alquiler' : 'Temporal'}
                            </Badge>
                            {property.users?.is_verified && (
                                <Badge variant="secondary" className="bg-white/90 text-black backdrop-blur-md">
                                    Verificado
                                </Badge>
                            )}
                        </div>

                        {/* Like Button */}
                        <div className="absolute top-3 right-3 z-20">
                            <LikeButton propertyId={property.id} />
                        </div>

                        {/* Price Overlay */}
                        <div className="absolute bottom-3 left-3 z-20 text-white">
                            <p className="text-2xl font-bold tracking-tight drop-shadow-md">
                                {formatPrice(property.price, property.currency)}
                            </p>
                        </div>
                    </div>

                    {/* Content */}
                    <CardContent className="p-5 flex-1 flex flex-col gap-3">
                        <div className="flex items-start justify-between gap-2">
                            <h3 className="font-bold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                                {property.title}
                            </h3>
                        </div>

                        <div className="flex items-center text-muted-foreground text-sm">
                            <MapPin className="h-4 w-4 mr-1 shrink-0 text-primary/70" />
                            <span className="truncate">{property.address}</span>
                        </div>

                        {/* Features Grid */}
                        <div className="grid grid-cols-3 gap-2 mt-auto pt-4 border-t border-border/50">
                            <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-muted/50 group-hover:bg-primary/5 transition-colors">
                                <BedDouble className="h-4 w-4 mb-1 text-muted-foreground group-hover:text-primary" />
                                <span className="text-xs font-medium">3 Amb</span>
                            </div>
                            <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-muted/50 group-hover:bg-primary/5 transition-colors">
                                <Bath className="h-4 w-4 mb-1 text-muted-foreground group-hover:text-primary" />
                                <span className="text-xs font-medium">2 Baños</span>
                            </div>
                            <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-muted/50 group-hover:bg-primary/5 transition-colors">
                                <Ruler className="h-4 w-4 mb-1 text-muted-foreground group-hover:text-primary" />
                                <span className="text-xs font-medium">85 m²</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </Link>
        </motion.div>
    )
}
