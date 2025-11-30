'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
            <div className="bg-red-50 p-4 rounded-full mb-6">
                <AlertTriangle className="h-10 w-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2">¡Ups! Algo salió mal</h2>
            <p className="text-muted-foreground max-w-md mb-8">
                Ha ocurrido un error inesperado. Nuestro equipo ha sido notificado.
                Por favor, intenta recargar la página.
            </p>
            <div className="flex gap-4">
                <Button onClick={() => reset()}>
                    Intentar de nuevo
                </Button>
                <Button variant="outline" onClick={() => window.location.href = '/'}>
                    Volver al Inicio
                </Button>
            </div>
        </div>
    )
}
