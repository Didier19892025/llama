import { Role } from "@prisma/client";
import { z } from "zod";

export const userSchema = z.object({
    id: z.string().uuid().optional(),
    name: z.string().min(1, { message: "Name is required" }),
    role: z.nativeEnum(Role, { message: "Invalid role" }),
    user: z.string().min(1, { message: "User is required" }),
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
})

export type UserFormData = z.infer<typeof userSchema>;