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

##  Rodando com Docker

### Pré-requisitos
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado e rodando

### Subir tudo com um comando

```bash
# Na raiz do projeto (onde está o docker-compose.yml)
docker compose up --build
```

### Acessar o sistema

| Serviço   | URL                        |
|-----------|----------------------------|
| Frontend  | http://localhost:5173      |
| Backend   | http://localhost:3001      |
| Banco     | localhost:5432             |

### Parar os containers

```bash
docker compose down
```

Para apagar também os dados do banco:

```bash
docker compose down -v
```

---

##  Rodando sem Docker 

### Pré-requisitos
- Node.js 20+
- PostgreSQL rodando localmente

### Backend

```bash
cd backend

# Copie o arquivo de ambiente
cp .env.example .env
# Edite .env com sua DATABASE_URL local

npm install
npx prisma migrate dev
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 🗄️ Banco de Dados

Acesso direto ao PostgreSQL dentro do Docker:

```bash
docker exec -it futreserva_db psql -U futreserva -d futreserva_db
```

---

##  Endpoints da API

### Autenticação (público)
| Método | Rota                  | Descrição          |
|--------|-----------------------|--------------------|
| POST   | /api/auth/cadastro    | Criar conta        |
| POST   | /api/auth/login       | Login              |

### Usuários (requer token)
| Método | Rota                  | Perfil       | Descrição            |
|--------|-----------------------|--------------|----------------------|
| GET    | /api/usuarios         | ADMIN        | Listar usuários      |
| GET    | /api/usuarios/:id     | Autenticado  | Buscar por ID        |
| PUT    | /api/usuarios/:id     | Próprio/ADMIN| Atualizar            |
| DELETE | /api/usuarios/:id     | ADMIN        | Remover              |

### Campos (requer token)
| Método | Rota                  | Perfil       | Descrição            |
|--------|-----------------------|--------------|----------------------|
| GET    | /api/campos           | Autenticado  | Listar campos        |
| GET    | /api/campos/meus      | DONO/ADMIN   | Meus campos          |
| GET    | /api/campos/:id       | Autenticado  | Buscar campo         |
| POST   | /api/campos           | DONO/ADMIN   | Criar campo          |
| PUT    | /api/campos/:id       | DONO/ADMIN   | Editar campo         |
| DELETE | /api/campos/:id       | DONO/ADMIN   | Remover campo        |

### Horários (requer token)
| Método | Rota                                              | Perfil      | Descrição              |
|--------|---------------------------------------------------|-------------|------------------------|
| GET    | /api/campos/:id/horarios                          | Autenticado | Listar horários        |
| GET    | /api/campos/:id/horarios/:hid                     | Autenticado | Buscar horário         |
| POST   | /api/campos/:id/horarios                          | DONO/ADMIN  | Criar horário          |
| PUT    | /api/campos/:id/horarios/:hid                     | DONO/ADMIN  | Editar horário         |
| DELETE | /api/campos/:id/horarios/:hid                     | DONO/ADMIN  | Excluir horário        |
| PATCH  | /api/campos/:id/horarios/:hid/disponibilidade     | DONO/ADMIN  | Ativar/desativar       |

### 5. Rodando Backend e Frontend simultaneamente

Na raiz do projeto (`/FutReserva`), você pode iniciar ambos com um único comando:

```bash
npm install
npm run dev
```
*Isso utiliza o pacote `concurrently` para gerenciar os dois processos em um único terminal.*

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
│   │   │   ├── userController.js
│   │   │   ├── agendamentoController.js
│   │   │   └── pagamentoController.js
│   │   ├── routes/                 # Endpoints da API REST
│   │   │   ├── authRoutes.js
│   │   │   ├── userRoutes.js
│   │   │   ├── agendamentoRoutes.js
│   │   │   └── pagamentoRoutes.js
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
        │   ├── Agendamentos.jsx        # Tela de listagem e gestão de agendamentos
        │   ├── Perfil.jsx
        │   └── Usuarios.jsx
        ├── components/
        │   ├── Navbar.jsx
        │   └── PrivateRoute.jsx
        ├── services/
        │   ├── api.js
        │   ├── authService.js
        │   ├── userService.js
        │   ├── agendamentoService.js
        │   └── pagamentoService.js
        ├── contexts/
        │   └── AuthContext.jsx
        └── routes/
            └── AppRoutes.jsx

---

## Perfis de acesso

| Perfil | Permissões |
|---|---|
| **JOGADOR** | Ver catálogo de campos, criar e cancelar agendamentos, registrar pagamento |
| **DONO** | Gerenciar seus campos, gerenciar horários, confirmar agendamentos |
| **ADMIN** | Acesso total, gerenciar todos os usuários |

---

## Relatório de progresso

### Implementado

| Módulo | Backend | Frontend | Responsável |
|---|---|---|---|
| Autenticação (cadastro + login + JWT) | Completo | Completo | Gabriel Rosario |
| Controle de permissões (authMiddleware + permissaoMiddleware) | Completo | Completo | Gabriel Rosario |
| CRUD de Usuários | Completo | Completo | Gabriel Rosario |
| Tela de Login | — | Completo | Gabriel Rosario |
| Tela de Cadastro | — | Completo | Gabriel Rosario |
| Tela de Perfil (editar próprios dados) | — | Completo | Gabriel Rosario |
| Painel de usuários (ADMIN) | — | Completo | Gabriel Rosario |
| Migrations do banco de dados | Completo | — | Todos |
| CRUD de Agendamentos | Completo | Completo | João Decarli |
| Confirmação de agendamento | Completo | Completo | João Decarli |
| Cancelamento de agendamento | Completo | Completo | João Decarli |
| Registro de pagamento | Completo | Completo | João Decarli |
| Tela de horários confirmados (DONO) | Completo | Completo | João Decarli |

### Em desenvolvimento

| Módulo | Responsável | Status |
|---|---|---|
| CRUD de Campos | Rafael Lucas | Em desenvolvimento |
| Catálogo público de campos | Rafael Lucas | Em desenvolvimento |
| Tela de detalhe do campo | Rafael Lucas | Em desenvolvimento |
| CRUD de Horários disponíveis | Rafael Machado | Em desenvolvimento |
| Tela de gerenciamento de horários | Rafael Machado | Em desenvolvimento |

---

## Checklist de funcionalidades (RF)

- [x] RF01 — Cadastro de usuários jogadores
- [x] RF02 — Cadastro de donos de campos
- [x] RF03 — Login com controle de permissões (JWT)
- [x] RF04 — CRUD de usuários e donos
- [ ] RF05 — CRUD de campos de futebol
- [ ] RF06 — Catálogo público de campos disponíveis
- [ ] RF07 — CRUD de horários disponíveis
- [x] RF08 — CRUD de agendamentos
- [x] RF09 — Confirmação de agendamento pelo dono
- [x] RF10 — Registro de pagamento da reserva
- [x] RF11 — Cancelamento de agendamento
- [x] RF12 — Visualização de horários confirmados pelo dono

---

## Divisão de tarefas

| Integrante | Módulo |
|---|---|
|  Gabriel Rosario  | Autenticação, login, JWT e middlewares de permissão |
| Gabriel Rosario | CRUD de usuários, telas de login, cadastro e perfil |
| Rafael Lucas | CRUD de campos e catálogo público |
| Rafael Machado | CRUD de horários disponíveis |
| Decarli | Agendamentos, confirmação, cancelamento e pagamentos |
