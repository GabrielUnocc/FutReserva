// src/pages/Login.jsx
// Tela de login integrada com o backend

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { login } from '../services/authService'

function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  const { salvarLogin } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    setCarregando(true)

    try {
      const dados = await login(email, senha)
      salvarLogin(dados.usuario, dados.token)

      // Redireciona conforme o perfil do usuário
      if (dados.usuario.perfil === 'ADMIN') {
        navigate('/usuarios')
      } else if (dados.usuario.perfil === 'DONO') {
        navigate('/meus-campos')
      } else {
        navigate('/campos')
      }
    } catch (error) {
      const mensagem = error.response?.data?.erro || 'Erro ao fazer login. Tente novamente.'
      setErro(mensagem)
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-verde-50 to-verde-100">

      {/* Card central */}
      <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-sm">

        {/* Título */}
        <div className="text-center mb-7">
          <h1 className="text-3xl font-bold text-verde-800">FutReserva</h1>
          <p className="text-gray-400 text-sm mt-1">Entre para reservar seu campo</p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-verde-500"
            />
            <p className="text-xs text-gray-400 mt-1">
              Dica: use &quot;owner&quot; no email para entrar como dono
            </p>
          </div>

          {/* Senha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-verde-500"
            />
          </div>

          {/* Mensagem de erro */}
          {erro && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg border border-red-200">
              {erro}
            </div>
          )}

          {/* Botão */}
          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-verde-800 hover:bg-verde-900 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50"
          >
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        {/* Link cadastro */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Não tem uma conta?{' '}
          <Link to="/cadastro" className="text-verde-700 font-semibold hover:underline">
            Cadastre-se
          </Link>
        </p>
      </div>

      {/* Ícone de ajuda */}
      <button className="fixed bottom-6 right-6 w-9 h-9 bg-black text-white rounded-full text-sm font-bold flex items-center justify-center shadow-md hover:bg-gray-800 transition-colors">
        ?
      </button>
    </div>
  )
}

export default Login
