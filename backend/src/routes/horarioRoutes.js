// src/routes/horarioRoutes.js
// Rotas de horários — aninhadas em /api/campos/:campoId/horarios
// Protegidas por JWT. Criação/edição/exclusão apenas para DONO do campo.

const express = require('express')
// mergeParams: true permite acessar :campoId definido na rota pai (server.js)
const router = express.Router({ mergeParams: true })

const {
  listar,
  buscarPorId,
  criar,
  atualizar,
  deletar,
  alterarDisponibilidade
} = require('../controllers/horarioController')

const authMiddleware = require('../middlewares/authMiddleware')
const permissaoMiddleware = require('../middlewares/permissaoMiddleware')

// Todas as rotas exigem autenticação
router.use(authMiddleware)

// GET  /api/campos/:campoId/horarios        — qualquer usuário logado pode ver
router.get('/', listar)

// GET  /api/campos/:campoId/horarios/:id    — qualquer usuário logado pode ver
router.get('/:id', buscarPorId)

// POST /api/campos/:campoId/horarios        — apenas DONO (ou ADMIN)
router.post('/', permissaoMiddleware('DONO', 'ADMIN'), criar)

// PUT  /api/campos/:campoId/horarios/:id    — apenas DONO (ou ADMIN)
router.put('/:id', permissaoMiddleware('DONO', 'ADMIN'), atualizar)

// DELETE /api/campos/:campoId/horarios/:id  — apenas DONO (ou ADMIN)
router.delete('/:id', permissaoMiddleware('DONO', 'ADMIN'), deletar)

// PATCH /api/campos/:campoId/horarios/:id/disponibilidade — apenas DONO (ou ADMIN)
router.patch('/:id/disponibilidade', permissaoMiddleware('DONO', 'ADMIN'), alterarDisponibilidade)

module.exports = router
