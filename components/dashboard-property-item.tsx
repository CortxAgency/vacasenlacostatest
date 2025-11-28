'use client'

import { PropertyCard } from '@/components/property-card'
import { Button } from '@/components/ui/button'
import { Trash2, Pencil } from 'lucide-react'
import { deleteProperty } from '@/actions/property'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import Link from 'next/link'
import { toast } from 'sonner'
import { FeatureButton } from '@/components/feature-button'
import { Property } from '@/types/types'

export function DashboardPropertyItem({ property }: { property: Property }) {
    const router = useRouter()
    const [deleting, setDeleting] = useState(false)

    const handleDelete = async () => {
        try {
            setDeleting(true)
            await deleteProperty(property.id)
            router.refresh()
            toast.success('Propiedad eliminada')
        } catch (error) {
            console.error('Error deleting:', error)
            toast.error('Error al eliminar la propiedad.')
        } finally {
            setDeleting(false)
        }
    }

    return (
        <div className="relative group">
            <PropertyCard property={property} />
            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 backdrop-blur-sm p-1 rounded-lg shadow-sm">
                <FeatureButton propertyId={property.id} isFeatured={property.is_featured} />

                <Link href={`/edit/${property.id}`}>
                    <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-slate-200">
                        <Pencil className="h-4 w-4 text-slate-600" />
                    </Button>
                </Link>

                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-red-100">
                            <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Esta acción no se puede deshacer. La propiedad será eliminada permanentemente.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-red-500 hover:bg-red-600">
                                {deleting ? 'Eliminando...' : 'Eliminar'}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    )
}
