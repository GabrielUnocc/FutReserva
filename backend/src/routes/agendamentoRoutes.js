// src/routes/agendamentoRoutes.js
// Rotas de agendamentos com controle de permissão por perfil

const express = require('express')
const router = express.Router()
const {
  criar,
  listarMeus,
  listarPendentes,
  listarConfirmados,
  confirmar,
  cancelar
} = require('../controllers/agendamentoController')
const authMiddleware = require('../middlewares/authMiddleware')
const permissaoMiddleware = require('../middlewares/permissaoMiddleware')

router.use(authMiddleware)

// JOGADOR
router.post('/', permissaoMiddleware('JOGADOR'), criar)
router.get('/meus', permissaoMiddleware('JOGADOR'), listarMeus)

// DONO
router.get('/pendentes', permissaoMiddleware('DONO'), listarPendentes)
router.get('/confirmados', permissaoMiddleware('DONO'), listarConfirmados)
router.patch('/:id/confirmar', permissaoMiddleware('DONO'), confirmar)

// JOGADOR, DONO ou ADMIN (verificação de posse feita no controller)
router.patch('/:id/cancelar', cancelar)

module.exports = router
