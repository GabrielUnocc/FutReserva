// src/routes/pagamentoRoutes.js
// Rotas de pagamentos — todas exigem autenticação

const express = require('express')
const router = express.Router()
const { criar, buscarPorAgendamento } = require('../controllers/pagamentoController')
const authMiddleware = require('../middlewares/authMiddleware')
const permissaoMiddleware = require('../middlewares/permissaoMiddleware')

// Todas as rotas abaixo exigem autenticação
router.use(authMiddleware)

// POST /api/pagamentos — Somente JOGADOR pode registrar pagamento
router.post('/', permissaoMiddleware('JOGADOR'), criar)

// GET /api/pagamentos/:agendamentoId — Jogador dono, DONO do campo ou ADMIN (checado no controller)
router.get('/:agendamentoId', buscarPorAgendamento)

module.exports = router
