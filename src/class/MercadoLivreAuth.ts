import { db } from '@/db/connection'
import { users } from '@/db/schema'
import { env } from '@/env'
import { HumanizedError } from '@/http/routes/errors/humanized-error'
import { eq } from 'drizzle-orm'

type GetTokenProps = {
  code: string
  login: string
}

type RefreshTokenProps = {
  login: string
}

class MercadoLivreAuth {
  baseUrl: string

  constructor() {
    this.baseUrl = env.ML_UL
  }

  async getToken({ code, login }: GetTokenProps) {
    const response = await fetch(`${this.baseUrl}/oauth/token`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: env.ML_CLIENT_ID,
        client_secret: env.ML_CLIENT_SECRET,
        code,
        redirect_uri: env.ML_REDIRECT_URI,
      }),
    })

    if (!response.ok) {
      throw new HumanizedError({
        status: 'error',
        message: `Ocorreu um erro ao tentar obter o token do Mercado Livre`,
      })
    }

    const mlResponse = (await response.json()) as MLToken

    await db
      .update(users)
      .set({
        active: true,
        accessToken: mlResponse.access_token,
        refreshToken: mlResponse.refresh_token,
        seller: mlResponse.user_id,
      })
      .where(eq(users.login, login))
  }

  private async refreshToken({ login }: RefreshTokenProps) {
    const user = await db.query.users.findFirst({
      columns: {
        refreshToken: true,
      },
      where(fields, { eq }) {
        return eq(fields.login, login)
      },
    })

    const response = await fetch(`${this.baseUrl}/oauth/token`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify({
        grant_type: 'refresh_token',
        client_id: env.ML_CLIENT_ID,
        client_secret: env.ML_CLIENT_SECRET,
        refresh_token: user?.refreshToken,
      }),
    })

    if (!response.ok) {
      throw new HumanizedError({
        status: 'error',
        message: `Ocorreu um erro ao tentar obter o refresh token do Mercado Livre`,
      })
    }

    const mlResponse = (await response.json()) as MLToken

    await db
      .update(users)
      .set({
        active: true,
        accessToken: mlResponse.access_token,
        refreshToken: mlResponse.refresh_token,
      })
      .where(eq(users.login, login))
  }

  async pingMercadoLivre({ login }: RefreshTokenProps) {
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

    const response = await fetch(`${this.baseUrl}/users/me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${user?.accessToken}`,
      },
    })

    if (response.status === 401) {
      await this.refreshToken({ login })
    }
  }
}

export default MercadoLivreAuth
