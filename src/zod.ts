import { z } from "zod";

export const signupUser = z.object({
  email: z.string().email(),
  password: z.string(),
  name: z.string(),
});

export type SignUpUser = z.infer<typeof signupUser>;

export const signinUser = z.object({
  email: z.string().email(),
  password: z.string(),
});
