// src/pages/Agendamentos.jsx
// Lista de agendamentos com ações de confirmar, cancelar e registrar pagamento (RF08, RF09, RF10, RF11)

import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { listarAgendamentos, confirmarAgendamento, cancelarAgendamento } from '../services/agendamentoService'
import { registrarPagamento } from '../services/pagamentoService'
import Navbar from '../components/Navbar'

const corStatusAgendamento = {
  PENDENTE: 'bg-yellow-100 text-yellow-700',
  CONFIRMADO: 'bg-verde-100 text-verde-700',
  CANCELADO: 'bg-red-100 text-red-700'
}

const corStatusPagamento = {
  PENDENTE: 'bg-yellow-100 text-yellow-700',
  PAGO: 'bg-verde-100 text-verde-700',
  CANCELADO: 'bg-red-100 text-red-700'
}

const metodosPagamento = ['PIX', 'Cartão', 'Dinheiro']

function Agendamentos() {
  const { usuario } = useAuth()

  const [agendamentos, setAgendamentos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [mensagem, setMensagem] = useState('')

  const [pagandoId, setPagandoId] = useState(null)
  const [metodoSelecionado, setMetodoSelecionado] = useState(metodosPagamento[0])

  useEffect(() => {
    carregarAgendamentos()
  }, [])

  async function carregarAgendamentos() {
    try {
      setCarregando(true)
      const dados = await listarAgendamentos()
      setAgendamentos(dados)
    } catch (error) {
      setMensagem('Erro ao carregar agendamentos.')
    } finally {
      setCarregando(false)
    }
  }

  async function handleConfirmar(id) {
    try {
      await confirmarAgendamento(id)
      setMensagem('Agendamento confirmado com sucesso!')
      carregarAgendamentos()
    } catch (error) {
      setMensagem(error.response?.data?.erro || 'Erro ao confirmar agendamento.')
    }
  }

  async function handleCancelar(id) {
    if (!confirm('Tem certeza que deseja cancelar este agendamento?')) return

    try {
      await cancelarAgendamento(id)
      setMensagem('Agendamento cancelado.')
      carregarAgendamentos()
    } catch (error) {
      setMensagem(error.response?.data?.erro || 'Erro ao cancelar agendamento.')
    }
  }

  async function handlePagar(e, agendamentoId) {
    e.preventDefault()

    try {
      await registrarPagamento({ agendamentoId, metodo: metodoSelecionado })
      setMensagem('Pagamento registrado com sucesso!')
      setPagandoId(null)
      carregarAgendamentos()
    } catch (error) {
      setMensagem(error.response?.data?.erro || 'Erro ao registrar pagamento.')
    }
  }

  function formatarData(dataIso) {
    const [ano, mes, dia] = dataIso.split('T')[0].split('-')
    return `${dia}/${mes}/${ano}`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          {usuario?.perfil === 'JOGADOR' ? 'Meus Agendamentos' : 'Agendamentos'}
        </h1>

        {mensagem && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-verde-50 text-verde-800 border border-verde-200 text-sm">
            {mensagem}
          </div>
        )}

        {carregando ? (
          <p className="text-center text-gray-400 py-10">Carregando agendamentos...</p>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {agendamentos.map((ag) => {
              const ehDonoDaReserva = ag.jogadorId === usuario.id
              const ehDonoDoCampo = ag.campo.donoId === usuario.id

              const podeConfirmar = usuario.perfil === 'DONO' && ehDonoDoCampo && ag.status === 'PENDENTE'
              const podeCancelar =
                ag.status !== 'CANCELADO' &&
                (ehDonoDaReserva || ehDonoDoCampo || usuario.perfil === 'ADMIN')
              const podePagar =
                usuario.perfil === 'JOGADOR' && ehDonoDaReserva &&
                ag.status === 'CONFIRMADO' && !ag.pagamento

              return (
                <div key={ag.id} className="bg-white rounded-2xl shadow-md p-6">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <p className="text-lg font-semibold text-gray-800">{ag.campo.nome}</p>
                      <p className="text-sm text-gray-500">
                        {ag.horaInicio} – {ag.horaFim} • {formatarData(ag.data)}
                      </p>
                      {usuario.perfil !== 'JOGADOR' && (
                        <p className="text-xs text-gray-400 mt-1">Jogador: {ag.jogador.nome} ({ag.jogador.email})</p>
                      )}

                      <div className="flex items-center gap-2 mt-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${corStatusAgendamento[ag.status]}`}>
                          {ag.status}
                        </span>
                        {ag.pagamento ? (
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${corStatusPagamento[ag.pagamento.status]}`}>
                            Pagamento: {ag.pagamento.status}
                          </span>
                        ) : (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                            Sem pagamento
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 shrink-0">
                      {podeConfirmar && (
                        <button
                          onClick={() => handleConfirmar(ag.id)}
                          className="text-xs bg-verde-600 text-white px-3 py-1.5 rounded hover:bg-verde-700"
                        >
                          Confirmar
                        </button>
                      )}
                      {podePagar && (
                        <button
                          onClick={() => setPagandoId(pagandoId === ag.id ? null : ag.id)}
                          className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded hover:bg-blue-100"
                        >
                          Registrar Pagamento
                        </button>
                      )}
                      {podeCancelar && (
                        <button
                          onClick={() => handleCancelar(ag.id)}
                          className="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded hover:bg-red-100"
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  </div>

                  {pagandoId === ag.id && (
                    <form onSubmit={(e) => handlePagar(e, ag.id)} className="mt-4 border-t border-gray-100 pt-4 flex items-end gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Método de pagamento</label>
                        <select
                          value={metodoSelecionado}
                          onChange={(e) => setMetodoSelecionado(e.target.value)}
                          className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-verde-500"
                        >
                          {metodosPagamento.map((m) => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      </div>
                      <p className="text-sm text-gray-500 mb-2">Valor: R$ {Number(ag.campo.preco).toFixed(2)}</p>
                      <button
                        type="submit"
                        className="bg-verde-800 hover:bg-verde-900 text-white font-semibold px-5 py-2 rounded-lg transition-colors"
                      >
                        Confirmar Pagamento
                      </button>
                    </form>
                  )}
                </div>
              )
            })}

            {agendamentos.length === 0 && (
              <p className="text-center text-gray-400 py-10">Nenhum agendamento encontrado.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Agendamentos
