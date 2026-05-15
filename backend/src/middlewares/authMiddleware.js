// src/middlewares/authMiddleware.js
// Verifica se o usuário está autenticado (token JWT válido)

const jwt = require('jsonwebtoken')

function authMiddleware(req, res, next) {
  // Pega o token do header Authorization: Bearer <token>
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ erro: 'Token não fornecido. Faça login para continuar.' })
  }

  const token = authHeader.split(' ')[1]

  try {
    // Verifica e decodifica o token
    const dados = jwt.verify(token, process.env.JWT_SECRET)

    // Salva os dados do usuário na requisição para usar nas rotas
    req.usuario = dados
    next()
  } catch (error) {
    return res.status(401).json({ erro: 'Token inválido ou expirado. Faça login novamente.' })
  }
}

module.exports = authMiddleware
