import {
  pgTable,
  timestamp,
  text,
  uuid,
  integer,
  serial,
  pgEnum,
  char,
  unique,
} from 'drizzle-orm/pg-core';
import { rooms } from '../room/schema';
import { users } from '../user/schema';
import { relations } from 'drizzle-orm';

export const statusEnum = pgEnum('event_status_enum', [
  'draft',
  'published',
  'cancelled',
]);

// Event Table
export const events = pgTable('events', {
  id: serial('id').primaryKey(),
  uuid: uuid('uuid').defaultRandom(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  description: text('description'),
  createdBy: integer('created_by').references(() => users.id, {
    onDelete: 'set null',
  }),
  roomId: text('room_id').references(() => rooms.id, { onDelete: 'set null' }),
  thumbnailUrl: text('thumbnail_url'),
  deletedAt: timestamp('deleted_at'),
  status: statusEnum('status').notNull().default('draft'),
});

// Participant Table
export const participant = pgTable(
  'events_participant',
  {
    id: serial('id').primaryKey(),
    clientId: text('client_id').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    firstName: text('first_name').notNull(),
    lastName: text('last_name').notNull(),
    email: text('email').notNull(),
    description: text('description'),
    eventID: integer('event_id')
      .notNull()
      .references(() => events.id, { onDelete: 'cascade' }),
    joinID: char('join_id', {
      length: 12,
    }).notNull(),
    updateCount: integer('update_count').notNull().default(0),
  },
  (table) => {
    return {
      unique: unique().on(table.clientId, table.eventID),
    };
  }
);

export const participantRelations = relations(participant, ({ one }) => ({
  event: one(events, {
    fields: [participant.eventID],
    references: [events.id],
  }),
}));

export const eventsRelations = relations(events, ({ many, one }) => ({
  participants: many(participant),
  host: one(users, {
    fields: [events.createdBy],
    references: [users.id],
  }),
}));

export type insertEvent = typeof events.$inferInsert;
export type selectEvent = typeof events.$inferSelect;
export type insertParticipant = typeof participant.$inferInsert;
export type selectParticipant = typeof participant.$inferSelect;

export type eventStatusEnum = 'draft' | 'published' | 'cancelled';

export const insertParticipant = participant.$inferInsert;
export const selectParticipant = participant.$inferSelect;
