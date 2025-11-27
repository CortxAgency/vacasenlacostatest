import { createClient } from '@/utils/supabase/server'
import { notFound, redirect } from 'next/navigation'
import EditPropertyForm from './edit-form'

export default async function EditPropertyPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: property } = await supabase
        .from('properties')
        .select(`
      *,
      property_images (
        url,
        order
      )
    `)
        .eq('id', id)
        .single()

    if (!property) {
        notFound()
    }

    if (property.owner_id !== user.id) {
        redirect('/dashboard')
    }

    return (
        <div className="container max-w-2xl py-10">
            <EditPropertyForm property={property} />
        </div>
    )
}
