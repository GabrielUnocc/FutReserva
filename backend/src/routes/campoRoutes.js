// src/routes/campoRoutes.js
// Rotas de campos de futebol (RF05, RF06)

const express = require('express')
const router = express.Router()
const { listar, buscarPorId, meusCampos, criar, atualizar, deletar } = require('../controllers/campoController')
const authMiddleware = require('../middlewares/authMiddleware')
const permissaoMiddleware = require('../middlewares/permissaoMiddleware')

router.use(authMiddleware)

// GET /api/campos/meus — campos do dono logado (antes de /:id para não conflitar)
router.get('/meus', permissaoMiddleware('DONO', 'ADMIN'), meusCampos)

// GET /api/campos — todos os campos (qualquer usuário logado)
router.get('/', listar)

// GET /api/campos/:id — campo por ID
router.get('/:id', buscarPorId)

// POST /api/campos — criar campo (somente DONO ou ADMIN)
router.post('/', permissaoMiddleware('DONO', 'ADMIN'), criar)

// PUT /api/campos/:id — editar campo
router.put('/:id', permissaoMiddleware('DONO', 'ADMIN'), atualizar)

// DELETE /api/campos/:id — remover campo
router.delete('/:id', permissaoMiddleware('DONO', 'ADMIN'), deletar)

module.exports = router
