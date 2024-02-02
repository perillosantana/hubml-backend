import Elysia from 'elysia'
import { authentication } from '../authentication'
import { db } from '@/db/connection'
import { and, count, eq, gte, lt, sql, sum } from 'drizzle-orm'
import { descriptions } from '@/db/schema'
import dayjs from 'dayjs'

export const getMetrics = new Elysia()
  .use(authentication)
  .get('/metrics', async ({ getLogin }) => {
    const login = await getLogin()

    const today = dayjs()
    const startOfLastMonth = today.subtract(1, 'month').startOf('month')

    const descriptionsPerDay = await db
      .select({
        dayOfMonth: sql<string>`TO_CHAR(${descriptions.createdIn}, 'YYYY-MM-DD')`,
        amount: count(descriptions.id),
      })
      .from(descriptions)
      .where(
        and(
          eq(descriptions.userId, login),
          gte(descriptions.createdIn, startOfLastMonth.toDate()),
          lt(descriptions.createdIn, today.toDate()),
        ),
      )
      .groupBy(sql`TO_CHAR(${descriptions.createdIn}, 'YYYY-MM-DD')`)
      .having(({ amount }) => gte(amount, 1))

    const descriptionsTotalValue = await db
      .select({
        totalValue: sum(descriptions.value),
      })
      .from(descriptions)
      .where(and(eq(descriptions.userId, login)))

    return {
      descriptionsPerDay,
      descriptionsTotalValue: Number(descriptionsTotalValue[0].totalValue || 0),
    }
  })
