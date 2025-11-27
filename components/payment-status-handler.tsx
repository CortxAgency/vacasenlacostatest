'use client'

import { useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { featureProperty } from '@/actions/feature-property'

export function PaymentStatusHandler() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const processedRef = useRef(false)

    useEffect(() => {
        const status = searchParams.get('status')
        const propertyId = searchParams.get('property_id')

        if (processedRef.current) return

        if (status === 'success' && propertyId) {
            processedRef.current = true
            toast.promise(
                featureProperty(propertyId).then(() => {
                    // Clean URL
                    router.replace('/dashboard')
                }),
                {
                    loading: 'Confirmando pago...',
                    success: '¡Propiedad destacada con éxito! 🚀',
                    error: 'Hubo un error al activar el destacado.'
                }
            )
        } else if (status === 'failure') {
            processedRef.current = true
            toast.error('El pago no se pudo completar.')
            router.replace('/dashboard')
        }
    }, [searchParams, router])

    return null
}
