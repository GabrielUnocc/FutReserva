// src/pages/Cadastro.jsx
// Tela de cadastro de novos usuários

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { cadastrar } from '../services/authService'

function Cadastro() {
  const [form, setForm] = useState({ nome: '', email: '', senha: '', perfil: 'JOGADOR' })
  const [telefone, setTelefone] = useState('')
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [carregando, setCarregando] = useState(false)
  const navigate = useNavigate()

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function selecionarPerfil(perfil) {
    setForm({ ...form, perfil })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    setSucesso('')
    setCarregando(true)

    try {
      await cadastrar(form)
      setSucesso('Conta criada com sucesso! Redirecionando para o login...')
      setTimeout(() => navigate('/login'), 2000)
    } catch (error) {
      const mensagem = error.response?.data?.erro || 'Erro ao cadastrar. Tente novamente.'
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
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-verde-800">FutReserva</h1>
          <p className="text-gray-400 text-sm mt-1">Crie sua conta</p>
        </div>

        {/* Seletor de perfil */}
        <div className="flex gap-2 mb-5">
          <button
            type="button"
            onClick={() => selecionarPerfil('JOGADOR')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-colors ${
              form.perfil === 'JOGADOR'
                ? 'bg-verde-50 border-verde-500 text-verde-700'
                : 'bg-white border-gray-300 text-gray-400'
            }`}
          >
            Jogador
          </button>
          <button
            type="button"
            onClick={() => selecionarPerfil('DONO')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-colors ${
              form.perfil === 'DONO'
                ? 'bg-verde-50 border-verde-500 text-verde-700'
                : 'bg-white border-gray-300 text-gray-400'
            }`}
          >
            Dono de Campo
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo *</label>
            <input
              type="text"
              name="nome"
              value={form.nome}
              onChange={handleChange}
              placeholder="Seu nome"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-verde-500"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="seu@email.com"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-verde-500"
            />
          </div>

          {/* Telefone (opcional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
            <input
              type="tel"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              placeholder="(11) 98765-4321"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-verde-500"
            />
          </div>

          {/* Senha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha *</label>
            <input
              type="password"
              name="senha"
              value={form.senha}
              onChange={handleChange}
              placeholder="••••••••"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-verde-500"
            />
          </div>

          {/* Erro */}
          {erro && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg border border-red-200">
              {erro}
            </div>
          )}

          {/* Sucesso */}
          {sucesso && (
            <div className="bg-verde-50 text-verde-700 text-sm px-4 py-2 rounded-lg border border-verde-500">
              {sucesso}
            </div>
          )}

          {/* Botão */}
          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-verde-800 hover:bg-verde-900 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50"
          >
            {carregando ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>

        {/* Link login */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Já tem uma conta?{' '}
          <Link to="/login" className="text-verde-700 font-semibold hover:underline">
            Entre aqui
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

export default Cadastro
