// src/routes/userRoutes.js
// Rotas protegidas de usuários (exigem token JWT)

const express = require('express')
const router = express.Router()
const { listar, buscarPorId, atualizar, deletar } = require('../controllers/userController')
const authMiddleware = require('../middlewares/authMiddleware')
const permissaoMiddleware = require('../middlewares/permissaoMiddleware')

// Todas as rotas abaixo exigem autenticação
router.use(authMiddleware)

// GET /api/usuarios — Somente ADMIN pode listar todos
router.get('/', permissaoMiddleware('ADMIN'), listar)

// GET /api/usuarios/:id — Qualquer usuário autenticado pode buscar por ID
router.get('/:id', buscarPorId)

// PUT /api/usuarios/:id — Atualiza dados (próprio usuário ou ADMIN)
router.put('/:id', atualizar)

// DELETE /api/usuarios/:id — Somente ADMIN pode deletar
router.delete('/:id', permissaoMiddleware('ADMIN'), deletar)

module.exports = router
