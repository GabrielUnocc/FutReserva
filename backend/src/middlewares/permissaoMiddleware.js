// src/middlewares/permissaoMiddleware.js
// Verifica se o usuário tem o perfil necessário para acessar a rota

function permissaoMiddleware(...perfisPermitidos) {
  return (req, res, next) => {
    // req.usuario foi preenchido pelo authMiddleware
    if (!req.usuario) {
      return res.status(401).json({ erro: 'Usuário não autenticado.' })
    }

    const perfilUsuario = req.usuario.perfil

    // Verifica se o perfil do usuário está na lista de perfis permitidos
    if (!perfisPermitidos.includes(perfilUsuario)) {
      return res.status(403).json({
        erro: `Acesso negado. Esta rota é permitida apenas para: ${perfisPermitidos.join(', ')}.`
      })
    }

    next()
  }
}

module.exports = permissaoMiddleware
