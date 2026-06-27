// src/pages/Perfil.jsx
// Página onde qualquer usuário logado pode ver e editar seus próprios dados

import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { atualizarUsuario } from '../services/userService'
import Navbar from '../components/Navbar'

function Perfil() {
  const { usuario, salvarLogin } = useAuth()

  const [form, setForm] = useState({ nome: usuario?.nome || '', email: usuario?.email || '' })
  const [novaSenha, setNovaSenha] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setMensagem('')
    setErro('')
    setCarregando(true)

    try {
      const dados = { nome: form.nome, email: form.email }
      if (novaSenha) dados.senha = novaSenha

      const resposta = await atualizarUsuario(usuario.id, dados)

      // Atualiza os dados no contexto e localStorage
      salvarLogin(
        { ...usuario, nome: resposta.usuario.nome, email: resposta.usuario.email },
        localStorage.getItem('futreserva_token')
      )

      setMensagem('Perfil atualizado com sucesso!')
      setNovaSenha('')
    } catch (error) {
      setErro(error.response?.data?.erro || 'Erro ao atualizar perfil.')
    } finally {
      setCarregando(false)
    }
  }

  const corPerfil = {
    JOGADOR: 'bg-blue-100 text-blue-700',
    DONO: 'bg-verde-100 text-verde-700',
    ADMIN: 'bg-purple-100 text-purple-700'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-lg mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Meu Perfil</h1>

        <div className="bg-white rounded-2xl shadow-md p-6">

          {/* Badge do perfil */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-verde-100 flex items-center justify-center text-verde-700 text-xl font-bold">
              {usuario?.nome?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-gray-800">{usuario?.nome}</p>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${corPerfil[usuario?.perfil]}`}>
                {usuario?.perfil}
              </span>
            </div>
          </div>

          {/* Mensagens */}
          {mensagem && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-verde-50 text-verde-800 border border-verde-200 text-sm">
              {mensagem}
            </div>
          )}
          {erro && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 text-red-600 border border-red-200 text-sm">
              {erro}
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo</label>
              <input
                type="text"
                name="nome"
                value={form.nome}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-verde-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-verde-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nova senha <span className="text-gray-400 font-normal">(deixe em branco para manter)</span>
              </label>
              <input
                type="password"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-verde-500"
              />
            </div>

            <button
              type="submit"
              disabled={carregando}
              className="w-full bg-verde-800 hover:bg-verde-900 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50"
            >
              {carregando ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Perfil
