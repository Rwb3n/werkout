import * as z from "zod";

// Schema for Login Form
export const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }), // Basic check, more complexity later if needed
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Schema for Signup Form
export const signupSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  // TODO: Add password confirmation if needed
  userType: z.enum(["seeker", "provider"], { required_error: "Please select an account type" }),
  // TODO: Add location schema based on implementation
  // TODO: Add terms acceptance schema
});

export type SignupFormData = z.infer<typeof signupSchema>; 