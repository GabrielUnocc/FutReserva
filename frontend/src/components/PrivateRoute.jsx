// src/components/PrivateRoute.jsx
// Protege rotas que exigem autenticação e/ou perfil específico

import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

// perfisPermitidos: lista de perfis que podem acessar a rota (ex: ['DONO', 'ADMIN'])
// Se não passar perfisPermitidos, qualquer usuário autenticado pode acessar
function PrivateRoute({ children, perfisPermitidos }) {
  const { usuario, carregando } = useAuth()

  // Aguarda verificar se há usuário salvo no localStorage
  if (carregando) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Carregando...</p>
      </div>
    )
  }

  // Se não está logado, redireciona para o login
  if (!usuario) {
    return <Navigate to="/login" replace />
  }

  // Se há restrição de perfil e o usuário não tem permissão
  if (perfisPermitidos && !perfisPermitidos.includes(usuario.perfil)) {
    return <Navigate to="/sem-permissao" replace />
  }

  return children
}

export default PrivateRoute
