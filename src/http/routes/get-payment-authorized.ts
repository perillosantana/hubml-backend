import { db } from '@/db/connection'
import { orders, users } from '@/db/schema'
import { env } from '@/env'
import { eq } from 'drizzle-orm'
import Elysia from 'elysia'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { HumanizedError } from './errors/humanized-error'

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
      const order = await db
        .select({
          user: orders.userId,
          value: orders.value,
          status: orders.status,
        })
        .from(orders)
        .where(eq(orders.paymentId, result.data.id))

      if (order.length && order[0].user && order[0].value) {
        const login = order[0].user

        const user = await db.query.users.findFirst({
          columns: {
            balance: true,
          },
          where(fields, { eq }) {
            return eq(fields.login, login)
          },
        })

        if (!user?.balance) {
          throw new HumanizedError({
            status: 'error',
            message: 'Erro ao procurar o saldo do usuário',
            systemMessage: '',
          })
        }

        const newBalance = user?.balance + order[0].value

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
