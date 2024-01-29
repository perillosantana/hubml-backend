import { env } from '@/env'
import Elysia from 'elysia'
import { MercadoPagoConfig, Payment } from 'mercadopago'

type RequestBodyResult = {
  action: string
  api_version: string
  data: {
    id: string
  }
  date_created: string
  id: string
  live_mode: false
  type: string
  user_id: number
}
export const getPaymentAuthorized = new Elysia().post(
  '/payment-authorized',
  async ({ body }) => {
    const client = new MercadoPagoConfig({
      accessToken: env.MP_TOKEN,
    })

    const payment = new Payment(client)

    const result = body as RequestBodyResult

    if (!result) {
      return {}
    }

    const getPayment = await payment.get({ id: result.data.id })
    return getPayment
  },
)
