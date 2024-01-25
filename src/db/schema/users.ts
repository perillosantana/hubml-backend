import { createId } from '@paralleldrive/cuid2'
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'

export const userRoleEnum = pgEnum('user_role', ['manager', 'customer'])

export const users = pgTable('users', {
  id: text('id')
    .$defaultFn(() => createId())
    .primaryKey(),
  login: text('login').unique(),
  password: text('password'),
  name: text('name'),
  phone: text('phone'),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  seller: integer('seller'),
  active: boolean('active').$default(() => false),
  balance: integer('balance').$default(() => 0),
  createdIn: timestamp('created_in').defaultNow(),
  lastInteractionIn: timestamp('last_interaction_in').defaultNow(),
})
