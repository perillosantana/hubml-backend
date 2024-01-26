import { db } from '@/db/connection'
import { HumanizedError } from '@/http/routes/errors/humanized-error'
import { env } from 'bun'
import MercadoLivreAuth from './MercadoLivreAuth'

type SearchProductsProps = {
  urlParams: string
  login: string
}

type SearchProductProps = {
  id: string
  login: string
}

type UpdateProductProps = {
  id: string
  description: string
  login: string
}

class MercadoLivreAPI {
  baseUrl: string

  constructor() {
    this.baseUrl = env.ML_UL || ''
  }

  async searchProducts({ urlParams, login }: SearchProductsProps) {
    const mercadoLivreAuth = new MercadoLivreAuth()

    await mercadoLivreAuth.pingMercadoLivre({ login })

    const user = await db.query.users.findFirst({
      columns: {
        accessToken: true,
        refreshToken: true,
        seller: true,
        active: true,
      },
      where(fields, { eq }) {
        return eq(fields.login, login)
      },
    })

    const url = `${this.baseUrl}/users/${user?.seller}/items/search?${urlParams}`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${user?.accessToken}`,
      },
    })

    if (!response.ok) {
      throw new HumanizedError({
        status: 'error',
        message: 'Ocorreu um erro ao tentar obter os produtos no Mercado Livre',
      })
    }

    const data = (await response.json()) as MLProducts

    if (!data?.results) {
      return []
    }

    if (!data.results.join(',').length) {
      return []
    }

    const productIds = data.results.join(',')

    const responseProducts = await fetch(
      `${this.baseUrl}/items?ids=${productIds}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      },
    )

    if (!responseProducts.ok) {
      throw new HumanizedError({
        status: 'error',
        message: 'Ocorreu um erro ao tentar obter os produtos no Mercado Livre',
      })
    }

    const products = (await responseProducts.json()) as MLProduct[]

    return products.map((product) => {
      return {
        id: product.body.id,
        descriptions: product.body.descriptions,
        permalink: product.body.permalink,
        pictures: product.body.pictures.map((image) => {
          return image.url
        })[0],
        title: product.body.title,
        attributes: product.body.attributes,
        status: product.body.status,
        price: product.body.price,
        soldQuantity: product.body.sold_quantity,
        availableQuantity: product.body.available_quantity,
      }
    })
  }

  async searchProduct({ id, login }: SearchProductProps) {
    const mercadoLivreAuth = new MercadoLivreAuth()

    await mercadoLivreAuth.pingMercadoLivre({ login })

    const user = await db.query.users.findFirst({
      columns: {
        accessToken: true,
        refreshToken: true,
        seller: true,
        active: true,
      },
      where(fields, { eq }) {
        return eq(fields.login, login)
      },
    })

    const response = await fetch(`${this.baseUrl}/items/${id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${user?.accessToken}`,
      },
    })

    if (!response.ok) {
      throw new HumanizedError({
        status: 'error',
        message: 'Ocorreu um erro ao tentar obter o produto no Mercado Livre',
      })
    }

    const product = (await response.json()) as MLProductView

    return {
      id: product.id,
      descriptions: product.descriptions,
      permalink: product.permalink,
      pictures: product.pictures.map((image) => {
        return image.url
      })[0],
      title: product.title,
      attributes: product.attributes.map((attribute) => {
        return {
          id: attribute.id,
          name: attribute.name,
          value: attribute.value_name,
        }
      }),
    }
  }

  async updateProduct({ description, id, login }: UpdateProductProps) {
    const user = await db.query.users.findFirst({
      columns: {
        accessToken: true,
      },
      where(fields, { eq }) {
        return eq(fields.login, login)
      },
    })

    const response = await fetch(`${this.baseUrl}/items/${id}/description`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${user?.accessToken}`,
      },
      body: JSON.stringify({
        plain_text: description,
      }),
    })

    if (!response.ok) {
      throw new HumanizedError({
        status: 'error',
        message: 'Ocorreu um erro ao tentar salvar o produto no Mercado Livre',
      })
    }

    return await response.json()
  }
}

export default MercadoLivreAPI
