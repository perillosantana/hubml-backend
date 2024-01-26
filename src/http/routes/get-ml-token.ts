import Elysia, { t } from 'elysia'
import { authentication } from '../authentication'
import MercadoLivreAuth from '@/class/MercadoLivreAuth'

export const getMlToken = new Elysia().use(authentication).post(
  '/ml/get-access-token/:code',
  async ({ params, getLogin, set }) => {
    const login = await getLogin()

    const mercadoLivreAuth = new MercadoLivreAuth()

    await mercadoLivreAuth.getToken({ code: params.code, login }).then(() => {
      set.status = 204
    })
  },
  {
    params: t.Object({
      code: t.String(),
    }),
  },
)
