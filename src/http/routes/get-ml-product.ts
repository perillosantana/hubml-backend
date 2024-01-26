import Elysia, { t } from 'elysia'
import { authentication } from '../authentication'
import MercadoLivreAPI from '@/class/MercadoLivreAPI'

export const getMlProduct = new Elysia().use(authentication).get(
  '/ml/products/:id',
  async ({ getLogin, params }) => {
    const login = await getLogin()

    const mercadoLivreAPI = new MercadoLivreAPI()

    return await mercadoLivreAPI.searchProduct({
      id: params.id,
      login,
    })
  },
  {
    params: t.Object({
      id: t.String(),
    }),
  },
)
