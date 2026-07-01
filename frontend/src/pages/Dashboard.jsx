// src/pages/Dashboard.jsx
// Resumo gerencial do DONO: receita, ocupação e próximas reservas

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getResumoDashboard } from '../services/dashboardService'
import Navbar from '../components/Navbar'

function Cartao({ titulo, valor, cor }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-5">
      <p className="text-xs font-medium text-gray-500 uppercase">{titulo}</p>
      <p className={`text-3xl font-bold mt-1 ${cor}`}>{valor}</p>
    </div>
  )
}

function Dashboard() {
  const [resumo, setResumo] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    carregar()
  }, [])

  async function carregar() {
    try {
      setCarregando(true)
      const dados = await getResumoDashboard()
      setResumo(dados)
    } catch (error) {
      setErro('Erro ao carregar o dashboard.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

        {erro && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 text-red-600 border border-red-200 text-sm">
            {erro}
          </div>
        )}

        {carregando ? (
          <p className="text-center text-gray-400 py-10">Carregando dashboard...</p>
        ) : resumo && resumo.totalAgendamentos === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow-sm text-center border">
            <p className="text-gray-500">Nenhum agendamento registrado ainda nos seus campos.</p>
          </div>
        ) : resumo ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <Cartao titulo="Receita total" valor={`R$ ${resumo.receitaTotal.toFixed(2)}`} cor="text-verde-700" />
              <Cartao titulo="Confirmados" valor={resumo.confirmados} cor="text-green-600" />
              <Cartao titulo="Pendentes" valor={resumo.pendentes} cor="text-yellow-600" />
              <Cartao titulo="Cancelados" valor={resumo.cancelados} cor="text-red-500" />
            </div>

            <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
              <p className="text-sm font-medium text-gray-700 mb-2">Taxa de confirmação</p>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div
                  className="bg-verde-600 h-3 rounded-full transition-all"
                  style={{ width: `${resumo.taxaConfirmacao}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">{resumo.taxaConfirmacao}% dos agendamentos não cancelados foram confirmados</p>
            </div>

            {Object.keys(resumo.receitaPorCampo).length > 0 && (
              <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
                <p className="text-sm font-medium text-gray-700 mb-3">Receita por campo</p>
                <div className="space-y-2">
                  {Object.entries(resumo.receitaPorCampo).map(([campo, valor]) => (
                    <div key={campo} className="flex justify-between text-sm">
                      <span className="text-gray-600">{campo}</span>
                      <span className="font-semibold text-verde-700">R$ {valor.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-md p-6">
              <p className="text-sm font-medium text-gray-700 mb-3">Próximas reservas</p>
              {resumo.proximasReservas.length === 0 ? (
                <p className="text-sm text-gray-400">Nenhuma reserva futura.</p>
              ) : (
                <div className="space-y-3">
                  {resumo.proximasReservas.map((r) => (
                    <div key={r.id} className="flex items-center justify-between border-b border-gray-100 pb-2 last:border-0">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{r.campo}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(r.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })} · {r.horaInicio}–{r.horaFim} · {r.jogador}
                        </p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                        r.status === 'CONFIRMADO' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {r.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6">
              <Link to="/agendamentos" className="text-sm text-verde-700 font-semibold hover:underline">
                Ver todos os agendamentos →
              </Link>
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}

export default Dashboard
