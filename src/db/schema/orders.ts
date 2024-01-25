import { createId } from '@paralleldrive/cuid2'
import { users } from './users'
import { relations } from 'drizzle-orm'
import { integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const orders = pgTable('orders', {
  id: text('id')
    .$defaultFn(() => createId())
    .primaryKey(),
  description: text('description'),
  value: integer('value'),
  productId: text('product_id'),
  createdIn: timestamp('created_in').defaultNow(),
  userId: text('login').references(() => users.login),
})

export const ordersRelations = relations(orders, ({ one }) => ({
  orders: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
}))
