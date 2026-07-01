// src/routes/agendamentoRoutes.js
// Rotas de agendamentos — todas exigem autenticação

const express = require('express')
const router = express.Router()
const { listar, criar, confirmar, cancelar } = require('../controllers/agendamentoController')
const authMiddleware = require('../middlewares/authMiddleware')
const permissaoMiddleware = require('../middlewares/permissaoMiddleware')

// Todas as rotas abaixo exigem autenticação
router.use(authMiddleware)

// GET /api/agendamentos — Lista agendamentos (escopado por perfil no controller)
router.get('/', listar)

// POST /api/agendamentos — Somente JOGADOR pode criar
router.post('/', permissaoMiddleware('JOGADOR'), criar)

// PUT /api/agendamentos/:id/confirmar — Somente DONO pode confirmar
router.put('/:id/confirmar', permissaoMiddleware('DONO'), confirmar)

// PUT /api/agendamentos/:id/cancelar — Jogador dono, DONO do campo ou ADMIN (checado no controller)
router.put('/:id/cancelar', cancelar)

module.exports = router
