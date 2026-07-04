// src/pages/Notificacoes.jsx
// Página de notificações do usuário logado — CRUD completo

import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import {
  getNotificacoes,
  marcarLida,
  marcarTodasLidas,
  deletarNotificacao,
  limparLidas
} from '../services/notificacaoService'

function Notificacoes() {
  const [notificacoes, setNotificacoes] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  async function carregar() {
    setCarregando(true)
    setErro('')
    try {
      const dados = await getNotificacoes()
      setNotificacoes(dados)
    } catch {
      setErro('Erro ao carregar notificações.')
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => { carregar() }, [])

  async function handleMarcarLida(id) {
    try {
      await marcarLida(id)
      setNotificacoes((prev) =>
        prev.map((n) => (n.id === id ? { ...n, lida: true } : n))
      )
    } catch {
      alert('Erro ao marcar notificação.')
    }
  }

  async function handleMarcarTodasLidas() {
    try {
      await marcarTodasLidas()
      setNotificacoes((prev) => prev.map((n) => ({ ...n, lida: true })))
    } catch {
      alert('Erro ao marcar notificações.')
    }
  }

  async function handleDeletar(id) {
    try {
      await deletarNotificacao(id)
      setNotificacoes((prev) => prev.filter((n) => n.id !== id))
    } catch {
      alert('Erro ao remover notificação.')
    }
  }

  async function handleLimparLidas() {
    if (!window.confirm('Remover todas as notificações já lidas?')) return
    try {
      await limparLidas()
      setNotificacoes((prev) => prev.filter((n) => !n.lida))
    } catch {
      alert('Erro ao limpar notificações.')
    }
  }

  function formatarData(data) {
    return new Date(data).toLocaleString('pt-BR')
  }

  const naoLidas = notificacoes.filter((n) => !n.lida)
  const temLidas = notificacoes.some((n) => n.lida)

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-10">

        {/* Cabeçalho */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-800">Notificações</h1>
            {naoLidas.length > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {naoLidas.length} nova{naoLidas.length > 1 ? 's' : ''}
              </span>
            )}
          </div>

          <div className="flex gap-2">
            {naoLidas.length > 0 && (
              <button
                onClick={handleMarcarTodasLidas}
                className="text-sm text-verde-700 hover:text-verde-900 font-medium border border-verde-300 px-3 py-1.5 rounded-lg hover:bg-verde-50 transition-colors"
              >
                Marcar todas como lidas
              </button>
            )}
            {temLidas && (
              <button
                onClick={handleLimparLidas}
                className="text-sm text-gray-500 hover:text-red-600 font-medium border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
              >
                Limpar lidas
              </button>
            )}
          </div>
        </div>

        {carregando && <p className="text-gray-500 text-sm">Carregando...</p>}
        {erro && <p className="text-red-500 text-sm">{erro}</p>}

        {!carregando && notificacoes.length === 0 && (
          <div className="bg-white rounded-2xl shadow p-10 text-center text-gray-400">
            <p className="text-4xl mb-3">🔔</p>
            <p className="text-sm">Nenhuma notificação por enquanto.</p>
          </div>
        )}

        <div className="space-y-3">
          {notificacoes.map((notif) => (
            <div
              key={notif.id}
              className={`rounded-2xl shadow p-4 flex items-start justify-between gap-4 transition-colors ${
                notif.lida ? 'bg-white' : 'bg-verde-50 border border-verde-200'
              }`}
            >
              <div className="flex items-start gap-3 flex-1">
                <span className="text-xl mt-0.5">{notif.lida ? '🔕' : '🔔'}</span>
                <div>
                  <p className={`text-sm ${notif.lida ? 'text-gray-600' : 'text-gray-800 font-medium'}`}>
                    {notif.mensagem}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{formatarData(notif.createdAt)}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {!notif.lida && (
                  <button
                    onClick={() => handleMarcarLida(notif.id)}
                    className="text-xs text-verde-700 hover:text-verde-900 font-medium border border-verde-200 px-2 py-1 rounded-lg hover:bg-verde-100 transition-colors"
                  >
                    Marcar lida
                  </button>
                )}
                <button
                  onClick={() => handleDeletar(notif.id)}
                  className="text-gray-300 hover:text-red-500 transition-colors text-lg leading-none"
                  title="Remover"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </Layout>
  )
}

export default Notificacoes
