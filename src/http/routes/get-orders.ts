import Elysia, { t } from 'elysia'
import { authentication } from '../authentication'
import { db } from '@/db/connection'
import { z } from 'zod'
import { and, count, eq } from 'drizzle-orm'
import { orders } from '@/db/schema'

export const getOrders = new Elysia().use(authentication).get(
  '/orders',
  async ({ getLogin, query }) => {
    const perPage = 5

    const login = await getLogin()

    const { pageIndex, productId } = z
      .object({
        pageIndex: z.coerce.number().default(0),
        productId: z.coerce.string().default(''),
      })
      .parse(query)

    const baseQuery = db
      .select({
        description: orders.description,
        value: orders.value,
        productId: orders.productId,
        createdIn: orders.createdIn,
      })
      .from(orders)
      .where(() => {
        if (!productId) {
          return eq(orders.userId, login)
        }

        return and(eq(orders.userId, login), eq(orders.productId, productId))
      })

    const [ordersCount] = await db
      .select({ count: count() })
      .from(baseQuery.as('baseQuery'))

    const allOrders = await baseQuery.offset(pageIndex * perPage).limit(perPage)

    const result = {
      orders: allOrders,
      meta: {
        pageIndex,
        perPage,
        total: ordersCount.count,
      },
    }

    return result
  },
  {
    query: t.Object({
      pageIndex: t.Optional(t.Numeric()),
      productId: t.Optional(t.String()),
    }),
  },
)
