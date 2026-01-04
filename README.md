# 📚 API Documentation - NestJS

Uma API RESTful desenvolvida com **NestJS** para documentação automática de endpoints.

## 🎯 Descrição do Projeto

Este projeto é uma API que fornece:

-
- **Documentação Automática**: Swagger UI integrado e exportação para Postman

## 🚀 Configuração Inicial

### 1. Instalar Dependências

```bash
npm install
```

### 2. Executar o Projeto

```bash
# modo de desenvolvimento (com reload automático)
npm run start:dev

# produção
npm run start:prod

# modo debug
npm start --debug --watch
```

O servidor será iniciado em `http://localhost:3000`

## 📖 Acessar a Documentação Swagger

Após iniciar o servidor, acesse:

```
http://localhost:3000/docs
```

Você verá a interface interativa do Swagger onde pode:

- Visualizar todos os endpoints disponíveis
- Testar os endpoints diretamente na interface
- Ver modelos de request e response
- Copiar comandos curl

## 📝 Endpoints Disponíveis

### 🔑 Autenticação

#### POST `/auth/login`

Autentica um usuário e retorna um token JWT.

**Request Body:**

```json
{
  "email": "usuario@example.com",
  "password": "senha123"
}
```

**Response (200 OK):**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "usuario@example.com",
    "name": "João Silva"
  }
}
```

---

### 👥 Usuários

#### POST `/users/register`

Registra um novo usuário no sistema.

**Request Body:**

```json
{
  "email": "novousuario@example.com",
  "password": "senha123",
  "name": "Novo Usuário"
}
```

**Response (201 Created):**

```json
{
  "id": 2,
  "email": "novousuario@example.com",
  "name": "Novo Usuário",
  "createdAt": "2026-01-04T10:30:00.000Z"
}
```

---

#### GET `/users`

Lista todos os usuários cadastrados. **Requer autenticação JWT**.

**Headers Obrigatórios:**

```
Authorization: Bearer {seu_token_jwt}
```

**Response (200 OK):**

```json
[
  {
    "id": 1,
    "email": "usuario@example.com",
    "name": "João Silva",
    "createdAt": "2026-01-04T09:00:00.000Z"
  },
  {
    "id": 2,
    "email": "novousuario@example.com",
    "name": "Novo Usuário",
    "createdAt": "2026-01-04T10:30:00.000Z"
  }
]
```

---

#### GET `/users/search`

Busca usuários com filtros opcionais.

**Query Parameters:**

- `name` (opcional): Filtra por nome
- `email` (opcional): Filtra por email
- `limit` (opcional): Limite de resultados (padrão: 10)

**Exemplo:**

```
GET /users/search?name=João&limit=5
```

**Response (200 OK):**

```json
[
  {
    "id": 1,
    "email": "usuario@example.com",
    "name": "João Silva",
    "createdAt": "2026-01-04T09:00:00.000Z"
  }
]
```

---

#### PUT `/users/:id`

Atualiza os dados de um usuário existente.

**Request Body:**

```json
{
  "name": "João Silva Atualizado",
  "email": "novoemail@example.com"
}
```

**Response (200 OK):**

```json
{
  "id": 1,
  "email": "novoemail@example.com",
  "name": "João Silva Atualizado",
  "updatedAt": "2026-01-04T11:00:00.000Z"
}
```

---

#### GET `/users/test/query`

Endpoint de teste com query parameters de diferentes tipos.

**Query Parameters:**

- `age` (opcional, number)
- `isActive` (opcional, boolean)
- `score` (opcional, float)

**Exemplo:**

```
GET /users/test/query?age=25&isActive=true&score=8.5
```

**Response (200 OK):**

```json
{
  "age": 25,
  "isActive": true,
  "score": 8.5
}
```

---

#### POST `/users/test/body`

Endpoint de teste com body contendo types diferentes.

**Request Body:**

```json
{
  "age": 30,
  "isActive": true
}
```

**Response (200 OK):**

```json
{
  "message": "Test successful",
  "data": {
    "age": 30,
    "isActive": true
  }
}
```

---

### 🏠 Root Endpoint

#### GET `/`

Retorna uma mensagem de bem-vindo.

**Response (200 OK):**

```json
{
  "message": "Hello World!"
}
```

---

## 📊 Documentação Adicional

#### GET `/api-doc`

Retorna a especificação OpenAPI em formato JSON. Usada pelo Swagger UI.

#### GET `/postman`

Exporta a coleção de endpoints em formato Postman. Importe este arquivo no Postman para testar todos os endpoints.

#### GET `/postman/environment`

Exporta variáveis de ambiente para uso no Postman (ex: URL base, tokens).

---

## 🔒 Autenticação JWT

Endpoints que requerem autenticação devem incluir o header:

```
Authorization: Bearer {seu_token_jwt}
```

### Como usar:

1. Faça login em `/auth/login` e copie o `access_token`
2. Em requisições protegidas, adicione o header acima
3. No Swagger UI, use o botão "Authorize" (🔒) no topo da página

---

## 🧪 Executar Testes

```bash
# testes unitários
npm run test

# modo watch (reroda ao modificar código)
npm run test:watch

# cobertura de testes
npm run test:cov

# testes E2E
npm run test:e2e
```

---

## 🛠️ Scripts Disponíveis

```bash
npm run build          # compila o projeto TypeScript
npm run format         # formata código com Prettier
npm run start          # inicia em produção
npm run start:dev      # inicia em desenvolvimento com reload
npm run start:debug    # inicia com debugger ativo
npm run start:prod     # executa versão compilada
npm run lint           # valida e corrige o código
npm run test           # executa testes
npm run test:watch     # testes em modo watch
npm run test:cov       # testes com cobertura
npm run test:debug     # testes com debugger
npm run test:e2e       # testes end-to-end
```

---

## 📚 Exemplos de Uso

### Com cURL

**Registrar novo usuário:**

```bash
curl -X POST http://localhost:3000/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@example.com",
    "password": "senha123",
    "name": "João Silva"
  }'
```

**Fazer login:**

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@example.com",
    "password": "senha123"
  }'
```

**Listar usuários (com token):**

```bash
curl -X GET http://localhost:3000/users \
  -H "Authorization: Bearer {seu_token_aqui}"
```

### Com Fetch API

```javascript
// Registrar usuário
const response = await fetch('http://localhost:3000/users/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'usuario@example.com',
    password: 'senha123',
    name: 'João Silva',
  }),
});
const data = await response.json();
console.log(data);
```

---

## 📦 Dependências Principais

- **@nestjs/core** - Framework NestJS
- **@nestjs/jwt** - Autenticação JWT
- **@nestjs/swagger** - Documentação Swagger
- **@nestjs/passport** - Estratégia de autenticação
- **passport-jwt** - Estratégia JWT para Passport
- **zod** - Validação de schemas
- **swagger-ui-express** - Interface Swagger

---

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
