import { pgTable, serial, varchar, timestamp, text } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"
import { index } from "drizzle-orm/pg-core"


export const healthCheck = pgTable("health_check", {
	id: serial().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

export const registrations = pgTable(
  "registrations",
  {
    id: serial().primaryKey(),
    name: varchar("name", { length: 50 }).notNull(),
    phone: varchar("phone", { length: 11 }).notNull(),
    role: varchar("role", { length: 20 }).notNull(),
    occupation: varchar("occupation", { length: 30 }).notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("registrations_created_at_idx").on(table.created_at),
    index("registrations_role_idx").on(table.role),
  ]
);

export const siteSettings = pgTable(
  "site_settings",
  {
    key: varchar("key", { length: 50 }).primaryKey(),
    value: text("value").notNull(),
  }
);

export const sponsors = pgTable(
  "sponsors",
  {
    id: serial().primaryKey(),
    company_name: varchar("company_name", { length: 200 }).notNull(),
    contact_name: varchar("contact_name", { length: 50 }).notNull(),
    phone: varchar("phone", { length: 11 }).notNull(),
    wechat: varchar("wechat", { length: 50 }).notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("sponsors_created_at_idx").on(table.created_at),
  ]
);
