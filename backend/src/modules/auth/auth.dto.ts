import { z } from "zod";

export const registerDto = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .max(128)
    .regex(/[A-Z]/, "Password must include at least one uppercase letter")
    .regex(/[a-z]/, "Password must include at least one lowercase letter")
    .regex(/[0-9]/, "Password must include at least one number")
    .regex(
      /[^A-Za-z0-9]/,
      "Password must include at least one special character",
    ),
});

export const loginDto = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export type RegisterDto = z.infer<typeof registerDto>;
export type LoginDto = z.infer<typeof loginDto>;
