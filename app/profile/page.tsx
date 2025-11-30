'use client'

import { useState, useEffect, useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Loader2, ShieldCheck, User as UserIcon, Phone, Sparkles } from 'lucide-react'
import { getProfile, updateProfile } from '@/actions/profile'
import { useFormStatus } from 'react-dom'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { User } from '@/types/types'

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <Button type="submit" className="w-full" disabled={pending}>
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Guardar Cambios'}
        </Button>
    )
}

const initialState = {
    message: '',
    type: '' as 'success' | 'error' | ''
}

export default function ProfilePage() {
    const [profile, setProfile] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [state, formAction] = useActionState(updateProfile, initialState)

    useEffect(() => {
        getProfile().then(data => {
            setProfile(data)
            setLoading(false)
        })
    }, [])

    useEffect(() => {
        if (state.type === 'success') {
            toast.success(state.message)
        } else if (state.type === 'error') {
            toast.error(state.message)
        }
    }, [state])

    if (loading) {
        return (
            <div className="container pt-24 pb-10 flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    // Calculate completion percentage
    const hasName = !!profile?.full_name
    const hasWhatsapp = !!profile?.whatsapp
    const hasAvatar = !!profile?.avatar_url
    const completionPercentage = [hasName, hasWhatsapp, hasAvatar].filter(Boolean).length / 3 * 100

    return (
        <div className="container max-w-4xl pt-24 pb-10 min-h-[calc(100vh-4rem)]">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid gap-8 md:grid-cols-[1fr_2fr]"
            >
                {/* Left Column: Status & Gamification */}
                <div className="space-y-6">
                    <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white to-slate-50">
                        <CardHeader className="text-center pb-2">
                            <div className="mx-auto mb-4 relative">
                                <Avatar className="h-24 w-24 border-4 border-white shadow-xl">
                                    <AvatarImage src={profile?.avatar_url} />
                                    <AvatarFallback className="text-2xl">{profile?.email?.charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                {profile?.is_verified && (
                                    <div className="absolute bottom-0 right-0 bg-blue-500 text-white p-1.5 rounded-full border-2 border-white shadow-sm" title="Usuario Verificado">
                                        <ShieldCheck className="h-4 w-4" />
                                    </div>
                                )}
                            </div>
                            <CardTitle>{profile?.full_name || 'Usuario'}</CardTitle>
                            <CardDescription>{profile?.email}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm font-medium">
                                    <span>Nivel de Perfil</span>
                                    <span className="text-primary">{Math.round(completionPercentage)}%</span>
                                </div>
                                <Progress value={completionPercentage} className="h-2" />
                                <p className="text-xs text-muted-foreground text-center">
                                    {completionPercentage < 100
                                        ? "Completa tu perfil para generar más confianza."
                                        : "¡Excelente! Tu perfil inspira confianza."}
                                </p>
                            </div>

                            {!profile?.is_verified && (
                                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-800">
                                    <div className="flex items-start gap-3">
                                        <Sparkles className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-semibold mb-1">Conviértete en Verificado</p>
                                            <p className="opacity-90 leading-relaxed">
                                                Los usuarios verificados reciben hasta un <span className="font-bold">3x más de consultas</span>.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Edit Form */}
                <Card className="border-0 shadow-md">
                    <CardHeader>
                        <CardTitle>Editar Información</CardTitle>
                        <CardDescription>
                            Tus datos de contacto serán visibles para los interesados.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form action={formAction} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="full_name" className="flex items-center gap-2">
                                    <UserIcon className="h-4 w-4 text-muted-foreground" />
                                    Nombre Completo
                                </Label>
                                <Input
                                    id="full_name"
                                    name="full_name"
                                    defaultValue={profile?.full_name || ''}
                                    placeholder="Ej: Juan Pérez"
                                    className="h-11"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="whatsapp" className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    WhatsApp
                                </Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
                                        +54 9
                                    </span>
                                    <Input
                                        id="whatsapp"
                                        name="whatsapp"
                                        defaultValue={profile?.whatsapp || ''}
                                        placeholder="11 1234 5678"
                                        className="pl-16 h-11"
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Sin 0 ni 15. Clave para que te contacten rápido.
                                </p>
                            </div>

                            <div className="pt-4">
                                <SubmitButton />
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}
