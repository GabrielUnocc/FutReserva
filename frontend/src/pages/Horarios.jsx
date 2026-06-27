// src/pages/Horarios.jsx
// Tela de Gerenciamento de Horários — acessível pelo DONO via /campos/:campoId/horarios
// CRUD completo de horários recorrentes por dia da semana (RF07)
// Responsável: Rafael Almeida

import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import {
  listarHorarios,
  criarHorario,
  atualizarHorario,
  deletarHorario,
  alterarDisponibilidade
} from '../services/horarioService'
import api from '../services/api'

// ─── Constantes ──────────────────────────────────────────────────────────────

const DIAS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']

const COR_DIA = {
  'Segunda':  'bg-blue-100 text-blue-700',
  'Terça':    'bg-indigo-100 text-indigo-700',
  'Quarta':   'bg-purple-100 text-purple-700',
  'Quinta':   'bg-pink-100 text-pink-700',
  'Sexta':    'bg-orange-100 text-orange-700',
  'Sábado':   'bg-yellow-100 text-yellow-700',
  'Domingo':  'bg-red-100 text-red-700',
}

const FORM_VAZIO = { diaSemana: 'Segunda', horaInicio: '', horaFim: '', disponivel: true }

// ─── Componente de Alerta ─────────────────────────────────────────────────────

function Alerta({ tipo, mensagem, onFechar }) {
  if (!mensagem) return null
  const estilos = {
    sucesso: 'bg-verde-50 text-verde-800 border-verde-200',
    erro:    'bg-red-50 text-red-700 border-red-200',
    aviso:   'bg-yellow-50 text-yellow-800 border-yellow-200',
  }
  return (
    <div className={`flex items-center justify-between px-4 py-3 rounded-lg border text-sm mb-4 ${estilos[tipo]}`}>
      <span>{mensagem}</span>
      <button onClick={onFechar} className="ml-4 font-bold opacity-60 hover:opacity-100">✕</button>
    </div>
  )
}

// ─── Modal de Formulário ──────────────────────────────────────────────────────

