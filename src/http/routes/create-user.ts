import Elysia, { t } from 'elysia'
import { authentication } from '../authentication'
import { db } from '@/db/connection'
import { users } from '@/db/schema'
import { HumanizedError } from './errors/humanized-error'

export const createUser = new Elysia().use(authentication).post(
  '/user',
  async ({ signIn, body, set }) => {
    const checkUser = await db.query.users.findFirst({
      where(fields, { eq }) {
        return eq(fields.login, body.login)
      },
    })

    if (checkUser) {
      set.status = 409

      throw new HumanizedError({
        status: 'error',
        message: 'O usuário já existe. Por favor, escolha outro E-mail.',
      })
    }

    const password = await Bun.password.hash(body.password)

    const user = await db.insert(users).values({
      ...body,
      password,
      phone: body.phone.replace(/[^\d]/g, ''),
    })

    if (!user) {
      set.status = 500

      throw new HumanizedError({
        status: 'error',
        message: 'Erro durante o cadastro do usuário.',
      })
    }

    const token = await signIn({
      login: body.login,
    })

    return {
      token,
    }
  },
  {
    body: t.Object({
      login: t.String(),
      password: t.String(),
      name: t.String(),
      phone: t.String(),
    }),
  },
)
