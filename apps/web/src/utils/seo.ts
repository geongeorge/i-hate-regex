export const siteUrl = 'https://ihateregex.io'

export const canonicalLink = (path: string) => ({
  rel: 'canonical',
  href: `${siteUrl}${path}`,
})

export const jsonLd = (data: Record<string, unknown>) => ({
  type: 'application/ld+json',
  children: JSON.stringify({ '@context': 'https://schema.org', ...data }),
})

export const seo = ({
  title,
  description,
  keywords,
  image,
  path,
}: {
  title: string
  description?: string
  image?: string
  keywords?: string
  path?: string
}) => {
  const tags = [
    { title },
    { name: 'description', content: description },
    { name: 'keywords', content: keywords },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { property: 'og:type', content: 'website' },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    ...(path !== undefined ? [{ property: 'og:url', content: `${siteUrl}${path}` }] : []),
    ...(image
      ? [
          { name: 'twitter:image', content: image },
          { name: 'twitter:card', content: 'summary_large_image' },
          { property: 'og:image', content: image },
          { property: 'og:image:width', content: '2400' },
          { property: 'og:image:height', content: '1260' },
        ]
      : []),
  ]

  return tags
}
