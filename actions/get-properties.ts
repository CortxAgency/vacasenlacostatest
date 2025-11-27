'use server'

import { createClient } from '@/utils/supabase/server'

export async function getProperties(filters?: {
  operation_type?: string
  minPrice?: number
  maxPrice?: number
  rooms?: number
}) {
  const supabase = await createClient()

  let query = supabase
    .from('properties')
    .select(`
      *,
      property_images (
        url
      )
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (filters?.operation_type) {
    query = query.eq('operation_type', filters.operation_type)
  }

  if (filters?.minPrice) {
    query = query.gte('price', filters.minPrice)
  }

  if (filters?.maxPrice) {
    query = query.lte('price', filters.maxPrice)
  }

  if (filters?.rooms) {
    query = query.gte('rooms', filters.rooms)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching properties:', error)
    return []
  }

  return data
}

export async function getPropertyById(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('properties')
    .select(`
      *,
      property_images (
        url,
        order
      ),
      users (
        full_name,
        email,
        avatar_url,
        whatsapp,
        is_verified
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching property:', error)
    return null
  }

  return data
}
