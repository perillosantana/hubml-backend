import { createId } from '@paralleldrive/cuid2'
import { users } from './users'
import { relations } from 'drizzle-orm'
import { integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const descriptions = pgTable('descriptions', {
  id: text('id')
    .$defaultFn(() => createId())
    .primaryKey(),
  description: text('description'),
  value: integer('value'),
  productId: text('product_id').unique(),
  status: text('status').$type<'pending' | 'approved'>().default('pending'),
  createdIn: timestamp('created_in').defaultNow(),
  userId: text('login').references(() => users.login),
})

export const descriptionsRelations = relations(descriptions, ({ one }) => ({
  descriptions: one(users, {
    fields: [descriptions.userId],
    references: [users.id],
  }),
}))
