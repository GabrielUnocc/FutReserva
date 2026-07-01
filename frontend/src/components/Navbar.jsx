// src/components/Navbar.jsx
// Barra de navegação exibida em todas as páginas protegidas

import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getNaoLidasCount } from '../services/notificacaoService'

function Navbar() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [naoLidas, setNaoLidas] = useState(0)

  useEffect(() => {
    if (!usuario) return
    getNaoLidasCount()
      .then(setNaoLidas)
      .catch(() => {})
  }, [usuario, location.pathname])

  function handleLogout() {
    logout()
    navigate('/login')
  }

  // Links visíveis para DONO DE CAMPO
  // Horários é acessado via /campos/:id/horarios (a partir de Meus Campos)
  const linksDono = [
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'Meus Campos', to: '/meus-campos' },
    { label: 'Agendamentos', to: '/agendamentos' },
  ]

  // Links visíveis para JOGADOR
  const linksJogador = [
    { label: 'Campos', to: '/campos' },
    { label: 'Meus Agendamentos', to: '/agendamentos' },
  ]

  // Links visíveis para ADMIN
  const linksAdmin = [
    { label: 'Usuários', to: '/usuarios' },
    { label: 'Campos', to: '/campos' },
  ]

  const linksAtivos =
    usuario?.perfil === 'DONO' ? linksDono :
    usuario?.perfil === 'ADMIN' ? linksAdmin :
    linksJogador

  return (
    <nav className="bg-verde-700 text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-xl font-bold tracking-wide">
          ⚽ FutReserva
        </Link>

        {/* Links de navegação */}
        <div className="flex items-center gap-6">
          {linksAtivos.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-sm hover:text-verde-100 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Usuário logado e logout */}
        <div className="flex items-center gap-4">
          {/* Sino de notificações */}
          <Link to="/notificacoes" className="relative text-white hover:text-verde-100 transition-colors" title="Notificações">
            <span className="text-lg">🔔</span>
            {naoLidas > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {naoLidas > 9 ? '9+' : naoLidas}
              </span>
            )}
          </Link>

          <Link to="/perfil" className="text-sm text-verde-100 hover:text-white transition-colors">
            {usuario?.nome}
          </Link>
          <button
            onClick={handleLogout}
            className="bg-white text-verde-700 text-sm font-semibold px-3 py-1 rounded hover:bg-verde-50 transition-colors"
          >
            Sair
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
