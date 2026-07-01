// src/pages/MeusCampos.jsx
// CRUD de campos do próprio DONO (RF05)

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { listarMeusCampos, criarCampo, atualizarCampo, deletarCampo } from '../services/campoService'
import Navbar from '../components/Navbar'

const FORM_VAZIO = { nome: '', endereco: '', descricao: '', preco: '' }

function MeusCampos() {
  const [campos, setCampos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [mensagem, setMensagem] = useState('')

  const [criando, setCriando] = useState(false)
  const [formNovo, setFormNovo] = useState(FORM_VAZIO)

  const [editando, setEditando] = useState(null)
  const [formEdicao, setFormEdicao] = useState(FORM_VAZIO)

  useEffect(() => {
    carregarCampos()
  }, [])

  async function carregarCampos() {
    try {
      setCarregando(true)
      const dados = await listarMeusCampos()
      setCampos(dados)
    } catch (error) {
      setErro('Erro ao carregar campos.')
    } finally {
      setCarregando(false)
    }
  }

  async function handleCriar(e) {
    e.preventDefault()
    setMensagem('')

    try {
      await criarCampo(formNovo)
      setMensagem('Campo cadastrado com sucesso!')
      setFormNovo(FORM_VAZIO)
      setCriando(false)
      carregarCampos()
    } catch (error) {
      setMensagem(error.response?.data?.erro || 'Erro ao cadastrar campo.')
    }
  }

  function iniciarEdicao(campo) {
    setEditando(campo.id)
    setFormEdicao({
      nome: campo.nome,
      endereco: campo.endereco,
      descricao: campo.descricao || '',
      preco: campo.preco
    })
    setMensagem('')
  }

  function cancelarEdicao() {
    setEditando(null)
    setFormEdicao(FORM_VAZIO)
  }

  async function salvarEdicao(id) {
    try {
      await atualizarCampo(id, formEdicao)
      setMensagem('Campo atualizado com sucesso!')
      setEditando(null)
      carregarCampos()
    } catch (error) {
      setMensagem(error.response?.data?.erro || 'Erro ao atualizar campo.')
    }
  }

  async function handleDeletar(id, nome) {
    if (!confirm(`Tem certeza que deseja remover "${nome}"?`)) return

    try {
      await deletarCampo(id)
      setMensagem('Campo removido com sucesso.')
      carregarCampos()
    } catch (error) {
      setMensagem(error.response?.data?.erro || 'Erro ao remover campo.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Meus Campos</h1>
          <button
            onClick={() => setCriando(!criando)}
            className="text-sm bg-verde-700 text-white px-4 py-2 rounded-lg hover:bg-verde-800"
          >
            {criando ? 'Cancelar' : '+ Novo Campo'}
          </button>
        </div>

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

        {criando && (
          <form onSubmit={handleCriar} className="bg-white rounded-2xl shadow-md p-6 mb-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input
                  type="text"
                  value={formNovo.nome}
                  onChange={(e) => setFormNovo({ ...formNovo, nome: e.target.value })}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-verde-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preço por horário (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formNovo.preco}
                  onChange={(e) => setFormNovo({ ...formNovo, preco: e.target.value })}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-verde-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
              <input
                type="text"
                value={formNovo.endereco}
                onChange={(e) => setFormNovo({ ...formNovo, endereco: e.target.value })}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-verde-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição <span className="text-gray-400 font-normal">(opcional)</span>
              </label>
              <textarea
                value={formNovo.descricao}
                onChange={(e) => setFormNovo({ ...formNovo, descricao: e.target.value })}
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-verde-500"
              />
            </div>
            <button
              type="submit"
              className="bg-verde-800 hover:bg-verde-900 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors"
            >
              Salvar campo
            </button>
          </form>
        )}

        {carregando ? (
          <p className="text-center text-gray-400 py-10">Carregando campos...</p>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {campos.map((campo) => (
              <div key={campo.id} className="bg-white rounded-2xl shadow-md p-6">
                {editando === campo.id ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        value={formEdicao.nome}
                        onChange={(e) => setFormEdicao({ ...formEdicao, nome: e.target.value })}
                        className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-verde-500"
                        placeholder="Nome"
                      />
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={formEdicao.preco}
                        onChange={(e) => setFormEdicao({ ...formEdicao, preco: e.target.value })}
                        className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-verde-500"
                        placeholder="Preço"
                      />
                    </div>
                    <input
                      value={formEdicao.endereco}
                      onChange={(e) => setFormEdicao({ ...formEdicao, endereco: e.target.value })}
                      className="border rounded px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-verde-500"
                      placeholder="Endereço"
                    />
                    <textarea
                      value={formEdicao.descricao}
                      onChange={(e) => setFormEdicao({ ...formEdicao, descricao: e.target.value })}
                      className="border rounded px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-verde-500"
                      rows={2}
                      placeholder="Descrição"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => salvarEdicao(campo.id)}
                        className="text-xs bg-verde-600 text-white px-3 py-1.5 rounded hover:bg-verde-700"
                      >
                        Salvar
                      </button>
                      <button
                        onClick={cancelarEdicao}
                        className="text-xs bg-gray-200 text-gray-700 px-3 py-1.5 rounded hover:bg-gray-300"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <p className="text-lg font-semibold text-gray-800">{campo.nome}</p>
                      <p className="text-sm text-gray-500">{campo.endereco}</p>
                      {campo.descricao && <p className="text-sm text-gray-400 mt-1">{campo.descricao}</p>}
                      <p className="text-sm font-semibold text-verde-700 mt-2">
                        R$ {Number(campo.preco).toFixed(2)} / hora
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {campo._count?.horarios ?? 0} horário(s) cadastrado(s)
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      <Link
                        to={`/campos/${campo.id}/horarios`}
                        className="text-xs bg-verde-50 text-verde-700 px-3 py-1.5 rounded hover:bg-verde-100 text-center"
                      >
                        Gerenciar horários
                      </Link>
                      <button
                        onClick={() => iniciarEdicao(campo)}
                        className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded hover:bg-blue-100"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeletar(campo.id, campo.nome)}
                        className="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded hover:bg-red-100"
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {campos.length === 0 && (
              <p className="text-center text-gray-400 py-10">Você ainda não cadastrou nenhum campo.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default MeusCampos
