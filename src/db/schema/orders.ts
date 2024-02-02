import { createId } from '@paralleldrive/cuid2'
import { users } from './users'
import { relations } from 'drizzle-orm'
import { integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const orders = pgTable('orders', {
  id: text('id')
    .$defaultFn(() => createId())
    .primaryKey(),
  document: text('document'),
  value: integer('value'),
  status: text('status')
    .$type<'pending' | 'approved' | 'canceled'>()
    .default('pending'),
  codeImage: text('code_image'),
  code: text('code'),
  paymentId: text('payment_id'),
  ticketUrl: text('ticket_url'),
  expiration: text('expiration'),
  created: timestamp('created').defaultNow(),
  userId: text('login').references(() => users.login),
})

export const ordersRelations = relations(orders, ({ one }) => ({
  orders: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
}))
