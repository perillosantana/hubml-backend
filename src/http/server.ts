import cors from '@elysiajs/cors'
import Elysia from 'elysia'
import { authentication } from './authentication'
import { signOut } from './routes/sign-out'
import { signIn } from './routes/sign-in'

const app = new Elysia()
  .use(
    cors({
      credentials: true,
      allowedHeaders: ['content-type'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
      origin: ({ headers }) => {
        if (Bun.env.NODE_ENV === 'production') {
          return headers.get('Origin') === 'https://hubml.com.br'
        } else {
          return true
        }
      },
    }),
  )
  .use(authentication)
  .use(signIn)
  .use(signOut)

app.listen(3003)

export default app
