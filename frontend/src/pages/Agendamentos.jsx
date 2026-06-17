// src/pages/Agendamentos.jsx
// Página do JOGADOR: visualizar e cancelar seus agendamentos

import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { getMeusAgendamentos, cancelarAgendamento } from '../services/agendamentoService'

const statusConfig = {
  PENDENTE:   { label: 'Pendente',   className: 'bg-yellow-100 text-yellow-700' },
  CONFIRMADO: { label: 'Confirmado', className: 'bg-green-100 text-green-700' },
  CANCELADO:  { label: 'Cancelado',  className: 'bg-red-100 text-red-700' },
}

function Agendamentos() {
  const [agendamentos, setAgendamentos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  async function carregar() {
    setCarregando(true)
    setErro('')
    try {
      const dados = await getMeusAgendamentos()
      setAgendamentos(dados)
    } catch {
      setErro('Erro ao carregar agendamentos.')
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => { carregar() }, [])

  async function handleCancelar(id) {
    if (!window.confirm('Tem certeza que deseja cancelar este agendamento?')) return
    try {
      await cancelarAgendamento(id)
      carregar()
    } catch {
      alert('Erro ao cancelar agendamento.')
    }
  }

  function formatarData(data) {
    return new Date(data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Meus Agendamentos</h1>

        {carregando && <p className="text-gray-500 text-sm">Carregando...</p>}
        {erro && <p className="text-red-500 text-sm">{erro}</p>}

        {!carregando && agendamentos.length === 0 && (
          <div className="bg-white rounded-2xl shadow p-10 text-center text-gray-400">
            <p className="text-4xl mb-3">📅</p>
            <p className="text-sm">Você não possui agendamentos ainda.</p>
          </div>
        )}

        <div className="space-y-4">
          {agendamentos.map((ag) => {
            const status = statusConfig[ag.status]
            return (
              <div key={ag.id} className="bg-white rounded-2xl shadow p-5 flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-gray-800">{ag.horario?.campo?.nome}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {ag.horario?.diaSemana} — {ag.horario?.horaInicio} às {ag.horario?.horaFim}
                  </p>
                  <p className="text-sm text-gray-500">Data: {formatarData(ag.data)}</p>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mt-2 inline-block ${status.className}`}>
                    {status.label}
                  </span>
                </div>

                {ag.status === 'PENDENTE' && (
                  <button
                    onClick={() => handleCancelar(ag.id)}
                    className="text-sm text-red-600 hover:text-red-800 font-medium border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors whitespace-nowrap"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </Layout>
  )
}

export default Agendamentos
