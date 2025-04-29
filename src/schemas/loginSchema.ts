import { z } from "zod";

// Validation schema
export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(4, 'Password must be at least 6 characters'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;