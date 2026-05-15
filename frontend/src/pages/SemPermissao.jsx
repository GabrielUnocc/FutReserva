// src/pages/SemPermissao.jsx
// Página exibida quando o usuário tenta acessar uma rota sem permissão

import { Link } from 'react-router-dom'

function SemPermissao() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <p className="text-6xl mb-4">🚫</p>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Acesso Negado</h1>
        <p className="text-gray-500 mb-6">Você não tem permissão para acessar esta página.</p>
        <Link to="/" className="bg-verde-700 text-white px-6 py-2 rounded-lg hover:bg-verde-800 transition-colors">
          Voltar ao início
        </Link>
      </div>
    </div>
  )
}

export default SemPermissao
