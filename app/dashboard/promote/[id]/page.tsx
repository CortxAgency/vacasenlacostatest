import { createClient } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { FeaturedPlanSelector } from '@/components/featured-plan-selector'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Sparkles } from 'lucide-react'
import Link from 'next/link'

export default async function PromotePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: property } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single()

    if (!property) notFound()
    if (property.owner_id !== user.id) redirect('/dashboard')

    return (
        <div className="container max-w-4xl py-10">
            <Link href="/dashboard" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al Dashboard
            </Link>

            <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 text-yellow-600 mb-4">
                    <Sparkles className="w-8 h-8" />
                </div>
                <h1 className="text-3xl font-bold mb-2">Destacar Propiedad</h1>
                <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                    Aumenta tus consultas mostrando "{property.title}" en los primeros lugares de búsqueda.
                </p>
            </div>

            <FeaturedPlanSelector propertyId={property.id} />
        </div>
    )
}
