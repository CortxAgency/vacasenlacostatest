'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LogOut, User as UserIcon, LayoutDashboard, PlusCircle, Menu, Heart } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

export function Navbar() {
    const [user, setUser] = useState<User | null>(null)
    const [scrolled, setScrolled] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
        }
        getUser()

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
        })

        const handleScroll = () => {
            setScrolled(window.scrollY > 20)
        }
        window.addEventListener('scroll', handleScroll)

        return () => {
            subscription.unsubscribe()
            window.removeEventListener('scroll', handleScroll)
        }
    }, [])

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.refresh()
    }

    return (
        <nav className={cn(
            "fixed top-0 w-full z-50 transition-all duration-300 border-b",
            scrolled
                ? "bg-background/80 backdrop-blur-xl border-border/50 shadow-sm py-2"
                : "bg-transparent border-transparent py-4"
        )}>
            <div className="container flex items-center justify-between px-4">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform">
                        A
                    </div>
                    <span className={cn(
                        "text-xl font-bold tracking-tight transition-colors",
                        scrolled ? "text-foreground" : "text-white"
                    )}>
                        Vacas en la Costa
                    </span>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-6">
                    <Link
                        href="/search"
                        className={cn(
                            "text-sm font-medium transition-colors hover:text-primary",
                            scrolled ? "text-muted-foreground" : "text-white/80 hover:text-white"
                        )}
                    >
                        Explorar
                    </Link>

                    {user ? (
                        <div className="flex items-center gap-4">
                            <Link href="/publish">
                                <Button
                                    variant={scrolled ? "default" : "secondary"}
                                    className={cn(
                                        "rounded-full shadow-sm",
                                        !scrolled && "bg-white/10 text-white hover:bg-white/20 border-0"
                                    )}
                                >
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Publicar
                                </Button>
                            </Link>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Avatar className="cursor-pointer border-2 border-primary/20 hover:border-primary transition-colors">
                                        <AvatarImage src={user.user_metadata.avatar_url} />
                                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                            {user.email?.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56 rounded-xl p-2">
                                    <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                                        <Link href="/profile">
                                            <UserIcon className="mr-2 h-4 w-4" />
                                            Perfil
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                                        <Link href="/favorites">
                                            <Heart className="mr-2 h-4 w-4" />
                                            Favoritos
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleSignOut} className="text-red-600 rounded-lg cursor-pointer focus:text-red-600 focus:bg-red-50">
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Cerrar Sesión
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Link href="/login">
                                <Button variant="ghost" className={cn(
                                    scrolled ? "text-foreground" : "text-white hover:bg-white/10 hover:text-white"
                                )}>
                                    Ingresar
                                </Button>
                            </Link>
                            <Link href="/login?view=sign_up">
                                <Button className={cn(
                                    "rounded-full px-6",
                                    !scrolled && "bg-white text-slate-900 hover:bg-slate-100"
                                )}>
                                    Crear Cuenta
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Mobile Menu */}
                <div className="md:hidden">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className={cn(
                                scrolled ? "text-foreground" : "text-white hover:bg-white/10"
                            )}>
                                <Menu className="h-6 w-6" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent>
                            <div className="flex flex-col gap-4 mt-8">
                                <Link href="/search">
                                    <Button variant="ghost" className="w-full justify-start text-lg">
                                        Explorar Propiedades
                                    </Button>
                                </Link>
                                {user ? (
                                    <>
                                        <Link href="/dashboard">
                                            <Button variant="ghost" className="w-full justify-start text-lg">
                                                Dashboard
                                            </Button>
                                        </Link>
                                        <Link href="/publish">
                                            <Button className="w-full justify-start text-lg">
                                                Publicar Propiedad
                                            </Button>
                                        </Link>
                                        <Button variant="destructive" onClick={handleSignOut} className="w-full justify-start">
                                            Cerrar Sesión
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Link href="/login">
                                            <Button variant="outline" className="w-full justify-start text-lg">
                                                Ingresar
                                            </Button>
                                        </Link>
                                        <Link href="/login?view=sign_up">
                                            <Button className="w-full justify-start text-lg">
                                                Crear Cuenta
                                            </Button>
                                        </Link>
                                    </>
                                )}
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </nav>
    )
}
