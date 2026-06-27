// src/server.js
require('dotenv').config()
const express = require('express')
const cors = require('cors')

const authRoutes = require('./routes/authRoutes')
const userRoutes = require('./routes/userRoutes')
const horarioRoutes = require('./routes/horarioRoutes')

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(express.json())

app.get('/', (req, res) => {
  res.json({ mensagem: 'API FutReserva funcionando!', versao: '1.0.0' })
})

app.use('/api/auth', authRoutes)
app.use('/api/usuarios', userRoutes)
app.use('/api/campos/:campoId/horarios', horarioRoutes)      // adicionado neste commit

app.listen(PORT, () => {
  console.log(`✅ Servidor FutReserva rodando em http://localhost:${PORT}`)
  console.log(`📋 Ambiente: ${process.env.NODE_ENV || 'desenvolvimento'}`)
})
