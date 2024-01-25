import type { Config } from 'drizzle-kit'
import { env } from '@/env'

export default {
  schema: './src/db/schema/index.ts',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    connectionString: env.DB_URL,
    user: env.DB_USERNAME,
    password: env.DB_PASSWORD,
  },
} satisfies Config
