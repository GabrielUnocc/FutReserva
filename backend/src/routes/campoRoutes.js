// src/routes/campoRoutes.js
// Rotas de campos — leitura é pública, escrita exige DONO autenticado

const express = require('express')
const router = express.Router()
const { listar, buscarPorId, criar, atualizar, deletar } = require('../controllers/campoController')
const authMiddleware = require('../middlewares/authMiddleware')
const permissaoMiddleware = require('../middlewares/permissaoMiddleware')

// GET /api/campos — Lista pública de campos
router.get('/', listar)

// GET /api/campos/:id — Detalhe público de um campo
router.get('/:id', buscarPorId)

// POST /api/campos — Somente DONO pode cadastrar
router.post('/', authMiddleware, permissaoMiddleware('DONO'), criar)

// PUT /api/campos/:id — Somente o DONO do campo
router.put('/:id', authMiddleware, permissaoMiddleware('DONO'), atualizar)

// DELETE /api/campos/:id — Somente o DONO do campo
router.delete('/:id', authMiddleware, permissaoMiddleware('DONO'), deletar)

module.exports = router
