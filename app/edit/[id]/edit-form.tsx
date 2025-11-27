'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
import { createProperty } from '@/actions/property' // We might need an update action
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
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
})

export default function EditPropertyForm({ property }: { property: any }) {
    const [images, setImages] = useState<File[]>([])
    const [existingImages, setExistingImages] = useState<any[]>(property.property_images || [])
    const [uploading, setUploading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: property.title,
            description: property.description,
            price: property.price,
            currency: property.currency,
            operation_type: property.operation_type,
            address: property.address,
            rooms: property.rooms || 1,
            bathrooms: property.bathrooms || 1,
        },
    })

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setImages(prev => [...prev, ...Array.from(e.target.files!)])
        }
    }

    const removeNewImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index))
    }

    const removeExistingImage = async (imageId: string) => {
        // Optimistic update
        setExistingImages(prev => prev.filter(img => img.id !== imageId))
        // In real app, call server action to delete from DB/Storage
        await supabase.from('property_images').delete().eq('id', imageId)
    }

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            setUploading(true)
            const uploadedUrls: string[] = []

            // 1. Upload New Images
            for (const file of images) {
                const { signedUrl, key, error } = await getPresignedUrl(file.type, file.size)
                if (error || !signedUrl) continue

                await fetch(signedUrl, {
                    method: 'PUT',
                    body: file,
                    headers: { 'Content-Type': file.type },
                })

                const publicUrl = `https://media.argprop.com/${key}`
                uploadedUrls.push(publicUrl)
            }

            // 2. Update Property in DB
            const { error } = await supabase
                .from('properties')
                .update({
                    ...values,
                    // features: { wifi: true }, // Keep existing or update
                })
                .eq('id', property.id)

            if (error) throw error

            // 3. Insert new images
            if (uploadedUrls.length > 0) {
                const imageInserts = uploadedUrls.map((url, index) => ({
                    property_id: property.id,
                    url,
                    order: existingImages.length + index
                }))
                await supabase.from('property_images').insert(imageInserts)
            }

            router.push('/dashboard')
            router.refresh()
        } catch (error) {
            console.error('Error updating:', error)
            toast.error('Error al actualizar la propiedad.')
        } finally {
            setUploading(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Editar Propiedad</CardTitle>
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
                                        <Input {...field} />
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
                                        <Input {...field} />
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
                                        <Textarea className="h-32" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="space-y-2">
                            <FormLabel>Fotos Existentes</FormLabel>
                            <div className="grid grid-cols-3 gap-4 mb-4">
                                {existingImages.map((img) => (
                                    <div key={img.id} className="relative aspect-square bg-muted rounded-md overflow-hidden">
                                        <img
                                            src={img.url}
                                            alt="Existing"
                                            className="object-cover w-full h-full"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeExistingImage(img.id)}
                                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <FormLabel>Agregar Nuevas Fotos</FormLabel>
                            <div className="grid grid-cols-3 gap-4 mb-4">
                                {images.map((file, i) => (
                                    <div key={i} className="relative aspect-square bg-muted rounded-md overflow-hidden">
                                        <img
                                            src={URL.createObjectURL(file)}
                                            alt="Preview"
                                            className="object-cover w-full h-full"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeNewImage(i)}
                                            className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
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
                            {uploading ? 'Guardando...' : 'Guardar Cambios'}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card >
    )
}
