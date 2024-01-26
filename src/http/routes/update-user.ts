import Elysia, { t } from 'elysia'
import { authentication } from '../authentication'
import { HumanizedError } from './errors/humanized-error'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { db } from '@/db/connection'

export const updateUser = new Elysia().use(authentication).patch(
  '/user',
  async ({ getLogin, body, set }) => {
    const login = await getLogin()

    if (!Object.keys(body).length) {
      set.status = 500

      throw new HumanizedError({
        status: 'error',
        message: 'Campos inválidos',
      })
    }

    if (body.password) {
      const password = await Bun.password.hash(body.password)
      body.password = password
    }

    if (body.phone) {
      body.phone = body.phone.replace(/[^\d]/g, '')
    }

    const user = await db
      .update(users)
      .set({
        ...body,
      })
      .where(eq(users.login, login))

    if (!user) {
      set.status = 500

      throw new HumanizedError({
        status: 'error',
        message: 'Erro durante a edição do usuário.',
      })
    }

    set.status = 204
  },
  {
    body: t.Object({
      password: t.Optional(t.String()),
      name: t.Optional(t.String()),
      phone: t.Optional(t.String()),
    }),
  },
)
