import Link from 'next/link'
import { Facebook, Instagram, Twitter } from 'lucide-react'

export function Footer() {
    return (
        <footer className="bg-slate-50 border-t border-slate-200 pt-12 pb-8 mt-auto">
            <div className="container px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    <div className="col-span-1 md:col-span-1">
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <span className="font-bold text-xl text-primary">Vacas en la Costa</span>
                        </Link>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            La plataforma líder para encontrar tu alojamiento temporal ideal en la costa argentina. Seguro, rápido y directo.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">Plataforma</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/search" className="hover:text-primary transition-colors">Buscar Propiedades</Link></li>
                            <li><Link href="/publish" className="hover:text-primary transition-colors">Publicar Propiedad</Link></li>
                            <li><Link href="/login" className="hover:text-primary transition-colors">Ingresar / Registrarse</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">Legal</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/terms" className="hover:text-primary transition-colors">Términos y Condiciones</Link></li>
                            <li><Link href="/privacy" className="hover:text-primary transition-colors">Política de Privacidad</Link></li>
                            <li><Link href="/help" className="hover:text-primary transition-colors">Ayuda y Soporte</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">Síguenos</h3>
                        <div className="flex gap-4">
                            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                <Instagram className="h-5 w-5" />
                            </a>
                            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                <Facebook className="h-5 w-5" />
                            </a>
                            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                <Twitter className="h-5 w-5" />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
                    <p>© {new Date().getFullYear()} Vacas en la Costa. Todos los derechos reservados.</p>
                    <p>Hecho con ❤️ en Argentina</p>
                </div>
            </div>
        </footer>
    )
}
