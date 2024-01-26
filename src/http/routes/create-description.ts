import Elysia, { t } from 'elysia'
import { authentication } from '../authentication'
import { db } from '@/db/connection'
import OpenaiAPI from '@/class/OpenaiAPI'
import { HumanizedError } from './errors/humanized-error'
import { z } from 'zod'

export const createDescription = new Elysia().use(authentication).post(
  '/ai/generate',
  async ({ body, getLogin, set }) => {
    const openaiAPI = new OpenaiAPI()
    const login = await getLogin()

    const user = await db.query.users.findFirst({
      columns: {
        active: true,
        balance: true,
      },
      where(fields, { eq }) {
        return eq(fields.login, login)
      },
    })

    if (!user?.balance) {
      set.status = 400

      throw new HumanizedError({
        status: 'error',
        message: 'Saldo insuficiente',
      })
    }

    if (user.balance / 100 < 0.5) {
      set.status = 400

      throw new HumanizedError({
        status: 'error',
        message: 'Saldo insuficiente',
      })
    }

    const { description, productId, paragraphs } = z
      .object({
        paragraphs: z.coerce.number().default(1),
        productId: z.coerce.string().default(''),
        description: z.coerce.string().default(''),
      })
      .parse(body)

    return await openaiAPI.generate({
      login,
      description,
      productId,
      paragraphs,
      balance: user.balance,
    })
  },
  {
    body: t.Object({
      description: t.String(),
      productId: t.String(),
      paragraphs: t.Number(),
    }),
  },
)
