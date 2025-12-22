import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required').describe(JSON.stringify({ example: 'John Doe', description: 'Full name' })),
  email: z.email('Invalid email address').describe(JSON.stringify({ example: 'john@example.com', description: 'User email' })),
  password: z.string().min(6, 'Password must be at least 6 characters long').describe(JSON.stringify({ example: 'strongPa$$w0rd' })),
});

export type CreateUserDto = z.infer<typeof createUserSchema>;
