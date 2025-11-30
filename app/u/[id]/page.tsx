import { getPublicProfile } from '@/actions/get-public-profile'
import { getReviewsByUserId, getUserStats } from '@/actions/reviews'
import { PropertyCard } from '@/components/property-card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Calendar, Star, ShieldCheck } from 'lucide-react'
import { notFound } from 'next/navigation'
import { ReviewList } from '@/components/review-list'
import { ReviewForm } from '@/components/review-form'
import { createClient } from '@/utils/supabase/server'
import { StarRating } from '@/components/star-rating'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const profile = await getPublicProfile(id)
    if (!profile) return { title: 'Usuario no encontrado' }

    return {
        title: `Propiedades de ${profile.user.full_name || 'Usuario'} | Vacas en la Costa`,
        description: `Mira las propiedades publicadas por ${profile.user.full_name} en Vacas en la Costa.`,
    }
}

export default async function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const data = await getPublicProfile(id)

    if (!data) {
        notFound()
    }

    const { user, properties } = data

    // Obtener reseñas y estadísticas
    const reviews = await getReviewsByUserId(id)
    const stats = await getUserStats(id)

    // Verificar usuario actual para mostrar/ocultar formulario
    const supabase = await createClient()
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    const isOwnProfile = currentUser?.id === id

    return (
        <div className="container pt-24 pb-10">
            {/* Profile Header */}
            <div className="bg-card border rounded-3xl p-8 mb-10 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
                <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                    <AvatarImage src={user.avatar_url || ''} />
                    <AvatarFallback className="text-4xl">{user.full_name?.[0] || 'U'}</AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-center md:justify-start gap-2">
                        <h1 className="text-3xl font-bold">{user.full_name || 'Usuario'}</h1>
                        {user.is_identity_verified ? (
                            <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-sm font-medium border border-emerald-100">
                                <ShieldCheck className="h-4 w-4" />
                                <span>Identidad Verificada</span>
                            </div>
                        ) : user.is_verified && (
                            <CheckCircle2 className="h-6 w-6 text-blue-500 fill-blue-50" />
                        )}
                    </div>

                    <div className="flex flex-wrap justify-center md:justify-start gap-3 text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>Miembro desde {new Date(user.created_at || new Date()).getFullYear()}</span>
                        </div>
                        {user.role === 'agent' && (
                            <Badge variant="secondary">Agente Inmobiliario</Badge>
                        )}
                    </div>

                    {/* Rating Summary */}
                    <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                        <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-100">
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            <span className="font-bold text-yellow-700">{stats.average}</span>
                            <span className="text-yellow-600/80 text-sm">({stats.total} reseñas)</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-2 min-w-[200px]">
                    <div className="bg-muted/50 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-primary">{properties.length}</div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Propiedades Activas</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Left Column: Properties */}
                <div className="lg:col-span-2 space-y-8">
                    <h2 className="text-2xl font-bold">Publicaciones</h2>
                    {properties.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {properties.map((property) => (
                                <PropertyCard key={property.id} property={property} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 text-muted-foreground bg-slate-50 rounded-3xl border border-dashed">
                            Este usuario no tiene propiedades activas en este momento.
                        </div>
                    )}
                </div>

                {/* Right Column: Reviews */}
                <div className="space-y-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold">Reseñas</h2>
                        <div className="text-sm text-muted-foreground">
                            {stats.total} opiniones
                        </div>
                    </div>

                    {!isOwnProfile && currentUser && (
                        <ReviewForm reviewedId={id} />
                    )}

                    <ReviewList reviews={reviews} />
                </div>
            </div>
        </div>
    )
}
