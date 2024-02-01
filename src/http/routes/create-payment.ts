import Elysia, { t } from 'elysia'
import { authentication } from '../authentication'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { env } from '@/env'

export const createPayment = new Elysia().use(authentication).post(
  '/payment',
  async ({ body }) => {
    const client = new MercadoPagoConfig({
      accessToken: env.MP_TOKEN,
    })

    const payment = new Payment(client)

    const createPayment = await payment.create({
      body: {
        transaction_amount: Number(body.value.replace(/[^0-9]/g, '')) / 100,
        payment_method_id: 'pix',
        payer: {
          email: body.email,
          identification: {
            type: 'CPF',
            number: body.document.replace(/[^a-zA-Z0-9]/g, ''),
          },
        },
        description: body.email,
      },
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
      email: t.String(),
      document: t.String(),
      value: t.String(),
    }),
  },
)
