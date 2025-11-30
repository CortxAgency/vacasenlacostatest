import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, Search } from 'lucide-react'

export default function NotFound() {
    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
            <h1 className="text-9xl font-black text-slate-200">404</h1>
            <div className="space-y-6 -mt-12 relative z-10">
                <h2 className="text-3xl font-bold tracking-tight">Página no encontrada</h2>
                <p className="text-muted-foreground max-w-md mx-auto text-lg">
                    Lo sentimos, no pudimos encontrar la página que estás buscando. Puede que haya sido eliminada o la dirección sea incorrecta.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                    <Button asChild size="lg">
                        <Link href="/">
                            <Home className="mr-2 h-4 w-4" />
                            Volver al Inicio
                        </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg">
                        <Link href="/search">
                            <Search className="mr-2 h-4 w-4" />
                            Buscar Propiedades
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}
