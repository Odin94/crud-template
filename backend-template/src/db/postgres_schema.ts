import { pgTable, text, uuid } from "drizzle-orm/pg-core"
import { z } from "zod"

export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    saltedPasswordHash: text("salted_password_hash"),
})

export const userSchema = z.object({
    id: z.string(),
    email: z.string(),
    name: z.string().optional(),
})
export type User = z.infer<typeof userSchema>

export const userWithPasswordSchema = userSchema.extend({
    saltedPasswordHash: z.string(),
})
export type UserWithPassword = z.infer<typeof userWithPasswordSchema>
