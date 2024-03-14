import Elysia, { t } from 'elysia'
import { authentication } from '../authentication'
import { db } from '@/db/connection'
import { z } from 'zod'
import { and, count, desc, eq, sum } from 'drizzle-orm'
import { descriptions } from '@/db/schema'

export const getDescriptions = new Elysia().use(authentication).get(
  '/descriptions',
  async ({ getLogin, query }) => {
    const perPage = 10

    const login = await getLogin()

    const { pageIndex, productId } = z
      .object({
        pageIndex: z.coerce.number().default(0),
        productId: z.coerce.string().default(''),
      })
      .parse(query)

    const baseQuery = db
      .select({
        description: descriptions.description,
        value: descriptions.value,
        productId: descriptions.productId,
        status: descriptions.status,
        createdIn: descriptions.createdIn,
      })
      .from(descriptions)
      .where(() => {
        if (!productId) {
          return eq(descriptions.userId, login)
        }

        return and(
          eq(descriptions.userId, login),
          eq(descriptions.productId, productId),
        )
      })

    const [descriptionsCount] = await db
      .select({ count: count() })
      .from(baseQuery.as('baseQuery'))

    const [descriptionsValue] = await db
      .select({ value: sum(descriptions.value) })
      .from(baseQuery.as('baseQuery'))

    const allDescriptions = await baseQuery
      .offset(pageIndex * perPage)
      .limit(perPage)
      .orderBy(desc(descriptions.createdIn))

    const result = {
      descriptions: allDescriptions,
      meta: {
        pageIndex,
        perPage,
        total: descriptionsCount.count,
      },
      total: Number(descriptionsValue.value),
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
