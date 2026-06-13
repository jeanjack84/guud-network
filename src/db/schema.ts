import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  index,
} from "drizzle-orm/pg-core";

/**
 * Women's-health topics a woman might be looking for help with.
 * Practitioners are tagged with the topics they're trusted for; reviews
 * are tagged with the single topic they "helped with".
 */
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  // Short, plain-language description of the topic.
  description: text("description").notNull(),
  // Emoji used as a lightweight, warm icon in the UI.
  emoji: text("emoji").notNull(),
});

export const practitioners = pgTable(
  "practitioners",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    // e.g. "Gynaecologist", "Pelvic floor physiotherapist".
    title: text("title").notNull(),
    // Category slugs this practitioner is trusted for.
    specialties: text("specialties").array().notNull(),
    city: text("city").notNull(),
    country: text("country").notNull(),
    bio: text("bio").notNull(),
    // Whether they take remote/online consultations.
    telehealth: boolean("telehealth").notNull().default(false),
    acceptingNew: boolean("accepting_new").notNull().default(true),
    languages: text("languages").array().notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("practitioners_specialties_idx").on(t.specialties)],
);

/**
 * A positive recommendation from a woman who was helped. The Guud Network is
 * trust-first: reviews are recommendations, moderated for a constructive,
 * positive tone before they're published.
 */
export const reviews = pgTable(
  "reviews",
  {
    id: serial("id").primaryKey(),
    practitionerId: integer("practitioner_id")
      .notNull()
      .references(() => practitioners.id, { onDelete: "cascade" }),
    // Category slug this review is about.
    helpedWith: text("helped_with").notNull(),
    // First name or chosen handle; women's health is sensitive, so no full names required.
    authorName: text("author_name").notNull(),
    rating: integer("rating").notNull(), // 1-5, expected to skew positive
    body: text("body").notNull(),
    // "approved" once it passes positivity moderation; "pending" otherwise.
    status: text("status").notNull().default("approved"),
    // Set true for seeded/known-real reviews.
    verified: boolean("verified").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("reviews_practitioner_idx").on(t.practitionerId)],
);

export type Category = typeof categories.$inferSelect;
export type Practitioner = typeof practitioners.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;
