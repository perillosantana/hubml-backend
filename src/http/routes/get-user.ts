import Elysia from 'elysia'
import { authentication } from '../authentication'
import { db } from '@/db/connection'

export const getUser = new Elysia()
  .use(authentication)
  .get('/user', async ({ getLogin }) => {
    const login = await getLogin()

    const user = await db.query.users.findFirst({
      columns: {
        login: true,
        name: true,
        phone: true,
        active: true,
        balance: true,
      },
      where(fields, { eq }) {
        return eq(fields.login, login)
      },
    })

    return user
  })
