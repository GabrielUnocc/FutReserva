// src/components/Navbar.jsx
// Barra de navegação exibida em todas as páginas protegidas

import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function Navbar() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  // Links visíveis para DONO DE CAMPO
  const linksDono = [
    { label: 'Meus Campos', to: '/meus-campos' },
    { label: 'Horários', to: '/horarios' },
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
