# FutReserva

Sistema web de gestão e agendamento de campos de futebol society.

**Disciplina:** Desenvolvimento Web
**Integrantes:** Bernardo, Gabriel Rosario, Rafael Lucas, Rafael Machado, Decarli

---

## Tecnologias utilizadas

| Camada | Tecnologia |
|---|---|
| Linguagem | JavaScript (Node.js + React) |
| Backend | Node.js + Express.js |
| Frontend | React.js + Vite |
| Banco de Dados | PostgreSQL |
| ORM / Migrations | Prisma |
| Autenticação | JWT (jsonwebtoken) + bcryptjs |
| Estilização | Tailwind CSS |
| HTTP Client | Axios |
| Roteamento frontend | react-router-dom |

---

## Pré-requisitos

- [Node.js](https://nodejs.org/) v18 ou superior
- [PostgreSQL](https://www.postgresql.org/download/) v14 ou superior
- [Git](https://git-scm.com/)

---

## Como rodar o projeto

### 1. Clone o repositório

```bash
git clone https://github.com/GabrielUnocc/FutReserva.git
cd FutReserva
```

### 2. Crie o banco de dados

Abra o terminal do PostgreSQL e execute:

```sql
CREATE DATABASE futreserva;
```

### 3. Configure e inicie o backend

```bash
cd backend
npm install
cp .env.example .env
```

Edite o arquivo `.env` com seus dados:

```env
DATABASE_URL="postgresql://SEU_USUARIO:SUA_SENHA@localhost:5432/futreserva"
JWT_SECRET="futreserva_chave_secreta_2025"
PORT=3001
```

Execute as migrations para criar as tabelas:

```bash
npx prisma migrate dev
```

Inicie o servidor:

```bash
npm run dev
```

Backend disponível em: **http://localhost:3001**

### 4. Configure e inicie o frontend

Em um novo terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend disponível em: **http://localhost:5173**

---

## Criando o primeiro usuário ADMIN

O perfil ADMIN não pode ser criado pelo cadastro normal. Após criar uma conta no sistema, execute no PostgreSQL:

```sql
UPDATE "Usuario" SET perfil = 'ADMIN' WHERE email = 'seu@email.com';
```

---

## Estrutura do projeto

```
futreserva/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma           # Modelos do banco de dados
│   │   └── migrations/             # Histórico de alterações no banco
│   ├── src/
│   │   ├── controllers/            # Lógica de negócio de cada módulo
│   │   │   ├── authController.js
│   │   │   └── userController.js
│   │   ├── routes/                 # Endpoints da API REST
│   │   │   ├── authRoutes.js
│   │   │   └── userRoutes.js
│   │   ├── middlewares/
│   │   │   ├── authMiddleware.js       # Valida o token JWT
│   │   │   └── permissaoMiddleware.js  # Valida o perfil do usuário
│   │   ├── prismaClient.js         # Instância única do Prisma
│   │   └── server.js               # Entrada do servidor
│   ├── .env.example
│   └── package.json
│
└── frontend/
    └── src/
        ├── pages/
        │   ├── Login.jsx
        │   ├── Cadastro.jsx
        │   ├── Perfil.jsx
        │   └── Usuarios.jsx
        ├── components/
        │   ├── Navbar.jsx
        │   └── PrivateRoute.jsx
        ├── services/
        │   ├── api.js
        │   ├── authService.js
        │   └── userService.js
        ├── contexts/
        │   └── AuthContext.jsx
        └── routes/
            └── AppRoutes.jsx
```

---

## Perfis de acesso

| Perfil | Permissões |
|---|---|
| **JOGADOR** | Ver catálogo de campos, criar e cancelar agendamentos, registrar pagamento |
| **DONO** | Gerenciar seus campos, gerenciar horários, confirmar agendamentos |
| **ADMIN** | Acesso total, gerenciar todos os usuários |

---

## Endpoints da API

### Autenticação (sem token)

| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/auth/cadastro` | Cadastrar novo usuário |
| POST | `/api/auth/login` | Fazer login e receber token JWT |

### Usuários (requer token)

| Método | Rota | Perfil |
|---|---|---|
| GET | `/api/usuarios` | ADMIN |
| GET | `/api/usuarios/:id` | Autenticado |
| PUT | `/api/usuarios/:id` | Próprio usuário ou ADMIN |
| DELETE | `/api/usuarios/:id` | ADMIN |

### Campos (a implementar)

| Método | Rota | Perfil |
|---|---|---|
| GET | `/api/campos` | Público |
| GET | `/api/campos/:id` | Público |
| POST | `/api/campos` | DONO |
| PUT | `/api/campos/:id` | DONO (próprio) |
| DELETE | `/api/campos/:id` | DONO (próprio) |

### Horários (a implementar)

| Método | Rota | Perfil |
|---|---|---|
| GET | `/api/horarios/campo/:campoId` | Público |
| POST | `/api/horarios` | DONO |
| PUT | `/api/horarios/:id` | DONO |
| DELETE | `/api/horarios/:id` | DONO |

### Agendamentos (a implementar)

| Método | Rota | Perfil |
|---|---|---|
| GET | `/api/agendamentos` | Autenticado |
| POST | `/api/agendamentos` | JOGADOR |
| PUT | `/api/agendamentos/:id/confirmar` | DONO |
| PUT | `/api/agendamentos/:id/cancelar` | Autenticado |

### Pagamentos (a implementar)

| Método | Rota | Perfil |
|---|---|---|
| POST | `/api/pagamentos` | JOGADOR |
| GET | `/api/pagamentos/:agendamentoId` | Autenticado |

---

## Relatório de progresso

### Implementado

| Módulo | Backend | Frontend | Responsável |
|---|---|---|---|
| Autenticação (cadastro + login + JWT) | Completo | Completo | Bernardo |
| Controle de permissões (authMiddleware + permissaoMiddleware) | Completo | Completo | Bernardo |
| CRUD de Usuários | Completo | Completo | Gabriel Rosario |
| Tela de Login | — | Completo | Gabriel Rosario |
| Tela de Cadastro | — | Completo | Gabriel Rosario |
| Tela de Perfil (editar próprios dados) | — | Completo | Gabriel Rosario |
| Painel de usuários (ADMIN) | — | Completo | Gabriel Rosario |
| Migrations do banco de dados | Completo | — | Todos |

### Em desenvolvimento

| Módulo | Responsável | Status |
|---|---|---|
| CRUD de Campos | Rafael Lucas | Em desenvolvimento |
| Catálogo público de campos | Rafael Lucas | Em desenvolvimento |
| Tela de detalhe do campo | Rafael Lucas | Em desenvolvimento |
| CRUD de Horários disponíveis | Rafael Machado | Em desenvolvimento |
| Tela de gerenciamento de horários | Rafael Machado | Em desenvolvimento |
| CRUD de Agendamentos | Decarli | Em desenvolvimento |
| Confirmação de agendamento | Decarli | Em desenvolvimento |
| Cancelamento de agendamento | Decarli | Em desenvolvimento |
| Registro de pagamento | Decarli | Em desenvolvimento |
| Tela de horários confirmados (DONO) | Decarli | Em desenvolvimento |

---

## Checklist de funcionalidades (RF)

- [x] RF01 — Cadastro de usuários jogadores
- [x] RF02 — Cadastro de donos de campos
- [x] RF03 — Login com controle de permissões (JWT)
- [x] RF04 — CRUD de usuários e donos
- [ ] RF05 — CRUD de campos de futebol
- [ ] RF06 — Catálogo público de campos disponíveis
- [ ] RF07 — CRUD de horários disponíveis
- [ ] RF08 — CRUD de agendamentos
- [ ] RF09 — Confirmação de agendamento pelo dono
- [ ] RF10 — Registro de pagamento da reserva
- [ ] RF11 — Cancelamento de agendamento
- [ ] RF12 — Visualização de horários confirmados pelo dono

---

## Divisão de tarefas

| Integrante | Módulo |
|---|---|
| Bernardo | Autenticação, login, JWT e middlewares de permissão |
| Gabriel Rosario | CRUD de usuários, telas de login, cadastro e perfil |
| Rafael Lucas | CRUD de campos e catálogo público |
| Rafael Machado | CRUD de horários disponíveis |
| Decarli | Agendamentos, confirmação, cancelamento e pagamentos |
