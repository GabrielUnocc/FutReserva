// src/server.js
// Arquivo principal do backend — inicializa o servidor Express

require('dotenv').config()
const express = require('express')
const cors = require('cors')

const authRoutes = require('./routes/authRoutes')
const userRoutes = require('./routes/userRoutes')
const campoRoutes = require('./routes/campoRoutes')
const agendamentoRoutes = require('./routes/agendamentoRoutes')
const pagamentoRoutes = require('./routes/pagamentoRoutes')
const notificacaoRoutes = require('./routes/notificacaoRoutes')

const app = express()
const PORT = process.env.PORT || 3001

// ─── Middlewares Globais ──────────────────────────────────────────────────────

// Permite requisições do frontend (localhost:5173 é o padrão do Vite)
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// Permite receber JSON no corpo das requisições
app.use(express.json())

// ─── Rotas ───────────────────────────────────────────────────────────────────

// Rota de verificação — confirma que o servidor está rodando
app.get('/', (req, res) => {
  res.json({ mensagem: 'API FutReserva funcionando!', versao: '1.0.0' })
})

// Rotas de autenticação (cadastro e login — sem token)
app.use('/api/auth', authRoutes)

// Rotas de usuários (requer token JWT)
app.use('/api/usuarios', userRoutes)

// Rotas de campos, agendamentos, pagamentos e notificações (requer token JWT)
app.use('/api/campos', campoRoutes)
app.use('/api/agendamentos', agendamentoRoutes)
app.use('/api/pagamentos', pagamentoRoutes)
app.use('/api/notificacoes', notificacaoRoutes)

// ─── Inicialização ────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`✅ Servidor FutReserva rodando em http://localhost:${PORT}`)
  console.log(`📋 Ambiente: ${process.env.NODE_ENV || 'desenvolvimento'}`)
})
