type MLToken = {
  access_token: string
  token_type: string
  expires_in: number
  scope: string
  user_id: number
  refresh_token: string
}

type MLProducts = {
  paging: { limit: number; offset: number; total: number }
  results: string[]
}

type MLProductImage = {
  url: string
  secure_url: string
}

type MLProductViewAttributes = {
  id: string
  name: string
  value_name: string
}

type MLProduct = {
  code: number
  body: {
    id: string
    title: string
    permalink: string
    pictures: MLProductImage[]
    descriptions: string[]
    attributes: MLProductViewAttributes[]
    status: string
    price: number
    sold_quantity: number
    available_quantity: number
  }
}

type MLProductView = {
  id: string
  title: string
  permalink: string
  pictures: MLProductImage[]
  descriptions: string[]
  attributes: MLProductViewAttributes[]
}
