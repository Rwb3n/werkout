import * as z from "zod";
// isValidPhoneNumber import removed as unused
// import { isValidPhoneNumber } from 'react-phone-number-input/input'

// MAX_ARRAY_LENGTH import removed as unused
// const MAX_ARRAY_LENGTH = 5;

// Define constants or fetch from a config/API if they change often
// const GOALS_INTERESTS = ["Lose Weight", "Build Muscle", "Improve Endurance", "Learn New Skill", "Stay Active"];
// const SPECIALTIES = ["Weight Loss", "Strength Training", "Yoga", "Pilates", "Running Coach", "Nutrition"];

// TODO: Define actual lists for multi-select/tags/radio
const FITNESS_LEVELS = ["beginner", "intermediate", "advanced"] as const;
const PROVIDER_TYPES = ["trainer", "coach", "group_leader", "gym", "studio"] as const;

// --- Location Schema (Shared) ---
const locationSchema = z.object({
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State/Province is required"), // Adjust field name if needed
  country: z.string().min(1, "Country is required"),
  // TODO: Add postal code, address line, coordinates if using geocoding
});

// --- Contact Preferences Schema (Shared) ---
// Flattened for easier RHF integration
const contactPreferencesSchema = z.object({
    contactEmail: z.boolean().default(true),
    contactWhatsapp: z.boolean().default(false),
    contactPhone: z.boolean().default(false),
}); 
// TODO: Add cross-field validation in the onSubmit handler 
// in the form component to ensure at least one is selected.

// --- Seeker Schemas ---

export const seekerStep1Schema = z.object({
  level: z.enum(FITNESS_LEVELS, { required_error: "Please select your fitness level" }),
  // Using refine for multi-select/tag inputs (example: array of strings)
  goals: z.array(z.string()).min(1, "Select at least one goal"), 
  interests: z.array(z.string()).min(1, "Select at least one interest"), 
});
export type SeekerStep1Data = z.infer<typeof seekerStep1Schema>;

export const seekerStep2Schema = locationSchema; // Reuse location schema
export type SeekerStep2Data = z.infer<typeof seekerStep2Schema>;

export const seekerStep3Schema = contactPreferencesSchema; // Reuse contact schema
export type SeekerStep3Data = z.infer<typeof seekerStep3Schema>;

// --- Provider Schemas ---

export const providerStep1Schema = z.object({
  bio: z.string().min(50, "Please provide a more detailed bio (min 50 chars).").max(1000, "Bio exceeds maximum length (1000 chars)."),
  experience: z.coerce.number().min(0, "Experience cannot be negative.").optional(),
  languages: z.array(z.string()).optional(),
  responseTime: z.enum(['within_hour', 'within_day', 'within_few_days', 'other']).optional(),
  providerType: z.enum(PROVIDER_TYPES, {
    required_error: "Please select your provider type.",
  }),
  credentials: z.array(z.object({
    id: z.string().optional(), // For potential future editing
    title: z.string().min(1, "Credential title is required."),
    organization: z.string().min(1, "Organization name is required."),
    year: z.coerce.number().optional(),
  })).optional(),
});
export type ProviderStep1Data = z.infer<typeof providerStep1Schema>;

const credentialSchema = z.object({
    id: z.string().optional(), // For potential editing/key prop
    title: z.string().min(1, "Credential title is required"),
    organization: z.string().min(1, "Issuing organization is required"),
    year: z.coerce.number().optional(), // Optional year
    // isVerified could be added later by admin
});

export const providerStep2Schema = z.object({
    credentials: z.array(credentialSchema).min(0), // Allow empty initially, maybe require 1 later?
});
export type ProviderStep2Data = z.infer<typeof providerStep2Schema>;

export const providerStep3Schema = locationSchema; // Reuse location schema
export type ProviderStep3Data = z.infer<typeof providerStep3Schema>;

// TODO: Add schemas for Provider Step 4 (Contact)

// --- Combined Schemas --- 
// Used by the wizard form orchestrators

export const seekerWizardSchema = seekerStep1Schema.merge(seekerStep2Schema).merge(seekerStep3Schema);
export type SeekerWizardData = z.infer<typeof seekerWizardSchema>;

export const providerWizardSchema = providerStep1Schema
                                        .merge(providerStep2Schema)
                                        .merge(providerStep3Schema);
                                        // TODO: Merge Step 4 schema when available
export type ProviderWizardData = z.infer<typeof providerWizardSchema>; 