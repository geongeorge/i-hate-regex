import { createFileRoute } from '@tanstack/react-router'
import { catalog } from '~/data/catalog'
import { siteUrl } from '~/utils/seo'

export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: () => {
        const staticPaths = ['/', '/playground', '/cheatsheet', '/community', '/changelog', '/feedback']
        const paths = [...staticPaths, ...catalog.map((entry) => `/expr/${entry.id}`)]
        const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((path) => `  <url><loc>${siteUrl}${path}</loc></url>`).join('\n')}
</urlset>
`
        return new Response(body, {
          headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, max-age=3600',
          },
        })
      },
    },
  },
})
