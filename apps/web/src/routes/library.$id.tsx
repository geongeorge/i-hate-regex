import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/library/$id')({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: '/expr/$id',
      params: { id: params.id },
      statusCode: 301,
    })
  },
})
