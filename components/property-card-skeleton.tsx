import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function PropertyCardSkeleton() {
    return (
        <Card className="overflow-hidden h-full flex flex-col">
            <div className="relative aspect-video bg-muted overflow-hidden">
                <Skeleton className="h-full w-full" />
            </div>
            <CardHeader className="p-4 pb-2 space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="p-4 pt-2 flex-1">
                <div className="flex gap-4">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-12" />
                </div>
            </CardContent>
        </Card>
    )
}
