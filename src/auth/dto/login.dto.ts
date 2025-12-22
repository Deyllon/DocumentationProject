import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email('Invalid email address').describe(JSON.stringify({ example: 'john@example.com' })),
  password: z.string().min(1, 'Password is required').describe(JSON.stringify({ example: 'strongPa$$w0rd' })),
});

export type LoginDto = z.infer<typeof loginSchema>;
