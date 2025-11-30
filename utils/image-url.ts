/**
 * Utility to generate the public URL for an image stored in R2.
 * Uses the NEXT_PUBLIC_R2_PUBLIC_URL environment variable.
 * Fallbacks to a placeholder if not configured, to avoid broken images.
 */
export function getR2PublicUrl(key: string): string {
    const domain = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || 'pub-e01bd23781b441a1a45bda2ab1f5edbe.r2.dev';

    // Remove protocol if present to ensure consistency
    const cleanDomain = domain.replace(/^https?:\/\//, '');

    return `https://${cleanDomain}/${key}`;
}
