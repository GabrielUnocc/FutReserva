// src/routes/authRoutes.js
// Rotas públicas de autenticação (sem necessidade de token)

const express = require('express')
const router = express.Router()
const { cadastro, login } = require('../controllers/authController')

// POST /api/auth/cadastro — Cria um novo usuário
router.post('/cadastro', cadastro)

// POST /api/auth/login — Autentica e retorna o token JWT
router.post('/login', login)

module.exports = router
