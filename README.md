# 📚 Gerador de Documentação Automática de APIs

Um sistema inteligente que **gera automaticamente documentação de APIs** em múltiplos formatos a partir do código-fonte.

## 🎯 O que é?

Este projeto é um gerador de **documentação automática** que:

- ✅ Analisa os controllers NestJS
- ✅ Extrai informações dos endpoints automaticamente
- ✅ Gera **Swagger UI** interativa (HTML)
- ✅ Exporta para **Postman** (coleção + environment)
- ✅ Cria especificação **OpenAPI** em JSON
- ✅ Sincroniza sempre com o código — nenhuma atualização manual necessária!

## 🚀 Como Usar

### 1. Instalar Dependências

```bash
npm install
```

### 2. Iniciar o Servidor

```bash
# desenvolvimento (com reload automático)
npm run start:dev

# produção
npm run start:prod
```

O servidor inicia em `http://localhost:3000`

## 🔍 Visualizar a Documentação

### Swagger UI (HTML Interativo)

A documentação fica **automaticamente gerada** e disponível em:

```
http://localhost:3000/docs
```

Aqui você pode:

- ✨ Visualizar todos os endpoints com suas descrições
- 🧪 Testar endpoints diretamente na interface
- 📄 Ver schemas de request e response
- 📋 Copiar comandos cURL

### OpenAPI JSON

Para acessar a especificação bruta em JSON:

```
http://localhost:3000/api-doc
```

### Exportar para Postman

Para usar no Postman:

1. Acesse `http://localhost:3000/postman` (coleção)
2. Acesse `http://localhost:3000/postman/environment` (variáveis de ambiente)
3. Importe ambos no Postman

## ⚙️ Como a Documentação é Gerada

### Decoradores Customizados

A documentação é extraída automaticamente usando o decorador `@ApiDescription`:

```typescript
@Post('login')
@ApiDescription('Autentica um usuário com email e senha')
async login(@Body() loginDto: LoginDto) {
  // ...
}
```

### Validação com Zod

Os schemas são validados com **Zod**, o que permite gerar tipos precisos:

```typescript
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type LoginDto = z.infer<typeof loginSchema>;
```

### Geração Automática

No `main.ts`, a documentação é gerada automaticamente:

```typescript
const docService = app.get(DocumentationService);
const document = docService.generateDocs();
SwaggerModule.setup('docs', app, document);
```

O `DocumentationService` analisa os controllers e constrói a especificação OpenAPI dinamicamente.

## 📡 Endpoints da Documentação

### GET `/docs`

Interface **Swagger UI** em HTML (o que você vê no navegador)

### GET `/api-doc`

Especificação **OpenAPI v3.0** em JSON (consumida pelo Swagger UI)

### GET `/postman`

Coleção Postman com todos os endpoints (importar no Postman)

### GET `/postman/environment`

Variáveis de ambiente Postman (URLs, tokens, etc.)

## 📝 Endpoints da API

### 🔑 Autenticação

### 🔑 Autenticação

**POST** `/auth/login` - Autentica usuário e retorna JWT

### 👥 Usuários

**POST** `/users/register` - Registra novo usuário  
**GET** `/users` - Lista usuários (requer JWT)  
**GET** `/users/search` - Busca usuários por nome/email  
**PUT** `/users/:id` - Atualiza usuário

### 🧪 Teste

**GET** `/users/test/query` - Teste com query params  
**POST** `/users/test/body` - Teste com body

> Todos esses endpoints são **descobertos e documentados automaticamente** pelo sistema!

## 🔧 Stack Técnico

**Documentação:**

- `@nestjs/swagger` - Integração com Swagger/OpenAPI
- `swagger-ui-express` - Interface HTML do Swagger
- `openapi-to-postmanv2` - Conversão para Postman

**Validação:**

- `zod` - Schema validation e type inference

**Autenticação:**

- `@nestjs/jwt` - Tokens JWT
- `passport-jwt` - Estratégia JWT

## 📦 Dependências Chave

```json
{
  "@nestjs/swagger": "^11.2.3",
  "swagger-ui-express": "^5.0.1",
  "openapi-to-postmanv2": "4.18.0",
  "zod": "^4.1.13",
  "@nestjs/jwt": "^11.0.2"
}
```

## 🎓 Como Adicionar um Novo Endpoint

A documentação é **automática**, então basta seguir este padrão:

```typescript
import { Controller, Post, Body, UsePipes } from '@nestjs/common';
import { ApiDescription } from '../common/decorators/api-description.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { z } from 'zod';

// 1. Defina o schema Zod (gera tipos e validação)
export const mySchema = z.object({
  name: z.string().describe('Nome do usuário'),
  age: z.number().describe('Idade em anos'),
});

export type MyDto = z.infer<typeof mySchema>;

// 2. Crie o endpoint com descrição
@Controller('my-resource')
export class MyController {
  @Post()
  @ApiDescription('Descrição clara do que o endpoint faz')
  @UsePipes(new ZodValidationPipe(mySchema))
  async create(@Body() dto: MyDto) {
    return { message: 'Sucesso!', data: dto };
  }
}
```

**Pronto!** A documentação será gerada automaticamente incluindo:

- ✅ Nome e tipo do endpoint
- ✅ Descrição com `@ApiDescription`
- ✅ Tipos de request (extraídos do Zod schema)
- ✅ Tipos de response (inferidos automaticamente)
- ✅ Campos obrigatórios vs opcionais
- ✅ Descrição de cada campo

## 🎯 Fluxo de Geração

```
Código com @ApiDescription
        ↓
    DocumentationService
        ↓
  Analisa Controllers
        ↓
  Extrai Schemas Zod
        ↓
  Gera OpenAPI Spec
        ↓
  ┌─────────────────┐
  ├─ Swagger UI (HTML)
  ├─ OpenAPI JSON
  └─ Postman Collection
```

## 📊 Arquivos Importantes

- [`src/documentation/documentation.service.ts`](src/documentation/documentation.service.ts) - Lógica de geração
- [`src/common/decorators/api-description.decorator.ts`](src/common/decorators/api-description.decorator.ts) - Decorador personalizado
- [`src/common/pipes/zod-validation.pipe.ts`](src/common/pipes/zod-validation.pipe.ts) - Validação com Zod
- [`src/main.ts`](src/main.ts) - Setup do Swagger

## 🧪 Testar a Documentação

```bash
# Inicia o servidor
npm run start:dev

# Acesse no navegador
# http://localhost:3000/docs
```

Após qualquer mudança no código, a documentação é regenerada automaticamente!

## 🛠️ Scripts

```bash
npm install              # instalar dependências
npm run start:dev        # iniciar com reload
npm run start:prod       # iniciar produção
npm run build            # compilar
npm run lint             # verificar código
npm run test             # rodar testes
```

## 📜 Licença

UNLICENSED
