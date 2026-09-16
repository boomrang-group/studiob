import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const aiUsageTable = pgTable("ai_usage", {
  userId: text("user_id").primaryKey(),
  requestCount: integer("request_count").notNull().default(0),
  windowStart: timestamp("window_start", { withTimezone: true })
    .notNull()
    .defaultNow(),
});