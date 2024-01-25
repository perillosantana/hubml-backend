import cors from '@elysiajs/cors'
import Elysia from 'elysia'
import { authentication } from './authentication'
import { signOut } from './routes/sign-out'
import { signIn } from './routes/sign-in'
import { env } from '@/env'

const app = new Elysia()
  .use(
    cors({
      credentials: true,
      allowedHeaders: ['content-type', 'Accept'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
      origin: env.CLIENT_URL,
    }),
  )
  .use(authentication)
  .use(signIn)
  .use(signOut)

app.listen(3003)

export default app
