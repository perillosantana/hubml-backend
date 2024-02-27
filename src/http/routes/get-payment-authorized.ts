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
      const order = await db.query.orders.findFirst({
        columns: {
          userId: true,
          value: true,
        },
        where(fields, { eq }) {
          return eq(fields.paymentId, result.data.id)
        },
      })

      if (order && order?.userId && order?.value) {
        const login = order.userId

        const user = await db.query.users.findFirst({
          columns: {
            balance: true,
          },
          where(fields, { eq }) {
            return eq(fields.login, login)
          },
        })

        if (!user?.balance) {
          return
        }

        const newBalance = user?.balance + order.value

        await db.transaction(async () => {
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
            .where(eq(users.login, login))
        })
      }
    }

    set.status = 204
  },
)
