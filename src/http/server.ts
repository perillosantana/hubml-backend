import cors from '@elysiajs/cors'
import Elysia from 'elysia'
import { authentication } from './authentication'
import { signIn } from './routes/sign-in'
import { env } from '@/env'

const app = new Elysia()
  .use(
    cors({
      credentials: true,
      allowedHeaders: ['content-type', 'Accept'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
      origin: env.CLIENT_ORIGIN,
    }),
  )
  .use(authentication)
  .use(signIn)
  .onBeforeHandle(async ({ getCurrentUser }) => {
    await getCurrentUser()
  })
  .get('/user', async ({ getCurrentUser }) => {
    const user = await getCurrentUser()

    return user
  })

app.listen(3003)

export default app
