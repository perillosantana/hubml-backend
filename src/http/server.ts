import cors from '@elysiajs/cors'
import Elysia from 'elysia'
import { authentication } from './authentication'
import { signIn } from './routes/sign-in'
import { env } from '@/env'
import { getUser } from './routes/get-user'
import { createUser } from './routes/create-user'
import { updateUser } from './routes/update-user'
import { getOrders } from './routes/get-orders'
import { getMlToken } from './routes/get-ml-token'
import { getMlProducts } from './routes/get-ml-products'
import { getMlProduct } from './routes/get-ml-product'
import { createDescription } from './routes/create-description'
import { getMetrics } from './routes/get-metrics'
import { updateMlProduct } from './routes/update-ml-product'

const app = new Elysia()
  .use(
    cors({
      credentials: true,
      allowedHeaders: ['Content-type', 'Accept', 'Authorization'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
      origin: env.CLIENT_ORIGIN,
    }),
  )
  .get('/robots.txt', () => 'User-agent: *\n\nDisallow: /')
  .use(authentication)
  .use(signIn)
  .onBeforeHandle(async ({ getLogin }) => {
    await getLogin()
  })
  .use(getUser)
  .use(createUser)
  .use(updateUser)
  .use(getOrders)
  .use(getMlToken)
  .use(getMlProducts)
  .use(getMlProduct)
  .use(createDescription)
  .use(getMetrics)
  .use(updateMlProduct)

app.listen(3003)

export default app
