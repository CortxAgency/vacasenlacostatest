import { MetadataRoute } from 'next'
import { createClient } from '@/utils/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://argprop.com'
    const supabase = await createClient()

    // Static routes
    const routes = [
        '',
        '/search',
        '/login',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1,
    }))

    // Dynamic routes (Properties)
    const { data: properties } = await supabase
        .from('properties')
        .select('id, updated_at')
        .eq('status', 'active')
        .order('updated_at', { ascending: false })
        .limit(5000)

    const propertyRoutes = (properties || []).map((property) => ({
        url: `${baseUrl}/property/${property.id}`,
        lastModified: new Date(property.updated_at),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }))

    return [...routes, ...propertyRoutes]
}
