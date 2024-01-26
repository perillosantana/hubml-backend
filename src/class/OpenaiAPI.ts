import { db } from '@/db/connection'
import { orders, users } from '@/db/schema'
import { env } from '@/env'
import { HumanizedError } from '@/http/routes/errors/humanized-error'
import { eq } from 'drizzle-orm'
import OpenAI from 'openai'

type GenerateProps = {
  description: string
  paragraphs: number
  productId: string
  login: string
  balance: number
}

class OpenaiAPI {
  openai

  constructor() {
    this.openai = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
    })
  }

  private calcBalance = (balance: number, paragraphs: number) => {
    const valueGeneration = Number(env.VALUE_GENERATION)
    const valueParagraph = Number(env.VALUE_PARAGRAPH)

    if (paragraphs > 1) {
      return balance - valueGeneration - valueParagraph * (paragraphs - 1)
    }

    return balance - valueGeneration
  }

  async generate({
    login,
    description,
    paragraphs,
    productId,
    balance,
  }: GenerateProps) {
    const response = await this.openai.chat.completions
      .create({
        messages: [
          {
            role: 'system',
            content: 'Você é um assistente de descrição de produtos.',
          },
          {
            role: 'user',
            content: `Crie uma descrição para esse produto com a quantidade ${paragraphs} de paragrafos, aqui está os detalhes do produto: ${description}`,
          },
        ],
        model: 'gpt-3.5-turbo-1106',
      })
      .catch(() => {
        throw new HumanizedError({
          status: 'error',
          message:
            'Não foi possivel gerar a descrição, tente novamente mais tarde.',
        })
      })

    await db
      .update(users)
      .set({
        balance: this.calcBalance(balance, paragraphs),
      })
      .where(eq(users.login, login))

    await db.insert(orders).values({
      description: response.choices[0].message.content,
      value: balance - this.calcBalance(balance, paragraphs),
      productId,
      userId: login,
    })

    return {
      value: balance - this.calcBalance(balance, paragraphs),
      description: response.choices[0].message.content,
    }
  }
}

export default OpenaiAPI
