import { Review } from '@/types/types'
import { StarRating } from '@/components/star-rating'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface ReviewListProps {
    reviews: Review[]
}

export function ReviewList({ reviews }: ReviewListProps) {
    if (reviews.length === 0) {
        return (
            <div className="text-center py-10 text-muted-foreground bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <p>Este usuario aún no tiene reseñas.</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {reviews.map((review) => (
                <div key={review.id} className="border-b border-slate-100 pb-6 last:border-0">
                    <div className="flex items-start gap-4">
                        <Avatar className="h-10 w-10 border border-slate-200">
                            <AvatarImage src={review.reviewer?.avatar_url} />
                            <AvatarFallback>{review.reviewer?.full_name?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                                <p className="font-semibold text-sm">{review.reviewer?.full_name || 'Usuario'}</p>
                                <span className="text-xs text-muted-foreground capitalize">
                                    {formatDistanceToNow(new Date(review.created_at), { addSuffix: true, locale: es })}
                                </span>
                            </div>
                            <StarRating rating={review.rating} size={14} />
                            <p className="text-slate-600 text-sm mt-2 leading-relaxed">
                                {review.comment}
                            </p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
