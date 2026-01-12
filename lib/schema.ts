import {
    pgTable,
    text,
    timestamp,
    boolean,
    uuid,
    jsonb,
    integer,
    primaryKey,
} from "drizzle-orm/pg-core"
import type { AdapterAccount } from "@auth/core/adapters"

// --- CLINIC (TENANT) ---
export const clinics = pgTable("clinics", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").unique().notNull(), // for subdomain
    description: text("description"),
    logoUrl: text("logo_url"),
    config: jsonb("config").$type<Record<string, any>>().default({}),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
})

// --- USERS ---
export const users = pgTable("user", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: text("name"),
    email: text("email").notNull().unique(),
    emailVerified: timestamp("emailVerified", { mode: "date" }),
    image: text("image"),
    role: text("role").default("STAFF"), // ADMIN, STAFF
    clinicId: uuid("clinic_id").references(() => clinics.id),
})

// --- AUTH TABLES (NextAuth) ---
export const accounts = pgTable(
    "account",
    {
        userId: text("userId")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        type: text("type").$type<AdapterAccount["type"]>().notNull(),
        provider: text("provider").notNull(),
        providerAccountId: text("providerAccountId").notNull(),
        refresh_token: text("refresh_token"),
        access_token: text("access_token"),
        expires_at: integer("expires_at"),
        token_type: text("token_type"),
        scope: text("scope"),
        id_token: text("id_token"),
        session_state: text("session_state"),
    },
    (account) => ({
        compoundKey: primaryKey({
            columns: [account.provider, account.providerAccountId],
        }),
    })
)

export const sessions = pgTable("session", {
    sessionToken: text("sessionToken").primaryKey(),
    userId: text("userId")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    expires: timestamp("expires", { mode: "date" }).notNull(),
})

export const verificationTokens = pgTable(
    "verificationToken",
    {
        identifier: text("identifier").notNull(),
        token: text("token").notNull(),
        expires: timestamp("expires", { mode: "date" }).notNull(),
    },
    (vt) => ({
        compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
    })
)

// --- MANAGEMENT MODULE ---

export const customers = pgTable("customers", {
    id: uuid("id").defaultRandom().primaryKey(),
    clinicId: uuid("clinic_id").notNull().references(() => clinics.id),
    name: text("name").notNull(),
    email: text("email"),
    phone: text("phone"),
    address: text("address"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
})

export const appointments = pgTable("appointments", {
    id: uuid("id").defaultRandom().primaryKey(),
    clinicId: uuid("clinic_id").notNull().references(() => clinics.id),
    customerId: uuid("customer_id").references(() => customers.id),
    title: text("title").notNull(),
    startTime: timestamp("start_time", { mode: "date" }).notNull(),
    endTime: timestamp("end_time", { mode: "date" }).notNull(),
    status: text("status").default("SCHEDULED"), // SCHEDULED, COMPLETED, CANCELLED, NOSHOW
    notes: text("notes"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
})

export const payments = pgTable("payments", {
    id: uuid("id").defaultRandom().primaryKey(),
    clinicId: uuid("clinic_id").notNull().references(() => clinics.id),
    customerId: uuid("customer_id").references(() => customers.id),
    appointmentId: uuid("appointment_id").references(() => appointments.id),
    amount: integer("amount").notNull(), // in cents/paisa
    currency: text("currency").default("INR"),
    method: text("method").notNull(), // CASH, UPI, CARD
    status: text("status").default("COMPLETED"), // PENDING, COMPLETED
    date: timestamp("date", { mode: "date" }).defaultNow(),
})
