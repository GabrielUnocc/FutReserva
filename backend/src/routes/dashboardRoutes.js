// src/routes/dashboardRoutes.js
const express = require('express')
const router = express.Router()
const dashboardController = require('../controllers/dashboardController')
const authMiddleware = require('../middlewares/authMiddleware')
const permissaoMiddleware = require('../middlewares/permissaoMiddleware')

router.use(authMiddleware)

router.get('/', permissaoMiddleware('DONO'), dashboardController.resumo)

module.exports = router
