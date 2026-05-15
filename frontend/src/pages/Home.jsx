// src/pages/Home.jsx
// Página inicial após o login — exibe boas-vindas e atalhos conforme o perfil

import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Navbar from '../components/Navbar'

function Home() {
  const { usuario } = useAuth()

  const acoesJogador = [
    { label: '🏟️ Ver Campos Disponíveis', to: '/campos', desc: 'Encontre campos para jogar' },
    { label: '📅 Meus Agendamentos', to: '/agendamentos', desc: 'Veja suas reservas' },
  ]

  const acoesDono = [
    { label: '🏟️ Meus Campos', to: '/meus-campos', desc: 'Gerencie seus campos' },
    { label: '🕐 Horários', to: '/horarios', desc: 'Configure os horários disponíveis' },
    { label: '📅 Agendamentos', to: '/agendamentos', desc: 'Veja e confirme reservas' },
  ]

  const acoesAdmin = [
    { label: '👥 Usuários', to: '/usuarios', desc: 'Gerencie todos os usuários' },
    { label: '🏟️ Campos', to: '/campos', desc: 'Veja todos os campos' },
  ]

  const acoes =
    usuario?.perfil === 'DONO' ? acoesDono :
    usuario?.perfil === 'ADMIN' ? acoesAdmin :
    acoesJogador

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-800">
            Bem-vindo, {usuario?.nome}! ⚽
          </h1>
          <p className="text-gray-500 mt-2">
            Você está logado como <span className="font-semibold text-verde-700">{usuario?.perfil}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {acoes.map((acao) => (
            <Link
              key={acao.to}
              to={acao.to}
              className="bg-white rounded-2xl shadow p-6 hover:shadow-md hover:border-verde-300 border border-transparent transition-all"
            >
              <p className="text-lg font-semibold text-gray-800">{acao.label}</p>
              <p className="text-sm text-gray-500 mt-1">{acao.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Home
