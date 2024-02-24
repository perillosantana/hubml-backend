import Elysia, { t } from 'elysia'
import { authentication } from '../authentication'
import { db } from '@/db/connection'
import OpenaiAPI from '@/class/OpenaiAPI'
import { HumanizedError } from './errors/humanized-error'
import { z } from 'zod'
import { descriptions, users } from '@/db/schema'
import { env } from '@/env'
import { eq } from 'drizzle-orm'

const calcBalance = (balance: number, paragraphs: number) => {
  const valueGeneration = Number(env.VALUE_GENERATION)
  const valueParagraph = Number(env.VALUE_PARAGRAPH)

  if (paragraphs > 1) {
    return balance - valueGeneration - valueParagraph * (paragraphs - 1)
  }

  return balance - valueGeneration
}

export const updateDescription = new Elysia().use(authentication).patch(
  '/descriptions',
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

    const result = await openaiAPI.generate({
      description,
      paragraphs,
    })

    await db
      .update(descriptions)
      .set({
        description: result.description,
        value: user.balance - calcBalance(user.balance, paragraphs),
        status: 'pending',
      })
      .where(eq(descriptions.productId, productId))
      .catch((error) => {
        throw new HumanizedError({
          status: 'error',
          message: 'Erro ao salvar descrição',
          systemMessage: error,
        })
      })

    await db
      .update(users)
      .set({
        balance: calcBalance(user.balance, paragraphs),
      })
      .where(eq(users.login, login))

    return {
      value: user.balance - calcBalance(user.balance, paragraphs),
      description: result.description,
    }
  },
  {
    body: t.Object({
      description: t.String(),
      productId: t.String(),
      paragraphs: t.Number(),
    }),
  },
)
