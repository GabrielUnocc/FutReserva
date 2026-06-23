# ⚽ FutReserva

Sistema web para reserva de horários em campos de futebol.  
Donos cadastram seus campos e horários disponíveis. Jogadores fazem reservas pelo app.

---

## 🐳 Rodando com Docker (recomendado)

### Pré-requisitos
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado e rodando

### Subir tudo com um comando

```bash
# Na raiz do projeto (onde está o docker-compose.yml)
docker compose up --build
```

Aguarde as mensagens de inicialização. Na primeira vez, o Docker irá:
1. Baixar as imagens do PostgreSQL e Node.js
2. Instalar as dependências do backend e frontend
3. Rodar as migrations do banco de dados
4. Iniciar os 3 serviços

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

## 💻 Rodando sem Docker (desenvolvimento local)

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

## 📋 Endpoints da API

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

---

## 🏗️ Tecnologias

| Camada    | Tecnologia                         |
|-----------|------------------------------------|
| Backend   | Node.js + Express.js               |
| Frontend  | React 18 + Vite                    |
| Banco     | PostgreSQL 16                      |
| ORM       | Prisma                             |
| Auth      | JWT + bcryptjs                     |
| Estilo    | Tailwind CSS                       |
| HTTP      | Axios                              |
| Infra     | Docker + Docker Compose            |

---

## 👥 Equipe

| Integrante         | Responsabilidade                          |
|--------------------|-------------------------------------------|
| Rafael Rockenbach  | CRUD Usuários + Login/Permissões          |
| Rafael Almeida     | CRUD Horários + Agendamentos              |
| Bernardo           | CRUD Confirmação de Agendamento           |
| João Decarli       | CRUD Campos + Catálogo                    |
| Gabriel Rosario    | CRUD Pagamentos                           |
