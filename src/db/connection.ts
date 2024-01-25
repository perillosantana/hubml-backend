import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { env } from '@/env'
import * as schema from './schema'

const client = postgres(env.DB_URL, {
  user: env.DB_USERNAME,
  password: env.DB_PASSWORD,
})

export const db = drizzle(client, { schema })
