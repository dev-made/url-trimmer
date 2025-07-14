import {
  integer,
  serial,
  text,
  varchar,
  pgTable,
  foreignKey,
  timestamp,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const links = pgTable('links', {
  id: serial('id').primaryKey(),
  originalUrl: text('original_url').unique(),
  shortUrl: text('short_url').unique(), // @TODO: max 20
  alias: text('alias'), // @TODO: max 20
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').default(new Date()),
});

export const analytics = pgTable(
  'analytics',
  {
    id: serial('id').primaryKey(),
    linkId: integer('link_id'),
    ip: varchar('ip'), // max 255
    createdAt: timestamp('created_at').default(new Date()),
  },
  (table) => [
    foreignKey({
      name: 'analytics_link_id_fkey',
      columns: [table.linkId],
      foreignColumns: [links.id],
    })
      .onDelete('cascade')
      .onUpdate('cascade'),
  ],
);

export const linksRelations = relations(links, ({ many }) => ({
  visits: many(analytics),
}));
