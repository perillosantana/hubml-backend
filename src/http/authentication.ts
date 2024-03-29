import Elysia, { Static, t } from 'elysia'
import jwt from '@elysiajs/jwt'
import { env } from '@/env'
import bearer from '@elysiajs/bearer'
import { HumanizedError } from './routes/errors/humanized-error'

const jwtPayloadSchema = t.Object({
  login: t.Optional(t.String()),
})

export const authentication = new Elysia()
  .use(bearer())
  .use(
    jwt({
      name: 'jwt',
      secret: env.JWT_SECRET_KEY,
      schema: jwtPayloadSchema,
      exp: '1d',
    }),
  )
  .derive(({ jwt, bearer, set }) => {
    return {
      getLogin: async () => {
        if (!bearer) {
          set.status = 401

          throw new HumanizedError({
            status: 'error',
            message: 'Usuário sem acesso',
          })
        }

        const user = await jwt.verify(bearer)

        if (!user) {
          set.status = 401

          throw new HumanizedError({
            status: 'error',
            message: 'Usuário sem acesso',
          })
        }

        return user.login || ''
      },
      signIn: async (payload: Static<typeof jwtPayloadSchema>) => {
        return await jwt.sign(payload)
      },
    }
  })
