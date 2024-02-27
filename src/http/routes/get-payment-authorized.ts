import { db } from '@/db/connection'
import { orders, users } from '@/db/schema'
import { env } from '@/env'
import { eq } from 'drizzle-orm'
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
  async ({ body, set }) => {
    const client = new MercadoPagoConfig({
      accessToken: env.MP_TOKEN,
    })

    const payment = new Payment(client)

    const result = body as RequestBodyResult

    if (!result) {
      return {}
    }

    const getPayment = await payment.get({ id: result.data.id })

    if (getPayment.status?.toLowerCase() === 'approved') {
      const userAndOrder = await db
        .select({
          user: orders.userId,
          value: orders.value,
          status: orders.status,
          balance: users.balance,
        })
        .from(users)
        .where(eq(orders.paymentId, result.data.id))
        .leftJoin(orders, eq(users.login, orders.userId))

      if (userAndOrder.length) {
        const { user, value, status, balance } = userAndOrder[0]

        if (user && value && balance && status !== 'approved') {
          const newBalance = balance + value

          await db
            .update(orders)
            .set({
              status: 'approved',
            })
            .where(eq(orders.paymentId, result.data.id))

          await db
            .update(users)
            .set({
              balance: newBalance,
            })
            .where(eq(users.login, user))
        }
      }
    }

    set.status = 204
  },
)
