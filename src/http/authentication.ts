import Elysia, { Static, t } from 'elysia'
import { UnauthorizedError } from './routes/errors/unauthorized-error'
import jwt from '@elysiajs/jwt'
import { env } from '@/env'
import cookie from '@elysiajs/cookie'

const jwtPayloadSchema = t.Object({
  login: t.Optional(t.String()),
})

export const authentication = new Elysia()
  .error({
    UNAUTHORIZED: UnauthorizedError,
  })
  .onError(({ code, error, set }) => {
    switch (code) {
      case 'UNAUTHORIZED':
        set.status = 401
        return { code, message: error.message }
    }
  })
  .use(
    jwt({
      name: 'jwt',
      secret: env.JWT_SECRET_KEY,
      schema: jwtPayloadSchema,
    }),
  )
  .use(cookie())
  .derive(({ jwt, cookie, setCookie, removeCookie }) => {
    return {
      getCurrentUser: async () => {
        const payload = await jwt.verify(cookie.auth)

        if (!payload) {
          throw new UnauthorizedError()
        }

        return payload
      },
      signIn: async (payload: Static<typeof jwtPayloadSchema>) => {
        setCookie('auth', await jwt.sign(payload), {
          httpOnly: true,
          maxAge: 7 * 86400,
          path: '/',
          sameSite: 'lax',
        })
      },
      signOut: () => {
        removeCookie('auth')
      },
    }
  })
