// src/components/Breadcrumb.jsx
// Componente de breadcrumb para indicar a localização atual do usuário

import { Link, useLocation } from 'react-router-dom'

// Mapa de tradução de path => label legível
const mapaRotas = {
  '': 'Início',
  'perfil': 'Perfil',
  'usuarios': 'Usuários',
  'campos': 'Campos',
  'meus-campos': 'Meus Campos',
  'horarios': 'Horários',
  'agendamentos': 'Agendamentos',
  'confirmacoes': 'Confirmações',
  'login': 'Login',
  'cadastro': 'Cadastro',
  'sem-permissao': 'Sem Permissão',
}

function Breadcrumb() {
  const location = useLocation()
  const caminhos = location.pathname.split('/').filter(Boolean)

  // Não exibe breadcrumb na home ou no login
  if (caminhos.length === 0) return null
  if (caminhos[0] === 'login' || caminhos[0] === 'cadastro') return null

  return (
    <nav aria-label="Breadcrumb" className="bg-gray-50 border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-2">
        <ol className="flex items-center flex-wrap gap-1 text-sm text-gray-600">
          <li>
            <Link to="/" className="hover:text-verde-700 transition-colors">
              🏠 Início
            </Link>
          </li>

          {caminhos.map((parte, indice) => {
            const rota = `/${caminhos.slice(0, indice + 1).join('/')}`
            const isUltimo = indice === caminhos.length - 1
            const label = mapaRotas[parte] || parte.charAt(0).toUpperCase() + parte.slice(1)

            return (
              <li key={rota} className="flex items-center gap-1">
                <span className="text-gray-400">/</span>
                {isUltimo ? (
                  <span className="text-verde-700 font-semibold" aria-current="page">
                    {label}
                  </span>
                ) : (
                  <Link to={rota} className="hover:text-verde-700 transition-colors">
                    {label}
                  </Link>
                )}
              </li>
            )
          })}
        </ol>
      </div>
    </nav>
  )
}

export default Breadcrumb
