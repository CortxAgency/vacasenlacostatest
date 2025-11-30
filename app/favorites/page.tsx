import { getFavorites } from '@/actions/get-favorites'
import { PropertyCard } from '@/components/property-card'
import { Button } from '@/components/ui/button'
import { Heart, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export default async function FavoritesPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login?redirect_to=/favorites')
    }

    const favorites = await getFavorites()

    return (
        <div className="container pt-24 pb-10 min-h-[calc(100vh-4rem)]">
            <div className="flex items-center gap-4 mb-8">
                <Button variant="ghost" size="icon" asChild className="rounded-full">
                    <Link href="/dashboard">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        <Heart className="h-8 w-8 text-red-500 fill-red-500" />
                        Mis Favoritos
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Colección de propiedades que te interesan
                    </p>
                </div>
            </div>

            {favorites.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 bg-muted/30 rounded-3xl border border-dashed border-muted-foreground/25">
                    <div className="h-20 w-20 bg-red-50 rounded-full flex items-center justify-center">
                        <Heart className="h-10 w-10 text-red-400" />
                    </div>
                    <div className="max-w-md space-y-2">
                        <h2 className="text-2xl font-bold text-slate-900">Aún no tienes favoritos</h2>
                        <p className="text-slate-600">
                            Explora las propiedades y dale al corazón para guardarlas aquí y no perderlas de vista.
                        </p>
                    </div>
                    <Button size="lg" className="rounded-full px-8" asChild>
                        <Link href="/search">
                            Explorar Propiedades
                        </Link>
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {favorites.map((property, i) => (
                        <PropertyCard key={property.id} property={property} index={i} />
                    ))}
                </div>
            )}
        </div>
    )
}
