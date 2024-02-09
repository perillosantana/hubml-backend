import Elysia, { t } from 'elysia'
import { authentication } from '../authentication'
import MercadoLivreAPI from '@/class/MercadoLivreAPI'
import { db } from '@/db/connection'

export const getMlProduct = new Elysia().use(authentication).get(
  '/ml/products/:id',
  async ({ getLogin, params }) => {
    const login = await getLogin()

    const mercadoLivreAPI = new MercadoLivreAPI()

    const product = await mercadoLivreAPI.searchProduct({
      id: params.id,
      login,
    })

    const getDescription = await db.query.descriptions.findFirst({
      columns: {
        status: true,
        description: true,
      },
      where(fields, { eq }) {
        return eq(fields.productId, product.id)
      },
    })

    if (getDescription) {
      return {
        ...product,
        statusDescription: getDescription.status,
        descriptionIA: getDescription.description,
      }
    }

    return {
      ...product,
      statusDescription: 'available',
    }
  },
  {
    params: t.Object({
      id: t.String(),
    }),
  },
)
