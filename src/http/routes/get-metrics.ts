import Elysia from 'elysia'
import { authentication } from '../authentication'
import { db } from '@/db/connection'
import { and, count, eq, gte, lt, sql, sum } from 'drizzle-orm'
import { orders } from '@/db/schema'
import dayjs from 'dayjs'

export const getMetrics = new Elysia()
  .use(authentication)
  .get('/metrics', async ({ getLogin }) => {
    const login = await getLogin()

    const today = dayjs()
    const startOfLastMonth = today.subtract(1, 'month').startOf('month')

    const ordersPerDay = await db
      .select({
        dayOfMonth: sql<string>`TO_CHAR(${orders.createdIn}, 'YYYY-MM-DD')`,
        amount: count(orders.id),
      })
      .from(orders)
      .where(
        and(
          eq(orders.userId, login),
          gte(orders.createdIn, startOfLastMonth.toDate()),
          lt(orders.createdIn, today.toDate()),
        ),
      )
      .groupBy(sql`TO_CHAR(${orders.createdIn}, 'YYYY-MM-DD')`)
      .having(({ amount }) => gte(amount, 1))

    const ordersTotalValue = await db
      .select({
        totalValue: sum(orders.value),
      })
      .from(orders)
      .where(and(eq(orders.userId, login)))

    return {
      ordersPerDay,
      ordersTotalValue: Number(ordersTotalValue[0].totalValue || 0),
    }
  })
