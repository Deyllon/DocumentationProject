import { z } from 'zod';

export const testSchema = z.object({
  age: z.number().describe(JSON.stringify({ 
    example: 25, 
    description: 'Idade do usuário' 
  })),
  isActive: z.boolean().describe(JSON.stringify({ 
    example: true, 
    description: 'Se o usuário está ativo' 
  })),
  score: z.number().optional().describe(JSON.stringify({ 
    example: 95.5, 
    description: 'Pontuação do usuário' 
  })),
});

export type TestDto = z.infer<typeof testSchema>;
