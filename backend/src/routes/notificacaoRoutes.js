// src/routes/notificacaoRoutes.js

const express = require('express')
const router = express.Router()
const {
  listar,
  contarNaoLidas,
  marcarLida,
  marcarTodasLidas,
  deletar,
  limparLidas
} = require('../controllers/notificacaoController')
const authMiddleware = require('../middlewares/authMiddleware')

router.use(authMiddleware)

router.get('/', listar)
router.get('/nao-lidas', contarNaoLidas)
router.patch('/todas-lidas', marcarTodasLidas)
router.patch('/:id/lida', marcarLida)
router.delete('/lidas', limparLidas)
router.delete('/:id', deletar)

module.exports = router
