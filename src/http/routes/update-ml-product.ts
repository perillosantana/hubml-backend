import Elysia, { t } from 'elysia'
import { authentication } from '../authentication'
import MercadoLivreAPI from '@/class/MercadoLivreAPI'

export const updateMlProduct = new Elysia().use(authentication).patch(
  '/ml/products/:id',
  async ({ body, getLogin, params }) => {
    const login = await getLogin()
    const mercadoLivreAPI = new MercadoLivreAPI()

    return await mercadoLivreAPI.updateProduct({
      description: body.description,
      id: params.id,
      login,
    })
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
