import { createServerFn } from '@tanstack/react-start'

export const getCanonicalRedirect = createServerFn({ method: 'GET' })
  .validator((location: { pathname: string; searchStr: string }) => location)
  .handler(async ({ data: location }) => {
    const { getRequestHeaders } = await import('@tanstack/react-start/server')
    const headers = getRequestHeaders()
    const host =
      typeof headers.get === 'function'
        ? headers.get('host')
        : (headers as unknown as Record<string, string>).host
    if (typeof host === 'string' && host.endsWith('.up.railway.app')) {
      return `https://ihateregex.io${location.pathname}${location.searchStr}`
    }
    return null
  })
