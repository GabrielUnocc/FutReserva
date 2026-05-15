# ⚽ FutReserva

Sistema web de gestão e agendamento de campos de futebol society.

**Disciplina:** Desenvolvimento Web  
**Integrantes:** Bernardo, Gabriel Rosario, Rafael Lucas, Rafael Machado, Decarli

---

## 🛠️ Tecnologias

| Camada | Tecnologia |
|---|---|
| Backend | Node.js + Express.js |
| Frontend | React.js + Vite + Tailwind CSS |
| Banco de Dados | PostgreSQL |
| ORM | Prisma |
| Autenticação | JWT + bcryptjs |

---

## 📋 Pré-requisitos

Antes de começar, instale:

- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- [PostgreSQL](https://www.postgresql.org/download/) (versão 14 ou superior)
- [Git](https://git-scm.com/)

---

## 🚀 Como rodar o projeto

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/futreserva.git
cd futreserva
```

---

### 2. Configure o Banco de Dados

Abra o PostgreSQL e crie o banco de dados:

```sql
CREATE DATABASE futreserva;
```

---

### 3. Configure o Backend

```bash
# Entre na pasta do backend
cd backend

# Instale as dependências
npm install

# Copie o arquivo de variáveis de ambiente
cp .env.example .env
```

Abra o arquivo `.env` e preencha com suas informações:

```env
DATABASE_URL="postgresql://SEU_USUARIO:SUA_SENHA@localhost:5432/futreserva"
JWT_SECRET="futreserva_chave_secreta_2025"
PORT=3001
```

> ⚠️ Substitua `SEU_USUARIO` e `SUA_SENHA` pelos dados do seu PostgreSQL.  
> O usuário padrão costuma ser `postgres`.

Execute as migrations para criar as tabelas:

```bash
npx prisma migrate dev --name init
```

Inicie o servidor backend:

```bash
# Modo desenvolvimento (reinicia automaticamente)
npm run dev

# ou modo normal
npm start
```

O backend estará disponível em: **http://localhost:3001**

Para testar, acesse: http://localhost:3001 — deve retornar:
```json
{ "mensagem": "API FutReserva funcionando!", "versao": "1.0.0" }
```

---

### 4. Configure o Frontend

Abra um **novo terminal** e execute:

```bash
# Entre na pasta do frontend
cd frontend

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

O frontend estará disponível em: **http://localhost:5173**

---

## 🔑 Criando o primeiro usuário ADMIN

O perfil ADMIN só pode ser definido diretamente no banco. Após cadastrar um usuário pelo sistema, execute no PostgreSQL:

```sql
UPDATE "Usuario" SET perfil = 'ADMIN' WHERE email = 'seu@email.com';
```

---

## 📁 Estrutura do Projeto

```
futreserva/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma       # Modelos do banco de dados
│   ├── src/
│   │   ├── controllers/        # Lógica de negócio
│   │   ├── routes/             # Rotas da API
│   │   ├── middlewares/        # Autenticação e permissões
│   │   └── server.js           # Entrada do backend
│   └── .env.example
│
└── frontend/
    └── src/
        ├── pages/              # Telas do sistema
        ├── components/         # Componentes reutilizáveis
        ├── services/           # Chamadas à API
        ├── contexts/           # Contexto de autenticação
        └── routes/             # Definição e proteção de rotas
```

---

## 🔐 Perfis de Acesso

| Perfil | Permissões |
|---|---|
| **JOGADOR** | Ver campos, criar e cancelar agendamentos, registrar pagamento |
| **DONO** | Gerenciar campos, horários, confirmar agendamentos |
| **ADMIN** | Acesso total ao sistema, gerenciar usuários |

---

## 📡 Endpoints da API

### Autenticação (sem token)
| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/auth/cadastro` | Cadastrar novo usuário |
| POST | `/api/auth/login` | Fazer login e obter token |

### Usuários (requer token)
| Método | Rota | Perfil |
|---|---|---|
| GET | `/api/usuarios` | ADMIN |
| GET | `/api/usuarios/:id` | Autenticado |
| PUT | `/api/usuarios/:id` | Autenticado (próprio) |
| DELETE | `/api/usuarios/:id` | ADMIN |

---

## ✅ Funcionalidades Implementadas

- [x] Cadastro de usuários (JOGADOR e DONO)
- [x] Login com geração de token JWT
- [x] Controle de permissões por perfil
- [x] CRUD completo de usuários (backend + frontend)
- [x] Proteção de rotas no frontend por perfil
- [x] Migrations completas do banco de dados
- [ ] CRUD de Campos (em desenvolvimento)
- [ ] CRUD de Horários (em desenvolvimento)
- [ ] CRUD de Agendamentos (em desenvolvimento)
- [ ] Pagamentos (em desenvolvimento)

---

## 👥 Divisão de Tarefas

| Integrante | Módulo |
|---|---|
| Bernardo | Autenticação e Login (JWT) |
| Gabriel Rosario | CRUD de Usuários |
| Rafael Lucas | CRUD de Campos + Catálogo |
| Rafael Machado | CRUD de Horários |
| Decarli | Agendamentos, Pagamentos e Confirmações |
