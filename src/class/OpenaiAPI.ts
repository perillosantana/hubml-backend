import { env } from '@/env'
import { HumanizedError } from '@/http/routes/errors/humanized-error'
import OpenAI from 'openai'

type GenerateProps = {
  description: string
  paragraphs: number
}

class OpenaiAPI {
  openai

  constructor() {
    this.openai = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
    })
  }

  async generate({ description, paragraphs }: GenerateProps) {
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

    return {
      description: response.choices[0].message.content,
    }
  }
}

export default OpenaiAPI
