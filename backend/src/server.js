// src/server.js
require('dotenv').config()
const express = require('express')
const cors = require('cors')

const authRoutes = require('./routes/authRoutes')
const userRoutes = require('./routes/userRoutes')
const campoRoutes = require('./routes/campoRoutes')
const horarioRoutes = require('./routes/horarioRoutes')
const agendamentoRoutes = require('./routes/agendamentoRoutes')
const pagamentoRoutes = require('./routes/pagamentoRoutes')
const notificacaoRoutes = require('./routes/notificacaoRoutes')
const dashboardRoutes = require('./routes/dashboardRoutes')

const app = express()
const PORT = process.env.PORT || 3001

// Em dev, o front pode ser acessado por localhost, 127.0.0.1 ou pelo IP da rede local —
// libera qualquer origem nessas variações pra evitar bloqueio de CORS no navegador.
const origensPermitidas = process.env.CORS_ORIGIN
  ? [process.env.CORS_ORIGIN]
  : [/^http:\/\/localhost:5173$/, /^http:\/\/127\.0\.0\.1:5173$/, /^http:\/\/192\.168\.\d+\.\d+:5173$/]

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || origensPermitidas.some((padrao) => padrao.test ? padrao.test(origin) : padrao === origin)) {
      return callback(null, true)
    }
    return callback(new Error('Origem não permitida pelo CORS.'))
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(express.json())

app.get('/', (req, res) => {
  res.json({ mensagem: 'API FutReserva funcionando!', versao: '1.0.0' })
})

app.use('/api/auth', authRoutes)
app.use('/api/usuarios', userRoutes)
app.use('/api/campos', campoRoutes)
app.use('/api/campos/:campoId/horarios', horarioRoutes)
app.use('/api/agendamentos', agendamentoRoutes)
app.use('/api/pagamentos', pagamentoRoutes)
app.use('/api/notificacoes', notificacaoRoutes)
app.use('/api/dashboard', dashboardRoutes)

app.listen(PORT, () => {
  console.log(`✅ Servidor FutReserva rodando em http://localhost:${PORT}`)
  console.log(`📋 Ambiente: ${process.env.NODE_ENV || 'desenvolvimento'}`)
})
