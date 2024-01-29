import Elysia from 'elysia'

export const getPaymentAuthorized = new Elysia().get(
  '/payment-authorized',
  async ({ request }) => {
    return request
  },
)
