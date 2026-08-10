export const siteUrl = 'https://ihateregex.io'

export const canonicalLink = (path: string) => ({
  rel: 'canonical',
  href: `${siteUrl}${path}`,
})

export const jsonLd = (data: Record<string, unknown>) => ({
  type: 'application/ld+json',
  children: JSON.stringify({ '@context': 'https://schema.org', ...data }),
})

export const defaultOgImage = `${siteUrl}/og/default.png`

export const seo = ({
  title,
  description,
  keywords,
  image = defaultOgImage,
  imageAlt,
  path,
}: {
  title: string
  description?: string
  image?: string
  imageAlt?: string
  keywords?: string
  path?: string
}) => {
  const alt = imageAlt ?? 'iHateRegex — a regex railroad diagram'
  const tags = [
    { title },
    { name: 'description', content: description },
    { name: 'keywords', content: keywords },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:site', content: '@ihateregex' },
    { name: 'twitter:creator', content: '@ihateregex' },
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: 'iHateRegex' },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    ...(path !== undefined ? [{ property: 'og:url', content: `${siteUrl}${path}` }] : []),
    ...(image
      ? [
          { name: 'twitter:card', content: 'summary_large_image' },
          { name: 'twitter:image', content: image },
          { name: 'twitter:image:alt', content: alt },
          { property: 'og:image', content: image },
          { property: 'og:image:secure_url', content: image },
          { property: 'og:image:type', content: 'image/png' },
          { property: 'og:image:alt', content: alt },
          { property: 'og:image:width', content: '2400' },
          { property: 'og:image:height', content: '1260' },
        ]
      : []),
  ]

  return tags
}
