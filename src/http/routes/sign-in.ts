import Elysia, { t } from 'elysia'
import { authentication } from '../authentication'
import { db } from '@/db/connection'
import { HumanizedError } from './errors/humanized-error'

export const signIn = new Elysia().use(authentication).post(
  '/auth/sign-in',
  async ({ signIn, body, set }) => {
    const user = await db.query.users.findFirst({
      where(fields, { eq }) {
        return eq(fields.login, body.login)
      },
    })

    if (!user || !user.password) {
      set.status = 400

      throw new HumanizedError({
        status: 'error',
        message: 'Usuário não existe.',
      })
    }

    const isMatch = await Bun.password.verify(body.password, user.password)

    if (user && user.login && isMatch) {
      return await signIn({
        login: user.login,
      })
    } else {
      set.status = 400

      throw new HumanizedError({
        status: 'error',
        message: 'Senha incorreta',
      })
    }
  },
  {
    body: t.Object({
      login: t.String(),
      password: t.String(),
    }),
  },
)
