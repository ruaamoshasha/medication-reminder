import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table (keeping the original one)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// New schema for medications
export const medications = pgTable("medications", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  dosage: text("dosage"),
  reminderTime: text("reminder_time").notNull(),
  frequency: text("frequency").notNull(),
  daysOfWeek: jsonb("days_of_week").notNull(),
  notes: text("notes"),
  userId: integer("user_id"),
});

export const insertMedicationSchema = createInsertSchema(medications).omit({
  id: true,
});

export type InsertMedication = z.infer<typeof insertMedicationSchema>;
export type Medication = typeof medications.$inferSelect;

// Schema for medication logs
export const medicationLogs = pgTable("medication_logs", {
  id: serial("id").primaryKey(),
  medicationId: integer("medication_id").notNull(),
  status: text("status").notNull(), // 'taken', 'missed', 'upcoming'
  scheduledTime: timestamp("scheduled_time").notNull(),
  takenTime: timestamp("taken_time"),
  userId: integer("user_id"),
});

export const insertMedicationLogSchema = createInsertSchema(medicationLogs).omit({
  id: true,
});

export type InsertMedicationLog = z.infer<typeof insertMedicationLogSchema>;
export type MedicationLog = typeof medicationLogs.$inferSelect;

// Extended schemas for frontend validation
export const medicationFormSchema = insertMedicationSchema.extend({
  name: z.string().min(1, { message: "Medication name is required" }),
  reminderTime: z.string().min(1, { message: "Reminder time is required" }),
  frequency: z.enum(["daily", "twice-daily", "weekly", "monthly", "custom"], {
    invalid_type_error: "Please select a frequency",
  }),
  daysOfWeek: z.record(z.string(), z.boolean()).refine(
    (days) => Object.values(days).some((selected) => selected),
    { message: "Please select at least one day" }
  ),
});
