import { z } from 'zod'

const envSchema = z.object({
  DB_URL: z.string().url().min(1),
  DB_USERNAME: z.string().min(1),
  DB_PASSWORD: z.string().min(1),
  JWT_SECRET_KEY: z.string().min(1),
  ML_UL: z.string().min(1),
  ML_CLIENT_ID: z.string().min(1),
  ML_CLIENT_SECRET: z.string().min(1),
  ML_REDIRECT_URI: z.string().min(1),
  PORT: z.string().default('3000'),
  VALUE_GENERATION: z.string(),
  VALUE_PARAGRAPH: z.string(),
})

export const env = envSchema.parse(process.env)
