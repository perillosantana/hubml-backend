import Elysia, { t } from 'elysia'
import { authentication } from '../authentication'
import { z } from 'zod'
import MercadoLivreAPI from '@/class/MercadoLivreAPI'
import { db } from '@/db/connection'

export const getMlProducts = new Elysia().use(authentication).get(
  '/ml/products',
  async ({ getLogin, query }) => {
    const mercadoLivreAPI = new MercadoLivreAPI()

    const login = await getLogin()

    const { pageIndex, search } = z
      .object({
        pageIndex: z.coerce.number().default(0),
        search: z.coerce.string().default(''),
      })
      .parse(query)

    const urlParams = new URLSearchParams()

    urlParams.append('query', search)
    urlParams.append('offset', String(pageIndex * 2))
    urlParams.append('limit', String(2))
    urlParams.append('status', 'active')

    const products = await mercadoLivreAPI.searchProducts({
      urlParams: urlParams.toString(),
      login,
    })

    const newProducts = await await Promise.all(
      products.map(async (product) => {
        const getDescription = await db.query.descriptions.findFirst({
          columns: {
            status: true,
          },
          where(fields, { eq }) {
            return eq(fields.productId, product.id)
          },
        })

        return {
          ...product,
          statusDescription: getDescription?.status,
        }
      }),
    )

    return newProducts.sort((prev, next) => {
      const prevName = prev.title.toUpperCase()
      const nextName = next.title.toUpperCase()

      if (prevName < nextName) {
        return -1
      }
      if (prevName > nextName) {
        return 1
      }
      return 0
    })
  },
  {
    query: t.Object({
      pageIndex: t.Optional(t.Numeric()),
      search: t.Optional(t.String()),
    }),
  },
)
