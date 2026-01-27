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

// --- USERS ---
export const users = pgTable("user", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: text("name"),
    firstName: text("first_name"),
    lastName: text("last_name"),
    mobile: text("mobile"),
    dob: timestamp("dob", { mode: "date" }),
    email: text("email").notNull().unique(),
    emailVerified: timestamp("emailVerified", { mode: "date" }),
    image: text("image"),
    role: text("role").default("STAFF"), // Legacy/Simple Role
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
    name: text("name").notNull(),
    email: text("email"),
    phone: text("phone"),
    address: text("address"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
})

export const appointments = pgTable("appointments", {
    id: uuid("id").defaultRandom().primaryKey(),
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
    customerId: uuid("customer_id").references(() => customers.id),
    appointmentId: uuid("appointment_id").references(() => appointments.id),
    amount: integer("amount").notNull(), // in cents/paisa
    currency: text("currency").default("INR"),
    method: text("method").notNull(), // CASH, UPI, CARD
    status: text("status").default("COMPLETED"), // PENDING, COMPLETED
    date: timestamp("date", { mode: "date" }).defaultNow(),
})

// --- BRANCHES ---
export const branches = pgTable("branches", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    address: text("address"),
    phone: text("phone"),
    email: text("email"),
    pinCode: text("pin_code"),
    state: text("state"),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
})

// --- ROLES ---
export const roles = pgTable("roles", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull().unique(),
    description: text("description"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
})

// --- USER-BRANCH MAPPING ---
// Maps users to specific branches. 
export const userBranches = pgTable(
    "user_branches",
    {
        userId: text("user_id")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        branchId: uuid("branch_id")
            .notNull()
            .references(() => branches.id, { onDelete: "cascade" }),
        createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
    },
    (t) => ({
        pk: primaryKey({ columns: [t.userId, t.branchId] }),
    })
)

// --- ROLES MAPPING (Optional if M:N, but likely 1:N or using roleId in users) ---
export const userRoles = pgTable(
    "user_roles",
    {
        userId: text("user_id")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        roleId: uuid("role_id")
            .notNull()
            .references(() => roles.id, { onDelete: "cascade" }),
        createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
    },
    (t) => ({
        pk: primaryKey({ columns: [t.userId, t.roleId] }),
    })
)

// --- FEATURES ---
export const features = pgTable("features", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull().unique(), // e.g. "Appointments"
    key: text("key").notNull().unique(), // e.g. "appointments"
    description: text("description"),
    // Defines which actions are valid for this feature. E.g. ["view", "edit"]
    availableActions: jsonb("available_actions").$type<string[]>().default(["view", "add", "edit", "delete"]),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
})

// --- ROLE-FEATURE PERMISSIONS ---
export const roleFeaturePermissions = pgTable(
    "role_feature_permissions",
    {
        roleId: uuid("role_id")
            .notNull()
            .references(() => roles.id, { onDelete: "cascade" }),
        featureId: uuid("feature_id")
            .notNull()
            .references(() => features.id, { onDelete: "cascade" }),
        canView: boolean("can_view").default(false),
        canAdd: boolean("can_add").default(false),
        canEdit: boolean("can_edit").default(false),
        canDelete: boolean("can_delete").default(false),
        createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
        updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
    },
    (t) => ({
        pk: primaryKey({ columns: [t.roleId, t.featureId] }),
    })
)
