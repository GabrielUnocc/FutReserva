// src/routes/pagamentoRoutes.js
const express = require('express')
const router = express.Router()
const pagamentoController = require('../controllers/pagamentoController')
const authMiddleware = require('../middlewares/authMiddleware')

router.use(authMiddleware)

router.post('/', pagamentoController.registrar)
router.get('/:agendamentoId', pagamentoController.buscarPorAgendamento)

module.exports = router