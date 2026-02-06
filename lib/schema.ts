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
    canTakeAppointments: boolean("can_take_appointments").default(false), // If true, this user can be assigned to appointments
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

    // Core Identity (M = Mandatory, O = Optional)
    firstName: text("first_name").notNull(), // M
    lastName: text("last_name").notNull(), // M
    mobile: text("mobile").notNull(), // M - Primary contact
    email: text("email"), // O

    // Demographics
    dob: timestamp("dob", { mode: "date" }), // O - Date of Birth
    gender: text("gender"), // O - Male, Female, Other
    bloodGroup: text("blood_group"), // O - A+, A-, B+, B-, AB+, AB-, O+, O-

    // Address
    addressLine1: text("address_line1"), // O
    addressLine2: text("address_line2"), // O
    city: text("city"), // O
    state: text("state"), // O
    pincode: text("pincode"), // O

    // Medical Information
    medicalHistory: text("medical_history"), // O - Free text for conditions, allergies, etc.
    allergies: text("allergies"), // O - Known allergies
    currentMedications: text("current_medications"), // O

    // Emergency Contact
    emergencyContactName: text("emergency_contact_name"), // O
    emergencyContactPhone: text("emergency_contact_phone"), // O
    emergencyContactRelation: text("emergency_contact_relation"), // O

    // Preferences & Metadata
    preferredLanguage: text("preferred_language").default("English"), // O
    source: text("source"), // O - Walk-in, Referral, Website, Social Media, etc.
    referredBy: text("referred_by"), // O - Name of referrer if applicable
    tags: jsonb("tags").$type<string[]>().default([]), // O - VIP, Senior, Insurance, etc.
    notes: text("notes"), // O - Internal notes

    // Branch Association
    branchId: uuid("branch_id").references(() => branches.id, { onDelete: "set null" }),

    // Status
    isActive: boolean("is_active").default(true),

    // Audit
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
    createdBy: text("created_by").references(() => users.id, { onDelete: "set null" }),
    updatedBy: text("updated_by").references(() => users.id, { onDelete: "set null" }),
})

export const appointments = pgTable("appointments", {
    id: uuid("id").defaultRandom().primaryKey(),

    // Core References
    branchId: uuid("branch_id")
        .notNull()
        .references(() => branches.id, { onDelete: "cascade" }),
    customerId: uuid("customer_id")
        .notNull()
        .references(() => customers.id, { onDelete: "cascade" }),
    serviceId: uuid("service_id")
        .notNull()
        .references(() => services.id, { onDelete: "restrict" }),
    staffId: text("staff_id")
        .notNull()
        .references(() => users.id, { onDelete: "restrict" }),

    // Timing - using date + time strings for easier querying
    appointmentDate: timestamp("appointment_date", { mode: "date" }).notNull(),
    startTime: text("start_time").notNull(), // "09:00" format (HH:mm)
    endTime: text("end_time").notNull(), // "09:30" format
    duration: integer("duration").notNull(), // Duration in minutes

    // Status
    status: text("status").default("SCHEDULED"), // SCHEDULED, COMPLETED, CANCELLED, NO_SHOW

    // Additional Info
    notes: text("notes"),
    cancellationReason: text("cancellation_reason"),

    // Pricing snapshot at booking time
    servicePrice: integer("service_price"),

    // Audit
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
    createdBy: text("created_by").references(() => users.id, { onDelete: "set null" }),
    updatedBy: text("updated_by").references(() => users.id, { onDelete: "set null" }),
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
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
    createdBy: text("created_by").references(() => users.id, { onDelete: "set null" }),
    updatedBy: text("updated_by").references(() => users.id, { onDelete: "set null" }),
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
    createdBy: text("created_by").references(() => users.id, { onDelete: "set null" }),
    updatedBy: text("updated_by").references(() => users.id, { onDelete: "set null" }),
})

