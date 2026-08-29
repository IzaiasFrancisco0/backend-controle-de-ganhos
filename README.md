# Controle de Ganhos - Backend API

Esta é a API RESTful desenvolvida para o sistema de controle de ganhos, construída com Node.js, TypeScript e MongoDB. Ela fornece as funcionalidades de autenticação, gerenciamento de clientes e acompanhamento de vendas.

## Funcionalidades
- **Autenticação Segura:** Login e cadastro utilizando JWT (JSON Web Tokens) e criptografia de senhas com `bcrypt`.
- **Gerenciamento de Clientes:** CRUD completo de clientes.
- **Controle de Vendas:** Registro e acompanhamento de vendas associadas a clientes.
- **Validação de Dados:** Utilização de `zod` para validação robusta de esquemas de entrada.

## Tecnologias
- [Node.js](https://nodejs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/) (com [Mongoose](https://mongoosejs.com/))
- [JWT](https://jwt.io/)
- [Zod](https://zod.dev/)

## Pré-requisitos
- Node.js (v18+)
- MongoDB (local ou em nuvem)

## Instalação

1. Clone o repositório e navegue até a pasta `backend`.
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Crie um arquivo `.env` na raiz da pasta `backend` com as seguintes variáveis:
   ```env
   PORT=3000
   MONGODB_URI=sua_uri_do_mongodb
   JWT_SECRET=seu_segredo_jwt
   ```

## Comandos Disponíveis

- **Modo de Desenvolvimento:**
  ```bash
  npm run dev
  ```
- **Build de Produção:**
  ```bash
  npm run build
  ```
- **Iniciar em Produção:**
  ```bash
  npm start
  ```
