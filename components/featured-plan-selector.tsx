'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, Loader2, Sparkles } from 'lucide-react'
import { createPreference, PlanId } from '@/actions/mercadopago'
import { toast } from 'sonner'

interface FeaturedPlanSelectorProps {
    propertyId: string
}

const PLANS: { id: PlanId; title: string; price: number; days: number; popular?: boolean }[] = [
    {
        id: 'basic_7',
        title: 'Semanal',
        price: 5000,
        days: 7
    },
    {
        id: 'standard_15',
        title: 'Quincenal',
        price: 9000,
        days: 15,
        popular: true
    },
    {
        id: 'premium_30',
        title: 'Mensual',
        price: 15000,
        days: 30
    }
]

export function FeaturedPlanSelector({ propertyId }: FeaturedPlanSelectorProps) {
    const [loading, setLoading] = useState<PlanId | null>(null)

    const handleSelectPlan = async (planId: PlanId) => {
        try {
            setLoading(planId)
            const { url } = await createPreference(propertyId, planId)

            // Redirect to MercadoPago
            window.location.href = url
        } catch (error) {
            console.error(error)
            toast.error('Error al iniciar el pago. Intenta nuevamente.')
            setLoading(null)
        }
    }

    return (
        <div className="grid md:grid-cols-3 gap-6">
            {PLANS.map((plan) => (
                <Card key={plan.id} className={`relative flex flex-col ${plan.popular ? 'border-primary shadow-lg scale-105 z-10' : 'border-border'}`}>
                    {plan.popular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            MÁS ELEGIDO
                        </div>
                    )}
                    <CardHeader>
                        <CardTitle className="text-xl">{plan.title}</CardTitle>
                        <CardDescription>Destaca por {plan.days} días</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <div className="text-3xl font-bold mb-4">
                            ${plan.price.toLocaleString('es-AR')}
                        </div>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li className="flex items-center gap-2">
                                <Check className="w-4 h-4 text-green-500" />
                                Posición prioritaria
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="w-4 h-4 text-green-500" />
                                Borde destacado
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="w-4 h-4 text-green-500" />
                                Mayor visibilidad
                            </li>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button
                            className="w-full"
                            variant={plan.popular ? 'default' : 'outline'}
                            onClick={() => handleSelectPlan(plan.id)}
                            disabled={!!loading}
                        >
                            {loading === plan.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                'Elegir Plan'
                            )}
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    )
}
