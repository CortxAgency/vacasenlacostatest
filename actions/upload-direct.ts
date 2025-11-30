'use server'

import { r2 } from '@/utils/r2'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { createClient } from '@/utils/supabase/server'
import { v4 as uuidv4 } from 'uuid'

export async function uploadImageToR2(fileBuffer: Buffer, fileType: string, fileName: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    const fileExtension = fileType.split('/')[1] || fileName.split('.').pop()
    const key = `${user.id}/${uuidv4()}.${fileExtension}`

    const command = new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
        Body: fileBuffer,
        ContentType: fileType,
    })

    try {
        await r2.send(command)
        return { success: true, key }
    } catch (error) {
        console.error('Error uploading to R2:', error)
        return { error: 'Failed to upload image' }
    }
}
