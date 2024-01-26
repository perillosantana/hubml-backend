import Elysia, { t } from 'elysia'
import { authentication } from '../authentication'
import { db } from '@/db/connection'
import { z } from 'zod'

export const getOrders = new Elysia().use(authentication).get(
  '/orders',
  async ({ getLogin, query }) => {
    const login = await getLogin()

    const { pageIndex, productId } = z
      .object({
        pageIndex: z.coerce.number().default(0),
        productId: z.coerce.string().default(''),
      })
      .parse(query)

    const orders = await db.query.orders.findMany({
      offset: pageIndex * 2,
      limit: 2,
      columns: {
        description: true,
        value: true,
        productId: true,
        createdIn: true,
      },
      where(fields, { eq, and }) {
        if (!productId) {
          return eq(fields.userId, login)
        }

        return and(eq(fields.userId, login), eq(fields.productId, productId))
      },
      orderBy: (orders, { desc }) => desc(orders.createdIn),
    })

    return orders
  },
  {
    query: t.Object({
      pageIndex: t.Optional(t.Numeric()),
      productId: t.Optional(t.String()),
    }),
  },
)
