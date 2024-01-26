import Elysia, { t } from 'elysia'
import { authentication } from '../authentication'
import { z } from 'zod'
import MercadoLivreAPI from '@/class/MercadoLivreAPI'

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

    return await mercadoLivreAPI.searchProducts({
      urlParams: urlParams.toString(),
      login,
    })
  },
  {
    query: t.Object({
      pageIndex: t.Optional(t.Numeric()),
      search: t.Optional(t.String()),
    }),
  },
)
