import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardPropertyItem } from '@/components/dashboard-property-item'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { PlusCircle } from 'lucide-react'

import { PaymentStatusHandler } from '@/components/payment-status-handler'

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: properties } = await supabase
        .from('properties')
        .select(`
      *,
      property_images (
        url
      )
    `)
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })

    return (
        <div className="container pt-24 pb-8">
            <PaymentStatusHandler />
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Mis Publicaciones</h1>
                <Link href="/publish">
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Nueva Propiedad
                    </Button>
                </Link>
            </div>

            {properties && properties.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {properties.map((property) => (
                        <DashboardPropertyItem key={property.id} property={property} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 border-2 border-dashed rounded-xl">
                    <h2 className="text-xl font-semibold text-muted-foreground mb-2">No tenés propiedades publicadas</h2>
                    <p className="text-muted-foreground mb-6">Empezá a ganar dinero publicando tu primera propiedad.</p>
                    <Link href="/publish">
                        <Button>Publicar Ahora</Button>
                    </Link>
                </div>
            )}
        </div>
    )
}
