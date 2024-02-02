import Elysia, { t } from 'elysia'
import { authentication } from '../authentication'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { env } from '@/env'
import { db } from '@/db/connection'
import { orders } from '@/db/schema'

export const createOrder = new Elysia().use(authentication).post(
  '/orders',
  async ({ body, getLogin }) => {
    const login = await getLogin()

    const client = new MercadoPagoConfig({
      accessToken: env.MP_TOKEN,
    })

    const payment = new Payment(client)

    const createPayment = await payment.create({
      body: {
        transaction_amount: Number(body.value.replace(/[^0-9]/g, '')) / 100,
        payment_method_id: 'pix',
        payer: {
          email: login,
          identification: {
            type: 'CPF',
            number: body.document.replace(/[^a-zA-Z0-9]/g, ''),
          },
        },
        description: login,
      },
    })

    await db.insert(orders).values({
      document: body.document,
      value: Number(body.value.replace(/[^0-9]/g, '')),
      codeImage:
        createPayment.point_of_interaction?.transaction_data?.qr_code_base64,
      code: createPayment.point_of_interaction?.transaction_data?.qr_code,
      paymentId: String(createPayment.id),
      ticketUrl:
        createPayment.point_of_interaction?.transaction_data?.ticket_url,
      expiration: createPayment.date_of_expiration,
      userId: login,
    })

    return {
      created: createPayment.date_created,
      expiration: createPayment.date_of_expiration,
      qrCode: createPayment.point_of_interaction?.transaction_data?.qr_code,
      qrCodeBase64:
        createPayment.point_of_interaction?.transaction_data?.qr_code_base64,
    }
  },
  {
    body: t.Object({
      document: t.String(),
      value: t.String(),
    }),
  },
)
