import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/dashboard/', '/edit/', '/publish/', '/profile/'],
        },
        sitemap: 'https://argprop.com/sitemap.xml', // Replace with real domain later
    }
}
