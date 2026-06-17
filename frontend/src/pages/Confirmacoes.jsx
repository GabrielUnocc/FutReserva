// src/pages/Confirmacoes.jsx
// Página do DONO: confirmar/rejeitar agendamentos pendentes e ver confirmados (RF09, RF11, RF12)

import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import {
  getAgendamentosPendentes,
  getAgendamentosConfirmados,
  confirmarAgendamento,
  cancelarAgendamento
} from '../services/agendamentoService'

function Confirmacoes() {
  const [pendentes, setPendentes] = useState([])
  const [confirmados, setConfirmados] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  async function carregar() {
    setCarregando(true)
    setErro('')
    try {
      const [p, c] = await Promise.all([
        getAgendamentosPendentes(),
        getAgendamentosConfirmados()
      ])
      setPendentes(p)
      setConfirmados(c)
    } catch {
      setErro('Erro ao carregar dados.')
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => { carregar() }, [])

  async function handleConfirmar(id) {
    try {
      await confirmarAgendamento(id)
      carregar()
    } catch {
      alert('Erro ao confirmar agendamento.')
    }
  }

  async function handleRejeitar(id) {
    if (!window.confirm('Tem certeza que deseja rejeitar este agendamento?')) return
    try {
      await cancelarAgendamento(id)
      carregar()
    } catch {
      alert('Erro ao rejeitar agendamento.')
    }
  }

  function formatarData(data) {
    return new Date(data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-gray-800 mb-8">Gerenciar Confirmações</h1>

        {carregando && <p className="text-gray-500 text-sm">Carregando...</p>}
        {erro && <p className="text-red-500 text-sm">{erro}</p>}

        {/* Agendamentos pendentes */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 inline-block"></span>
            Aguardando Confirmação
            {pendentes.length > 0 && (
              <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {pendentes.length}
              </span>
            )}
          </h2>

          {!carregando && pendentes.length === 0 && (
            <div className="bg-white rounded-2xl shadow p-6 text-center text-gray-400 text-sm">
              Nenhum agendamento pendente no momento.
            </div>
          )}

          <div className="space-y-3">
            {pendentes.map((ag) => (
              <div key={ag.id} className="bg-white rounded-2xl shadow p-5 flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-gray-800">{ag.horario?.campo?.nome}</p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {ag.horario?.diaSemana} — {ag.horario?.horaInicio} às {ag.horario?.horaFim}
                  </p>
                  <p className="text-sm text-gray-500">Data: {formatarData(ag.data)}</p>
                  <p className="text-sm text-gray-400 mt-0.5">Jogador: {ag.jogador?.nome}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleConfirmar(ag.id)}
                    className="text-sm text-white bg-verde-700 hover:bg-verde-800 font-medium px-4 py-1.5 rounded-lg transition-colors"
                  >
                    Confirmar
                  </button>
                  <button
                    onClick={() => handleRejeitar(ag.id)}
                    className="text-sm text-red-600 hover:text-red-800 font-medium border border-red-200 px-4 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Rejeitar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Horários confirmados — RF12 */}
        <section>
          <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block"></span>
            Horários Confirmados
          </h2>

          {!carregando && confirmados.length === 0 && (
            <div className="bg-white rounded-2xl shadow p-6 text-center text-gray-400 text-sm">
              Nenhum agendamento confirmado ainda.
            </div>
          )}

          <div className="space-y-3">
            {confirmados.map((ag) => (
              <div key={ag.id} className="bg-white rounded-2xl shadow p-5 flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-gray-800">{ag.horario?.campo?.nome}</p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {ag.horario?.diaSemana} — {ag.horario?.horaInicio} às {ag.horario?.horaFim}
                  </p>
                  <p className="text-sm text-gray-500">Data: {formatarData(ag.data)}</p>
                  <p className="text-sm text-gray-400 mt-0.5">Jogador: {ag.jogador?.nome}</p>
                </div>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-green-100 text-green-700 shrink-0">
                  Confirmado
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  )
}

export default Confirmacoes