function ModalHorario({ aberto, horario, campoId, onSalvar, onFechar }) {
  const [form, setForm] = useState(FORM_VAZIO)
  const [salvando, setSalvando] = useState(false)
  const [erroLocal, setErroLocal] = useState('')

  useEffect(() => {
    if (horario) {
      setForm({
        diaSemana: horario.diaSemana,
        horaInicio: horario.horaInicio,
        horaFim: horario.horaFim,
        disponivel: horario.disponivel
      })
    } else {
      setForm(FORM_VAZIO)
    }
    setErroLocal('')
  }, [horario, aberto])

  async function handleSalvar() {
    setErroLocal('')
    if (!form.horaInicio || !form.horaFim) {
      setErroLocal('Preencha a hora de início e fim.')
      return
    }
    if (form.horaInicio >= form.horaFim) {
      setErroLocal('A hora de início deve ser anterior à hora de fim.')
      return
    }

    setSalvando(true)
    try {
      if (horario) {
        await atualizarHorario(campoId, horario.id, form)
      } else {
        await criarHorario(campoId, form)
      }
      onSalvar()
    } catch (err) {
      setErroLocal(err.response?.data?.erro || 'Erro ao salvar horário.')
    } finally {
      setSalvando(false)
    }
  }

  if (!aberto) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-bold text-gray-800">
            {horario ? 'Editar Horário' : 'Novo Horário'}
          </h2>
          <button onClick={onFechar} className="text-gray-400 hover:text-gray-600 text-xl font-bold">✕</button>
        </div>

        {/* Corpo */}
        <div className="px-6 py-5 space-y-4">
          {erroLocal && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg">
              {erroLocal}
            </div>
          )}

          {/* Dia da semana */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dia da Semana *</label>
            <select
              value={form.diaSemana}
              onChange={(e) => setForm({ ...form, diaSemana: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-verde-500"
            >
              {DIAS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          {/* Horas */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hora Início *</label>
              <input
                type="time"
                value={form.horaInicio}
                onChange={(e) => setForm({ ...form, horaInicio: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-verde-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hora Fim *</label>
              <input
                type="time"
                value={form.horaFim}
                onChange={(e) => setForm({ ...form, horaFim: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-verde-500"
              />
            </div>
          </div>

          {/* Disponível */}
          <div className="flex items-center gap-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={form.disponivel}
                onChange={(e) => setForm({ ...form, disponivel: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-verde-500 rounded-full peer peer-checked:bg-verde-600 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
            </label>
            <span className="text-sm text-gray-700">
              {form.disponivel ? 'Horário ativo (aceita reservas)' : 'Horário inativo (bloqueado)'}
            </span>
          </div>
        </div>

        {/* Rodapé */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-2xl">
          <button
            onClick={onFechar}
            className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSalvar}
            disabled={salvando}
            className="px-4 py-2 text-sm font-semibold text-white bg-verde-600 rounded-lg hover:bg-verde-700 disabled:opacity-60"
          >
            {salvando ? 'Salvando...' : horario ? 'Salvar Alterações' : 'Criar Horário'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Card de Horário ──────────────────────────────────────────────────────────

function CardHorario({ horario, campoId, onEditar, onDeletar, onToggle }) {
  const [toggling, setToggling] = useState(false)

  async function handleToggle() {
    setToggling(true)
    try {
      await onToggle(horario.id, !horario.disponivel)
    } finally {
      setToggling(false)
    }
  }

  return (
    <div className={`bg-white rounded-xl border ${horario.disponivel ? 'border-gray-200' : 'border-gray-200 opacity-60'} shadow-sm p-4 flex items-center justify-between gap-3`}>
      {/* Info */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Badge dia */}
        <span className={`text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap ${COR_DIA[horario.diaSemana] || 'bg-gray-100 text-gray-600'}`}>
          {horario.diaSemana}
        </span>

        {/* Horário */}
        <div className="flex items-center gap-1 text-gray-800 font-medium text-sm">
          <span>🕐</span>
          <span>{horario.horaInicio} – {horario.horaFim}</span>
        </div>

        {/* Status */}
        <span className={`hidden sm:inline text-xs px-2 py-0.5 rounded-full font-medium ${horario.disponivel ? 'bg-verde-100 text-verde-700' : 'bg-gray-100 text-gray-500'}`}>
          {horario.disponivel ? 'Ativo' : 'Inativo'}
        </span>
      </div>

      {/* Ações */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Toggle ativo/inativo */}
        <button
          onClick={handleToggle}
          disabled={toggling}
          title={horario.disponivel ? 'Desativar horário' : 'Ativar horário'}
          className={`text-xs px-2 py-1 rounded-lg border font-medium transition-colors ${
            horario.disponivel
              ? 'border-yellow-300 text-yellow-700 hover:bg-yellow-50'
              : 'border-verde-300 text-verde-700 hover:bg-verde-50'
          } disabled:opacity-50`}
        >
          {toggling ? '...' : horario.disponivel ? 'Desativar' : 'Ativar'}
        </button>

        {/* Editar */}
        <button
          onClick={() => onEditar(horario)}
          title="Editar horário"
          className="text-xs px-2 py-1 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50"
        >
          Editar
        </button>

        {/* Excluir */}
        <button
          onClick={() => onDeletar(horario)}
          title="Excluir horário"
          className="text-xs px-2 py-1 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
        >
          Excluir
        </button>
      </div>
    </div>
  )
}

// ─── Página Principal ─────────────────────────────────────────────────────────

function Horarios() {
  const { campoId } = useParams()

  const [campo, setCampo] = useState(null)
  const [horarios, setHorarios] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [alerta, setAlerta] = useState({ tipo: '', mensagem: '' })

  // Modal
  const [modalAberto, setModalAberto] = useState(false)
  const [horarioEditando, setHorarioEditando] = useState(null)

  // Filtro por dia
  const [filtroDia, setFiltroDia] = useState('Todos')

  // ── Funções de carregamento ──────────────────────────────────────────────────

  const carregarCampo = useCallback(async () => {
    try {
      const { data } = await api.get(`/campos/${campoId}`)
      setCampo(data)
    } catch {
      setCampo({ nome: `Campo #${campoId}` })
    }
  }, [campoId])

  const carregarHorarios = useCallback(async () => {
    try {
      setCarregando(true)
      const dados = await listarHorarios(campoId)
      setHorarios(dados)
    } catch {
      mostrarAlerta('erro', 'Erro ao carregar horários.')
    } finally {
      setCarregando(false)
    }
  }, [campoId])

  useEffect(() => {
    carregarCampo()
    carregarHorarios()
  }, [carregarCampo, carregarHorarios])

  // ── Helpers de UI ────────────────────────────────────────────────────────────

  function mostrarAlerta(tipo, mensagem) {
    setAlerta({ tipo, mensagem })
    setTimeout(() => setAlerta({ tipo: '', mensagem: '' }), 5000)
  }

  function abrirNovo() {
    setHorarioEditando(null)
    setModalAberto(true)
  }

  function abrirEditar(horario) {
    setHorarioEditando(horario)
    setModalAberto(true)
  }

  function fecharModal() {
    setModalAberto(false)
    setHorarioEditando(null)
  }

  async function handleSalvo() {
    fecharModal()
    await carregarHorarios()
    mostrarAlerta('sucesso', horarioEditando ? 'Horário atualizado com sucesso!' : 'Horário criado com sucesso!')
  }

  async function handleDeletar(horario) {
    if (!confirm(`Excluir horário de ${horario.diaSemana} das ${horario.horaInicio} às ${horario.horaFim}?`)) return
    try {
      await deletarHorario(campoId, horario.id)
      await carregarHorarios()
      mostrarAlerta('sucesso', 'Horário excluído com sucesso.')
    } catch (err) {
      mostrarAlerta('erro', err.response?.data?.erro || 'Erro ao excluir horário.')
    }
  }

  async function handleToggle(id, disponivel) {
    try {
      await alterarDisponibilidade(campoId, id, disponivel)
      await carregarHorarios()
      mostrarAlerta('sucesso', `Horário ${disponivel ? 'ativado' : 'desativado'} com sucesso.`)
    } catch (err) {
      mostrarAlerta('erro', err.response?.data?.erro || 'Erro ao alterar disponibilidade.')
    }
  }

  // ── Dados derivados ──────────────────────────────────────────────────────────

  // Agrupa horários por dia para exibição e calcula totais
  const horariosFiltrados = filtroDia === 'Todos'
    ? horarios
    : horarios.filter((h) => h.diaSemana === filtroDia)

  const totalAtivos = horarios.filter((h) => h.disponivel).length
  const totalInativos = horarios.length - totalAtivos

  // Quantos horários por dia (para badge no filtro)
  const contagemPorDia = DIAS.reduce((acc, dia) => {
    acc[dia] = horarios.filter((h) => h.diaSemana === dia).length
    return acc
  }, {})

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-verde-700">Início</Link>
          <span>›</span>
          <Link to="/meus-campos" className="hover:text-verde-700">Meus Campos</Link>
          <span>›</span>
          <span className="text-gray-800 font-medium">{campo?.nome || `Campo #${campoId}`}</span>
          <span>›</span>
          <span className="text-verde-700 font-medium">Horários</span>
        </div>

        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Gerenciar Horários</h1>
            <p className="text-gray-500 text-sm mt-1">
              {campo?.nome} — horários recorrentes por dia da semana
            </p>
          </div>
          <button
            onClick={abrirNovo}
            className="flex items-center gap-2 bg-verde-600 hover:bg-verde-700 text-white font-semibold text-sm px-4 py-2 rounded-xl transition-colors"
          >
            <span className="text-lg leading-none">+</span>
            Novo Horário
          </button>
        </div>

        {/* Alerta */}
        <Alerta tipo={alerta.tipo} mensagem={alerta.mensagem} onFechar={() => setAlerta({ tipo: '', mensagem: '' })} />

        {/* Cards de resumo */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-gray-800">{horarios.length}</p>
            <p className="text-xs text-gray-500 mt-1">Total de Slots</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-verde-700">{totalAtivos}</p>
            <p className="text-xs text-gray-500 mt-1">Ativos</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-gray-400">{totalInativos}</p>
            <p className="text-xs text-gray-500 mt-1">Inativos</p>
          </div>
        </div>

        {/* Filtros por dia */}
        <div className="flex gap-2 flex-wrap mb-5">
          <button
            onClick={() => setFiltroDia('Todos')}
            className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-colors ${
              filtroDia === 'Todos'
                ? 'bg-verde-600 text-white border-verde-600'
                : 'bg-white text-gray-600 border-gray-300 hover:border-verde-400'
            }`}
          >
            Todos ({horarios.length})
          </button>
          {DIAS.map((dia) => (
            contagemPorDia[dia] > 0 && (
              <button
                key={dia}
                onClick={() => setFiltroDia(dia)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-colors ${
                  filtroDia === dia
                    ? 'bg-verde-600 text-white border-verde-600'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-verde-400'
                }`}
              >
                {dia} ({contagemPorDia[dia]})
              </button>
            )
          ))}
        </div>

        {/* Lista de horários */}
        {carregando ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">⏳</p>
            <p>Carregando horários...</p>
          </div>
        ) : horariosFiltrados.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
            <p className="text-5xl mb-3">🕐</p>
            <p className="text-gray-600 font-semibold">
              {filtroDia === 'Todos' ? 'Nenhum horário cadastrado' : `Nenhum horário para ${filtroDia}`}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              {filtroDia === 'Todos'
                ? 'Clique em "Novo Horário" para adicionar o primeiro slot.'
                : 'Selecione outro dia ou adicione um novo horário.'}
            </p>
            {filtroDia === 'Todos' && (
              <button
                onClick={abrirNovo}
                className="mt-4 bg-verde-600 hover:bg-verde-700 text-white text-sm font-semibold px-4 py-2 rounded-xl"
              >
                + Novo Horário
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {/* Agrupa por dia se não há filtro ativo */}
            {filtroDia === 'Todos'
              ? DIAS.filter((d) => contagemPorDia[d] > 0).map((dia) => (
                  <div key={dia}>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{dia}</p>
                    <div className="space-y-2">
                      {horarios
                        .filter((h) => h.diaSemana === dia)
                        .map((h) => (
                          <CardHorario
                            key={h.id}
                            horario={h}
                            campoId={campoId}
                            onEditar={abrirEditar}
                            onDeletar={handleDeletar}
                            onToggle={handleToggle}
                          />
                        ))}
                    </div>
                  </div>
                ))
              : horariosFiltrados.map((h) => (
                  <CardHorario
                    key={h.id}
                    horario={h}
                    campoId={campoId}
                    onEditar={abrirEditar}
                    onDeletar={handleDeletar}
                    onToggle={handleToggle}
                  />
                ))
            }
          </div>
        )}
      </div>

      {/* Modal de criação/edição */}
      <ModalHorario
        aberto={modalAberto}
        horario={horarioEditando}
        campoId={campoId}
        onSalvar={handleSalvo}
        onFechar={fecharModal}
      />
    </div>
  )
}

export default Horarios
