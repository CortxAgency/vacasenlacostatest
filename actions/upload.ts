'use server'

import { r2 } from '@/utils/r2'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { createClient } from '@/utils/supabase/server'
import { v4 as uuidv4 } from 'uuid'

export async function getPresignedUrl(fileType: string, fileSize: number) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    // Security Validations
    const MAX_SIZE = 5 * 1024 * 1024 // 5MB
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']

    if (!ALLOWED_TYPES.includes(fileType)) {
        return { error: 'Solo se permiten imágenes (JPG, PNG, WEBP)' }
    }

    if (fileSize > MAX_SIZE) {
        return { error: 'El archivo es demasiado grande (Máx 5MB)' }
    }

    const fileExtension = fileType.split('/')[1]
    const key = `${user.id}/${uuidv4()}.${fileExtension}`

    const command = new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
        ContentType: fileType,
        ContentLength: fileSize,
    })

    try {
        const signedUrl = await getSignedUrl(r2, command, { expiresIn: 3600 })
        return { signedUrl, key }
    } catch (error) {
        console.error('Error getting presigned URL:', error)
        return { error: 'Failed to generate upload URL' }
    }
}
