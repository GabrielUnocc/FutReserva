// src/routes/agendamentoRoutes.js
const express = require('express')
const router = express.Router()
const agendamentoController = require('../controllers/agendamentoController')
const authMiddleware = require('../middlewares/authMiddleware')
const permissaoMiddleware = require('../middlewares/permissaoMiddleware')

router.use(authMiddleware)

router.get('/', agendamentoController.listar)
router.post('/', permissaoMiddleware('JOGADOR'), agendamentoController.criar)
router.put('/:id/confirmar', permissaoMiddleware('DONO'), agendamentoController.confirmar)
router.put('/:id/cancelar', agendamentoController.cancelar)
router.delete('/:id', permissaoMiddleware('ADMIN'), agendamentoController.deletar)

module.exports = router
