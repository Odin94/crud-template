import { pgTable, text, uuid } from "drizzle-orm/pg-core"

export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    saltedPasswordHash: text("salted_password_hash"),
})
