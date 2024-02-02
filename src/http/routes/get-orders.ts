import Elysia, { t } from 'elysia'
import { authentication } from '../authentication'
import { db } from '@/db/connection'
import { z } from 'zod'
import { count, eq, sum } from 'drizzle-orm'
import { orders } from '@/db/schema'

export const getOrders = new Elysia().use(authentication).get(
  '/orders',
  async ({ getLogin, query }) => {
    const perPage = 10

    const login = await getLogin()

    const { pageIndex } = z
      .object({
        pageIndex: z.coerce.number().default(0),
      })
      .parse(query)

    const baseQuery = db
      .select({
        value: orders.value,
        status: orders.status,
        ticketUrl: orders.ticketUrl,
        expiration: orders.expiration,
        created: orders.created,
      })
      .from(orders)
      .where(eq(orders.userId, login))

    const [ordersCount] = await db
      .select({ count: count() })
      .from(baseQuery.as('baseQuery'))

    const [ordersValue] = await db
      .select({ value: sum(orders.value) })
      .from(baseQuery.as('baseQuery'))

    const allOrders = await baseQuery.offset(pageIndex * perPage).limit(perPage)

    const result = {
      orders: allOrders,
      meta: {
        pageIndex,
        perPage,
        total: ordersCount.count,
      },
      total: Number(ordersValue.value),
    }

    return result
  },
  {
    query: t.Object({
      pageIndex: t.Optional(t.Numeric()),
    }),
  },
)
