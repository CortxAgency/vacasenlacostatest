'use client'

import { useState, useActionState } from 'react'
import { createReview } from '@/actions/reviews'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { StarRating } from '@/components/star-rating'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'

interface ReviewFormProps {
    reviewedId: string
}

const initialState = {
    message: '',
    type: '' as 'success' | 'error' | ''
}

export function ReviewForm({ reviewedId }: ReviewFormProps) {
    const [rating, setRating] = useState(0)
    const [state, formAction, isPending] = useActionState(createReview, initialState)

    useEffect(() => {
        if (state.type === 'success') {
            toast.success(state.message)
            setRating(0)
            // Reset form manually if needed, but action revalidates path
        } else if (state.type === 'error') {
            toast.error(state.message)
        }
    }, [state])

    return (
        <form action={formAction} className="space-y-4 bg-slate-50 p-6 rounded-xl border border-slate-100">
            <div>
                <h3 className="font-semibold text-lg mb-1">Deja una reseña</h3>
                <p className="text-sm text-muted-foreground mb-4">Comparte tu experiencia con este usuario.</p>
            </div>

            <input type="hidden" name="reviewed_id" value={reviewedId} />
            <input type="hidden" name="rating" value={rating} />

            <div className="space-y-2">
                <label className="text-sm font-medium">Calificación</label>
                <StarRating
                    rating={rating}
                    size={24}
                    interactive
                    onRatingChange={setRating}
                />
                {rating === 0 && <p className="text-xs text-red-500">Selecciona una calificación</p>}
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Comentario</label>
                <Textarea
                    name="comment"
                    placeholder="Escribe tu opinión aquí..."
                    required
                    className="bg-white"
                />
            </div>

            <Button type="submit" disabled={isPending || rating === 0}>
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Publicar Reseña'}
            </Button>
        </form>
    )
}
