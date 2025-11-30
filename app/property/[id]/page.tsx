import { getPropertyById } from '@/actions/get-properties'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MapPin, Check, MessageCircle, ShieldCheck, Mail } from 'lucide-react'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { PropertyActions } from '@/components/property-actions'
import PropertyMapWrapper from '@/components/property-map-wrapper'
import Link from 'next/link'
import { parseLocation } from '@/utils/location'

export async function generateMetadata({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const property = await getPropertyById(id)

    if (!property) {
        return {
            title: 'Propiedad no encontrada',
        }
    }

    return {
        title: `${property.title} | Vacas en la Costa`,
        description: `Mira esta propiedad en ${property.address}. ${property.operation_type === 'rent' ? 'Alquiler' : 'Venta'} por ${property.currency} ${property.price}.`,
        openGraph: {
            title: property.title,
            description: `Mira esta propiedad en ${property.address}. ${property.operation_type === 'rent' ? 'Alquiler' : 'Venta'} por ${property.currency} ${property.price}.`,
            images: property.property_images?.[0]?.url ? [{ url: property.property_images[0].url }] : [],
        },
    }
}

export default async function PropertyDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const property = await getPropertyById(id)

    if (!property) {
        notFound()
    }

    // Determinar contacto (personalizado de la publicación o del perfil)
    const contactWhatsapp = property.contact_whatsapp || property.users?.whatsapp
    const contactEmail = property.contact_email || property.users?.email

    // Plantilla mejorada de WhatsApp
    const whatsappMessage = `Hola! Vi tu propiedad "${property.title}" en Vacas en la Costa y me interesa.

📍 Ubicación: ${property.address}
💰 Precio: ${property.currency} ${property.price.toLocaleString()}

¿Está disponible?`

    const whatsappLink = contactWhatsapp
        ? `https://wa.me/549${contactWhatsapp}?text=${encodeURIComponent(whatsappMessage)}`
        : null

    // Link de email con plantilla
    const emailSubject = `Consulta sobre: ${property.title}`
    const emailBody = `Hola,

Vi tu propiedad "${property.title}" en Vacas en la Costa y me interesa.

Ubicación: ${property.address}
Precio: ${property.currency} ${property.price.toLocaleString()}

¿Está disponible?

Saludos,`

    const emailLink = contactEmail
        ? `mailto:${contactEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`
        : null

    // Parsear ubicación para el mapa
    const locationCoords = parseLocation(property.location)

    return (
        <div className="container pt-20 pb-10 animate-in fade-in duration-500 max-w-6xl">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between gap-6 mb-6">
                <div className="space-y-2">
                    <Badge variant="secondary" className="mb-2 backdrop-blur-md bg-primary/10 text-primary border-primary/20">
                        {property.operation_type === 'rent' ? 'Alquiler' :
                            property.operation_type === 'sale' ? 'Venta' : 'Temporal'}
                    </Badge>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">{property.title}</h1>
                    <div className="flex items-center text-muted-foreground text-base">
                        <MapPin className="h-4 w-4 mr-2 text-primary" />
                        <span>{property.address}</span>
                        {property.rooms && (
                            <>
                                <span className="mx-2">•</span>
                                <span>{property.rooms} amb</span>
                            </>
                        )}
                        {property.bathrooms && (
                            <>
                                <span className="mx-2">•</span>
                                <span>{property.bathrooms} baños</span>
                            </>
                        )}
                    </div>
                </div>
                <div className="flex flex-col items-end justify-center">
                    <div className="text-3xl md:text-4xl font-bold text-primary tracking-tight">
                        {new Intl.NumberFormat('es-AR', {
                            style: 'currency',
                            currency: property.currency,
                            maximumFractionDigits: 0,
                        }).format(property.price)}
                    </div>
                    <p className="text-muted-foreground text-xs mt-1">Precio final, sin comisiones extra</p>
                </div>
            </div>

            {/* Gallery Grid (Premium Layout) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-10 h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-xl">
                <div className="md:col-span-2 md:row-span-2 relative bg-muted group cursor-pointer">
                    {property.property_images[0] && (
                        <Image
                            src={property.property_images[0].url}
                            alt={property.title}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                            priority
                        />
                    )}
                </div>
                <div className="hidden md:block relative bg-muted group cursor-pointer">
                    {property.property_images[1] && (
                        <Image
                            src={property.property_images[1].url}
                            alt={property.title}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                    )}
                </div>
                <div className="hidden md:block relative bg-muted group cursor-pointer">
                    {property.property_images[2] && (
                        <Image
                            src={property.property_images[2].url}
                            alt={property.title}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                    )}
                </div>
                <div className="hidden md:block relative bg-muted group cursor-pointer">
                    {property.property_images[3] && (
                        <Image
                            src={property.property_images[3].url}
                            alt={property.title}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                    )}
                </div>
                <div className="hidden md:block relative bg-muted group cursor-pointer">
                    {property.property_images[4] && (
                        <Image
                            src={property.property_images[4].url}
                            alt={property.title}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                    )}
                    {property.property_images.length > 5 && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-2xl backdrop-blur-sm transition-opacity hover:bg-black/50">
                            +{property.property_images.length - 5} fotos
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                {/* Main Content */}
                <div className="md:col-span-2 space-y-10">
                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-slate-900">Sobre esta propiedad</h2>
                        <p className="text-slate-600 whitespace-pre-line leading-relaxed text-lg">
                            {property.description}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-6 text-slate-900">Lo que ofrece este lugar</h2>
                        <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                            {/* Mock features rendering */}
                            {Object.entries((property.features as Record<string, boolean>) || {}).map(([key, value]) => (
                                value && (
                                    <div key={key} className="flex items-center gap-3 text-slate-700 p-3 rounded-xl bg-slate-50 border border-slate-100">
                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                            <Check className="h-4 w-4" />
                                        </div>
                                        <span className="capitalize font-medium">{key}</span>
                                    </div>
                                )
                            ))}
                            {!property.features && (
                                <>
                                    <div className="flex items-center gap-3 text-slate-700 p-3 rounded-xl bg-slate-50 border border-slate-100">
                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                            <Check className="h-4 w-4" />
                                        </div>
                                        <span className="font-medium">Wifi de alta velocidad</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-700 p-3 rounded-xl bg-slate-50 border border-slate-100">
                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                            <Check className="h-4 w-4" />
                                        </div>
                                        <span className="font-medium">Cocina equipada</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-6 text-slate-900">Ubicación</h2>
                        <div className="h-[400px] w-full rounded-3xl overflow-hidden shadow-lg border border-slate-100">
                            <PropertyMapWrapper
                                properties={[property]}
                                zoom={15}
                                center={locationCoords ? [locationCoords.lat, locationCoords.lng] : [-38.0055, -57.5426]}
                            />
                        </div>
                    </section>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="sticky top-24">
                        <Card className="border-0 shadow-xl rounded-3xl overflow-hidden">
                            <CardContent className="p-8">
                                <Link href={`/u/${property.owner_id}`} className="flex items-center gap-4 mb-8 group">
                                    <Avatar className="h-16 w-16 border-2 border-primary/20 group-hover:border-primary transition-colors">
                                        <AvatarImage src={property.users?.avatar_url} />
                                        <AvatarFallback className="bg-primary/5 text-primary text-xl font-bold">
                                            {property.users?.full_name?.charAt(0) || 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-bold text-lg text-slate-900 group-hover:text-primary transition-colors">{property.users?.full_name || 'Anfitrión'}</p>
                                        <div className="flex items-center gap-1 text-sm font-medium">
                                            <ShieldCheck className="h-4 w-4" />
                                            {property.users?.is_identity_verified ? (
                                                <span className="text-emerald-600">🛡️ Identidad Verificada</span>
                                            ) : property.users?.is_verified ? (
                                                <span className="text-blue-600">✓ Cuenta Verificada</span>
                                            ) : (
                                                <span className="text-gray-500">Nuevo Usuario</span>
                                            )}
                                        </div>
                                    </div>
                                </Link>

                                <div className="grid gap-3">
                                    {whatsappLink && (
                                        <Button className="w-full h-14 text-lg bg-[#25D366] hover:bg-[#128C7E] shadow-lg shadow-green-500/20 rounded-xl transition-all hover:scale-105" asChild>
                                            <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                                                <MessageCircle className="mr-2 h-6 w-6" />
                                                Contactar por WhatsApp
                                            </a>
                                        </Button>
                                    )}
                                    {emailLink && (
                                        <Button variant="outline" className="w-full h-14 text-lg rounded-xl" asChild>
                                            <a href={emailLink}>
                                                <Mail className="mr-2 h-6 w-6" />
                                                Enviar Email
                                            </a>
                                        </Button>
                                    )}
                                    {!whatsappLink && !emailLink && (
                                        <Button className="w-full h-14 text-lg rounded-xl" disabled>
                                            Sin contacto disponible
                                        </Button>
                                    )}
                                    <PropertyActions propertyId={property.id} propertyTitle={property.title} />
                                </div>

                                <div className="mt-6 pt-6 border-t border-slate-100 text-center">
                                    <p className="text-xs text-muted-foreground">
                                        ArgProp protege tus datos. Nunca compartas información bancaria por fuera de la plataforma.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
