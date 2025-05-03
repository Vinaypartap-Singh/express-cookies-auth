import { z } from "zod";

export const registerSchemaValidation = z
  .object({
    name: z
      .string({ message: "Name is required" })
      .min(6, { message: "Min 6 Character" })
      .max(40, { message: "Maximum 40 character allowed in name" }),
    email: z
      .string({ message: "Email is required" })
      .email({ message: "please use the correct email" }),
    password: z
      .string({ message: "Password is required" })
      .min(8, { message: "password must be 8 characters" }),
    confirmPassword: z
      .string({ message: "Confirm Password is required" })
      .min(8, { message: "must be same as password" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password does not match",
    path: ["confirmPassword"],
  });

export const loginSchemaValidation = z.object({
  email: z
    .string({ message: "Email is required" })
    .email({ message: "please use the correct email" }),
  password: z
    .string({ message: "Password is required" })
    .min(6, { message: "password must be 6 characters" }),
});
