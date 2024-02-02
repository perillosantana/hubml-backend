import Elysia, { t } from 'elysia'
import { authentication } from '../authentication'
import MercadoLivreAPI from '@/class/MercadoLivreAPI'

export const updateMlProduct = new Elysia().use(authentication).patch(
  '/ml/products/:id',
  async ({ body, getLogin, params, set }) => {
    const login = await getLogin()
    const mercadoLivreAPI = new MercadoLivreAPI()

    await mercadoLivreAPI.updateProduct({
      description: body.description,
      id: params.id,
      login,
    })

    set.status = 204
  },
  {
    params: t.Object({
      id: t.String(),
    }),
    body: t.Object({
      description: t.String(),
    }),
  },
)