// --- ROLES ---
// Roles can be branch-specific (branchId set) or global/system roles (branchId null, e.g., ADMIN)
export const roles = pgTable("roles", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    branchId: uuid("branch_id").references(() => branches.id, { onDelete: "cascade" }),
    description: text("description"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
    createdBy: text("created_by").references(() => users.id, { onDelete: "set null" }),
    updatedBy: text("updated_by").references(() => users.id, { onDelete: "set null" }),
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

// --- USER-BRANCH-ROLE MAPPING ---
// Maps users to specific roles within specific branches.
// A user can have one role per branch they are assigned to.
export const userBranchRoles = pgTable(
    "user_branch_roles",
    {
        userId: text("user_id")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        branchId: uuid("branch_id")
            .notNull()
            .references(() => branches.id, { onDelete: "cascade" }),
        roleId: uuid("role_id")
            .notNull()
            .references(() => roles.id, { onDelete: "cascade" }),
        createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
    },
    (t) => ({
        pk: primaryKey({ columns: [t.userId, t.branchId] }),
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
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
    createdBy: text("created_by").references(() => users.id, { onDelete: "set null" }),
    updatedBy: text("updated_by").references(() => users.id, { onDelete: "set null" }),
})

// --- BRANCH-FEATURE ENABLEMENT ---
// Controls which features are enabled for each branch
export const branchFeatures = pgTable(
    "branch_features",
    {
        branchId: uuid("branch_id")
            .notNull()
            .references(() => branches.id, { onDelete: "cascade" }),
        featureId: uuid("feature_id")
            .notNull()
            .references(() => features.id, { onDelete: "cascade" }),
        isEnabled: boolean("is_enabled").default(true),
        createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
        updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
    },
    (t) => ({
        pk: primaryKey({ columns: [t.branchId, t.featureId] }),
    })
)

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

// --- SERVICES (Master Catalog) ---
// Master list of all services the clinic offers (e.g., "General Consultation", "X-Ray")
export const services = pgTable("services", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    code: text("code").unique(), // Optional short code like "GC", "XRAY"
    description: text("description"),
    category: text("category"), // e.g., "Consultation", "Diagnostic", "Treatment"
    defaultDuration: integer("default_duration").default(30), // Duration in minutes
    defaultPrice: integer("default_price"), // Default price in smallest currency unit (cents/paisa)
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
    createdBy: text("created_by").references(() => users.id, { onDelete: "set null" }),
    updatedBy: text("updated_by").references(() => users.id, { onDelete: "set null" }),
})

// --- BRANCH OPERATING HOURS ---
// Operating hours for each branch per day of week - supports multiple slots per day
export const branchOperatingHours = pgTable(
    "branch_operating_hours",
    {
        branchId: uuid("branch_id")
            .notNull()
            .references(() => branches.id, { onDelete: "cascade" }),
        dayOfWeek: integer("day_of_week").notNull(), // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        slotIndex: integer("slot_index").notNull().default(0), // 0, 1, 2... for multiple slots per day
        openTime: text("open_time").notNull(), // "09:00" format
        closeTime: text("close_time").notNull(), // "18:00" format
        isClosed: boolean("is_closed").default(false), // If true, branch is closed this day (applies to entire day when slotIndex=0)
        createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
        updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
    },
    (t) => ({
        // One entry per branch per day per slot
        pk: primaryKey({ columns: [t.branchId, t.dayOfWeek, t.slotIndex] }),
    })
)

// --- BRANCH SERVICES ---
// Services offered at each branch (subset of master services with optional branch-specific pricing)
export const branchServices = pgTable(
    "branch_services",
    {
        branchId: uuid("branch_id")
            .notNull()
            .references(() => branches.id, { onDelete: "cascade" }),
        serviceId: uuid("service_id")
            .notNull()
            .references(() => services.id, { onDelete: "cascade" }),
        price: integer("price"), // Branch-specific price (null = use default from services)
        duration: integer("duration"), // Branch-specific duration (null = use default)
        isActive: boolean("is_active").default(true),
        createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
        updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
    },
    (t) => ({
        pk: primaryKey({ columns: [t.branchId, t.serviceId] }),
    })
)

// --- STAFF WORKING HOURS ---
// Working hours for each staff member per day of week - supports multiple slots per day
export const staffWorkingHours = pgTable(
    "staff_working_hours",
    {
        userId: text("user_id")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        branchId: uuid("branch_id")
            .notNull()
            .references(() => branches.id, { onDelete: "cascade" }),
        dayOfWeek: integer("day_of_week").notNull(), // 0 = Sunday, ..., 6 = Saturday
        slotIndex: integer("slot_index").notNull().default(0), // 0, 1, 2... for multiple slots per day
        startTime: text("start_time").notNull(), // "09:00" format
        endTime: text("end_time").notNull(), // "17:00" format
        isOff: boolean("is_off").default(false), // If true, staff is off this day (applies to entire day when slotIndex=0)
        createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
        updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
    },
    (t) => ({
        // One entry per user per branch per day per slot
        pk: primaryKey({ columns: [t.userId, t.branchId, t.dayOfWeek, t.slotIndex] }),
    })
)

// --- STAFF QUALIFICATIONS ---
// Qualifications, degrees, certificates for staff
export const staffQualifications = pgTable("staff_qualifications", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(), // "degree", "certificate", "license", "specialization"
    name: text("name").notNull(), // e.g., "MBBS", "MD Cardiology", "RN License"
    institution: text("institution"), // e.g., "AIIMS Delhi"
    year: integer("year"), // Year of completion/issue
    expiryDate: timestamp("expiry_date", { mode: "date" }), // For licenses/certificates that expire
    documentUrl: text("document_url"), // Link to uploaded document
    isVerified: boolean("is_verified").default(false),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
})

// --- STAFF SERVICES ---
// Services a staff member can provide at a specific branch
export const staffServices = pgTable(
    "staff_services",
    {
        userId: text("user_id")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        branchId: uuid("branch_id")
            .notNull()
            .references(() => branches.id, { onDelete: "cascade" }),
        serviceId: uuid("service_id")
            .notNull()
            .references(() => services.id, { onDelete: "cascade" }),
        createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
    },
    (t) => ({
        pk: primaryKey({ columns: [t.userId, t.branchId, t.serviceId] }),
    })
)

// --- STAFF SERVICE CATEGORIES ---
// Categories of services a staff member can provide at a specific branch
// This allows broader assignment (e.g. "Everything in Physiotherapy")
export const staffServiceCategories = pgTable(
    "staff_service_categories",
    {
        userId: text("user_id")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        branchId: uuid("branch_id")
            .notNull()
            .references(() => branches.id, { onDelete: "cascade" }),
        category: text("category").notNull(), // e.g. "Consultation", "Therapy" matches services.category
        createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
    },
    (t) => ({
        pk: primaryKey({ columns: [t.userId, t.branchId, t.category] }),
    })
)
