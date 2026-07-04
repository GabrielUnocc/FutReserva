// src/pages/Campos.jsx
// Catálogo de campos disponíveis para agendamento (RF06)

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { listarCampos } from '../services/campoService'
import { listarHorarios } from '../services/horarioService'
import { criarAgendamento } from '../services/agendamentoService'
import Navbar from '../components/Navbar'

const hoje = new Date().toISOString().split('T')[0]

function Campos() {
  const { usuario } = useAuth()
  const navigate = useNavigate()

  const [campos, setCampos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [mensagem, setMensagem] = useState('')

  const [campoAbertoId, setCampoAbertoId] = useState(null)
  const [horarios, setHorarios] = useState([])
  const [carregandoHorarios, setCarregandoHorarios] = useState(false)

  const [horarioSelecionadoId, setHorarioSelecionadoId] = useState(null)
  const [data, setData] = useState(hoje)

  useEffect(() => {
    carregarCampos()
  }, [])

  async function carregarCampos() {
    try {
      setCarregando(true)
      const dados = await listarCampos()
      setCampos(dados)
    } catch (error) {
      setErro('Erro ao carregar campos.')
    } finally {
      setCarregando(false)
    }
  }

  async function verHorarios(campo) {
    if (campoAbertoId === campo.id) {
      setCampoAbertoId(null)
      return
    }

    setCampoAbertoId(campo.id)
    setHorarioSelecionadoId(null)
    setMensagem('')

    try {
      setCarregandoHorarios(true)
      const dados = await listarHorarios(campo.id)
      setHorarios(dados.filter((h) => h.disponivel))
    } catch (error) {
      setMensagem('Erro ao carregar horários deste campo.')
    } finally {
      setCarregandoHorarios(false)
    }
  }

  async function handleAgendar(e) {
    e.preventDefault()
    setMensagem('')

    try {
      await criarAgendamento({ horarioId: horarioSelecionadoId, data })
      setMensagem('Agendamento criado! Acompanhe em Meus Agendamentos.')
      setCampoAbertoId(null)
      setTimeout(() => navigate('/agendamentos'), 1200)
    } catch (error) {
      setMensagem(error.response?.data?.erro || 'Erro ao criar agendamento.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Campos Disponíveis</h1>

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

        {carregando ? (
          <p className="text-center text-gray-400 py-10">Carregando campos...</p>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {campos.map((campo) => (
              <div key={campo.id} className="bg-white rounded-2xl shadow-md p-6">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <p className="text-lg font-semibold text-gray-800">{campo.nome}</p>
                    <p className="text-sm text-gray-500">{campo.endereco}</p>
                    {campo.descricao && <p className="text-sm text-gray-400 mt-1">{campo.descricao}</p>}
                    <p className="text-xs text-gray-400 mt-1">Dono: {campo.dono?.nome}</p>
                    <p className="text-sm font-semibold text-verde-700 mt-2">
                      R$ {Number(campo.preco).toFixed(2)} / hora
                    </p>
                  </div>

                  {usuario?.perfil === 'JOGADOR' && (
                    <button
                      onClick={() => verHorarios(campo)}
                      className="text-xs bg-verde-700 text-white px-3 py-1.5 rounded hover:bg-verde-800 shrink-0"
                    >
                      {campoAbertoId === campo.id ? 'Fechar' : 'Ver horários'}
                    </button>
                  )}
                </div>

                {campoAbertoId === campo.id && (
                  <div className="mt-4 border-t border-gray-100 pt-4">
                    {carregandoHorarios ? (
                      <p className="text-sm text-gray-400">Carregando horários...</p>
                    ) : horarios.length === 0 ? (
                      <p className="text-sm text-gray-400">Nenhum horário disponível neste campo.</p>
                    ) : (
                      <>
                        <p className="text-xs font-medium text-gray-500 mb-2">Escolha um horário:</p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {horarios.map((h) => (
                            <button
                              key={h.id}
                              onClick={() => setHorarioSelecionadoId(h.id)}
                              className={`text-xs px-3 py-1.5 rounded border transition-colors ${
                                horarioSelecionadoId === h.id
                                  ? 'bg-verde-700 text-white border-verde-700'
                                  : 'bg-white text-gray-700 border-gray-300 hover:border-verde-400'
                              }`}
                            >
                              {h.diaSemana} · {h.horaInicio}–{h.horaFim}
                            </button>
                          ))}
                        </div>

                        {horarioSelecionadoId && (
                          <form onSubmit={handleAgendar} className="flex items-end gap-3 flex-wrap">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Data</label>
                              <input
                                type="date"
                                min={hoje}
                                value={data}
                                onChange={(e) => setData(e.target.value)}
                                required
                                className="border rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-verde-500"
                              />
                            </div>
                            <button type="submit" className="text-sm bg-verde-600 text-white px-4 py-1.5 rounded hover:bg-verde-700">
                              Confirmar Agendamento
                            </button>
                          </form>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}

            {campos.length === 0 && (
              <p className="text-center text-gray-400 py-10">Nenhum campo cadastrado ainda.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Campos
