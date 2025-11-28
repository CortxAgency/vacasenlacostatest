'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea' // Need to add this component
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Upload, X } from 'lucide-react'
import { getPresignedUrl } from '@/actions/upload'
import { createProperty } from '@/actions/property'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { toast } from 'sonner'

const formSchema = z.object({
    title: z.string().min(5, 'El título debe tener al menos 5 caracteres'),
    description: z.string().min(20, 'La descripción debe tener al menos 20 caracteres'),
    price: z.coerce.number().min(1, 'El precio debe ser mayor a 0'),
    currency: z.enum(['USD', 'ARS']),
    operation_type: z.enum(['rent', 'sale', 'temporary']),
    address: z.string().min(5, 'La dirección es requerida'),
    rooms: z.coerce.number().min(1, 'Mínimo 1 ambiente'),
    bathrooms: z.coerce.number().min(1, 'Mínimo 1 baño'),
    // features: z.record(z.boolean()), // Simplified for MVP
})

export default function PublishPage() {
    const [images, setImages] = useState<File[]>([])
    const [uploading, setUploading] = useState(false)
    const router = useRouter()

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: '',
            description: '',
            price: 0,
            currency: 'USD',
            operation_type: 'rent',
            address: '',
            rooms: 1,
            bathrooms: 1,
        },
    })

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setImages(prev => [...prev, ...Array.from(e.target.files!)])
        }
    }

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index))
    }

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            setUploading(true)
            const uploadedUrls: string[] = []

            // 1. Upload Images to R2
            for (const file of images) {
                const { signedUrl, key, error } = await getPresignedUrl(file.type, file.size)
                if (error || !signedUrl) {
                    console.error('Error getting presigned URL', error)
                    continue
                }

                await fetch(signedUrl, {
                    method: 'PUT',
                    body: file,
                    headers: { 'Content-Type': file.type },
                })

                // Construct public URL (Assuming public bucket access or worker)
                // For now, we store the key or a constructed URL if we have a custom domain
                // If R2 bucket is public read:
                // https://<account-id>.r2.cloudflarestorage.com/<bucket>/<key> (Not for public access usually)
                // Better: https://pub-<hash>.r2.dev/<key> (R2.dev subdomain) or Custom Domain
                // Let's assume we have a public domain or use the R2.dev for MVP
                // User didn't provide public domain, so we might need to ask or use a placeholder.
                // I will use a placeholder domain for now.
                const publicUrl = `https://media.argprop.com/${key}`
                uploadedUrls.push(publicUrl)
            }

            // 2. Create Property in DB
            await createProperty({
                ...values,
                features: { wifi: true }, // Hardcoded for MVP
                images: uploadedUrls,
            })

            router.push('/dashboard')
        } catch (error) {
            console.error('Error publishing:', error)
            toast.error('Error al publicar la propiedad. Inténtalo de nuevo.')
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="container max-w-2xl py-10">
            <Card>
                <CardHeader>
                    <CardTitle>Publicar Propiedad</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Título del Aviso</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ej: Depto 2 ambientes en Palermo" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="operation_type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Operación</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Seleccionar" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="rent">Alquiler</SelectItem>
                                                    <SelectItem value="sale">Venta</SelectItem>
                                                    <SelectItem value="temporary">Temporal</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="flex gap-2">
                                    <FormField
                                        control={form.control}
                                        name="currency"
                                        render={({ field }) => (
                                            <FormItem className="w-24">
                                                <FormLabel>Moneda</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="USD">USD</SelectItem>
                                                        <SelectItem value="ARS">ARS</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="price"
                                        render={({ field }) => (
                                            <FormItem className="flex-1">
                                                <FormLabel>Precio</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} value={field.value as number} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="rooms"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Ambientes</FormLabel>
                                            <FormControl>
                                                <Input type="number" min={1} {...field} value={field.value as number} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="bathrooms"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Baños</FormLabel>
                                            <FormControl>
                                                <Input type="number" min={1} {...field} value={field.value as number} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="address"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Dirección</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Av. Libertador 1234" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Descripción</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Detalles de la propiedad..." className="h-32" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="space-y-2">
                                <FormLabel>Fotos</FormLabel>
                                <div className="grid grid-cols-3 gap-4 mb-4">
                                    {images.map((file, i) => (
                                        <div key={i} className="relative aspect-square bg-muted rounded-md overflow-hidden">
                                            <Image
                                                src={URL.createObjectURL(file)}
                                                alt="Preview"
                                                fill
                                                className="object-cover"
                                                unoptimized
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(i)}
                                                className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 z-10"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}
                                    <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed rounded-md cursor-pointer hover:bg-muted/50 transition-colors">
                                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                                        <span className="text-xs text-muted-foreground">Subir foto</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            className="hidden"
                                            onChange={handleImageChange}
                                        />
                                    </label>
                                </div>
                            </div>

                            <Button type="submit" className="w-full" disabled={uploading}>
                                {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {uploading ? 'Publicando...' : 'Publicar Aviso'}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}
