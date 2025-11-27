'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/utils/supabase/client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

function LoginForm() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const [authMode, setAuthMode] = useState<'magic_link' | 'password'>('magic_link')
    const router = useRouter()
    const searchParams = useSearchParams()
    const view = searchParams.get('view')
    const isSignUp = view === 'sign_up'
    const supabase = createClient()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        try {
            if (authMode === 'magic_link') {
                const { error } = await supabase.auth.signInWithOtp({
                    email,
                    options: {
                        emailRedirectTo: `${location.origin}/auth/callback`,
                    },
                })
                if (error) throw error
                setMessage({
                    type: 'success',
                    text: '¡Enlace mágico enviado! Revisa tu correo electrónico.'
                })
            } else {
                // Password Mode
                if (isSignUp) {
                    const { error } = await supabase.auth.signUp({
                        email,
                        password,
                        options: {
                            emailRedirectTo: `${location.origin}/auth/callback`,
                        },
                    })
                    if (error) throw error
                    setMessage({
                        type: 'success',
                        text: '¡Cuenta creada! Revisa tu correo para confirmar.'
                    })
                } else {
                    const { error } = await supabase.auth.signInWithPassword({
                        email,
                        password,
                    })
                    if (error) throw error
                    router.push('/dashboard')
                    router.refresh()
                }
            }
        } catch (error: any) {
            setMessage({
                type: 'error',
                text: error.message || 'Ocurrió un error al intentar ingresar.'
            })
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleLogin = async () => {
        const redirectTo = searchParams.get('redirect_to') || '/dashboard'
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
            },
        })
    }

    return (
        <Card className="w-full max-w-md">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-center">
                    {isSignUp ? 'Crear Cuenta' : 'Iniciar Sesión'}
                </CardTitle>
                <CardDescription className="text-center">
                    {isSignUp
                        ? 'Regístrate para publicar y guardar propiedades'
                        : 'Ingresa a tu cuenta para gestionar tus propiedades'}
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                <div className="grid grid-cols-1 gap-2">
                    <Button variant="outline" onClick={handleGoogleLogin}>
                        <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                            <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                        </svg>
                        Continuar con Google
                    </Button>
                </div>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                            O continuar con email
                        </span>
                    </div>
                </div>

                <div className="flex gap-2 p-1 bg-muted rounded-lg">
                    <button
                        type="button"
                        onClick={() => setAuthMode('magic_link')}
                        className={`flex-1 text-sm font-medium py-1.5 rounded-md transition-all ${authMode === 'magic_link' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        Magic Link
                    </button>
                    <button
                        type="button"
                        onClick={() => setAuthMode('password')}
                        className={`flex-1 text-sm font-medium py-1.5 rounded-md transition-all ${authMode === 'password' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        Contraseña
                    </button>
                </div>

                <form onSubmit={handleLogin}>
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@ejemplo.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        {authMode === 'password' && (
                            <div className="grid gap-2">
                                <Label htmlFor="password">Contraseña</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        )}

                        <Button className="w-full" type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {authMode === 'magic_link'
                                ? 'Enviar Enlace Mágico'
                                : (isSignUp ? 'Registrarse' : 'Iniciar Sesión')}
                        </Button>
                    </div>
                </form>

                {message && (
                    <div className={`p-3 rounded-md text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                        {message.text}
                    </div>
                )}
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
                <div className="text-sm text-center">
                    {isSignUp ? (
                        <span>
                            ¿Ya tienes cuenta?{' '}
                            <button onClick={() => router.push('/login')} className="text-primary hover:underline font-medium">
                                Iniciar Sesión
                            </button>
                        </span>
                    ) : (
                        <span>
                            ¿No tienes cuenta?{' '}
                            <button onClick={() => router.push('/login?view=sign_up')} className="text-primary hover:underline font-medium">
                                Crear Cuenta
                            </button>
                        </span>
                    )}
                </div>
                <p className="text-xs text-center text-muted-foreground w-full">
                    Al continuar, aceptas nuestros Términos de Servicio y Política de Privacidad.
                </p>
            </CardFooter>
        </Card>
    )
}

export default function LoginPage() {
    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
            <Suspense fallback={<Loader2 className="h-8 w-8 animate-spin" />}>
                <LoginForm />
            </Suspense>
        </div>
    )
}
