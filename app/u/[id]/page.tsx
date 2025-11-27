import { getPublicProfile } from '@/actions/get-public-profile'
import { PropertyCard } from '@/components/property-card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle2, MapPin, Calendar } from 'lucide-react'
import { notFound } from 'next/navigation'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const profile = await getPublicProfile(id)
    if (!profile) return { title: 'Usuario no encontrado' }

    return {
        title: `Propiedades de ${profile.user.full_name || 'Usuario'} | ArgProp`,
        description: `Mira las propiedades publicadas por ${profile.user.full_name} en ArgProp.`,
    }
}

export default async function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const data = await getPublicProfile(id)

    if (!data) {
        notFound()
    }

    const { user, properties } = data

    return (
        <div className="container py-10">
            {/* Profile Header */}
            <div className="bg-card border rounded-3xl p-8 mb-10 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
                <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                    <AvatarImage src={user.avatar_url || ''} />
                    <AvatarFallback className="text-4xl">{user.full_name?.[0] || 'U'}</AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-center md:justify-start gap-2">
                        <h1 className="text-3xl font-bold">{user.full_name || 'Usuario de ArgProp'}</h1>
                        {user.is_verified && (
                            <CheckCircle2 className="h-6 w-6 text-blue-500 fill-blue-50" />
                        )}
                    </div>

                    <div className="flex flex-wrap justify-center md:justify-start gap-3 text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>Miembro desde {new Date(user.created_at).getFullYear()}</span>
                        </div>
                        {user.role === 'agent' && (
                            <Badge variant="secondary">Agente Inmobiliario</Badge>
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-2 min-w-[200px]">
                    <div className="bg-muted/50 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-primary">{properties.length}</div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Propiedades Activas</div>
                    </div>
                </div>
            </div>

            {/* Properties Grid */}
            <h2 className="text-2xl font-bold mb-6">Publicaciones</h2>
            {properties.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {properties.map((property) => (
                        <PropertyCard key={property.id} property={property} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 text-muted-foreground">
                    Este usuario no tiene propiedades activas en este momento.
                </div>
            )}
        </div>
    )
}
