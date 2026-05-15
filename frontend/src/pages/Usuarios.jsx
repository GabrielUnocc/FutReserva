// src/pages/Usuarios.jsx
// CRUD completo de usuários — acessível apenas pelo ADMIN (RF04)
// Responsável: Gabriel Rosario

import { useState, useEffect } from 'react'
import { listarUsuarios, atualizarUsuario, deletarUsuario } from '../services/userService'
import Navbar from '../components/Navbar'

function Usuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [editando, setEditando] = useState(null) // usuário sendo editado
  const [formEdicao, setFormEdicao] = useState({ nome: '', email: '' })
  const [mensagem, setMensagem] = useState('')

  // Carrega a lista de usuários ao abrir a página
  useEffect(() => {
    carregarUsuarios()
  }, [])

  async function carregarUsuarios() {
    try {
      setCarregando(true)
      const dados = await listarUsuarios()
      setUsuarios(dados)
    } catch (error) {
      setErro('Erro ao carregar usuários.')
    } finally {
      setCarregando(false)
    }
  }

  function iniciarEdicao(usuario) {
    setEditando(usuario.id)
    setFormEdicao({ nome: usuario.nome, email: usuario.email })
    setMensagem('')
  }

  function cancelarEdicao() {
    setEditando(null)
    setFormEdicao({ nome: '', email: '' })
  }

  async function salvarEdicao(id) {
    try {
      await atualizarUsuario(id, formEdicao)
      setMensagem('Usuário atualizado com sucesso!')
      setEditando(null)
      carregarUsuarios()
    } catch (error) {
      setMensagem(error.response?.data?.erro || 'Erro ao atualizar usuário.')
    }
  }

  async function handleDeletar(id, nome) {
    if (!confirm(`Tem certeza que deseja remover "${nome}"?`)) return

    try {
      await deletarUsuario(id)
      setMensagem('Usuário removido com sucesso.')
      carregarUsuarios()
    } catch (error) {
      setMensagem(error.response?.data?.erro || 'Erro ao remover usuário.')
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

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Gerenciar Usuários</h1>
          <span className="text-sm text-gray-500">{usuarios.length} usuário(s) cadastrado(s)</span>
        </div>

        {/* Mensagem de retorno */}
        {mensagem && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-verde-50 text-verde-800 border border-verde-200 text-sm">
            {mensagem}
          </div>
        )}

        {/* Erro de carregamento */}
        {erro && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 text-red-600 border border-red-200 text-sm">
            {erro}
          </div>
        )}

        {/* Loading */}
        {carregando ? (
          <p className="text-center text-gray-400 py-10">Carregando usuários...</p>
        ) : (
          <div className="bg-white rounded-2xl shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-verde-700 text-white">
                <tr>
                  <th className="text-left px-4 py-3">ID</th>
                  <th className="text-left px-4 py-3">Nome</th>
                  <th className="text-left px-4 py-3">Email</th>
                  <th className="text-left px-4 py-3">Perfil</th>
                  <th className="text-left px-4 py-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => (
                  <tr key={u.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-400">{u.id}</td>

                    {/* Nome — campo editável */}
                    <td className="px-4 py-3">
                      {editando === u.id ? (
                        <input
                          value={formEdicao.nome}
                          onChange={(e) => setFormEdicao({ ...formEdicao, nome: e.target.value })}
                          className="border rounded px-2 py-1 text-sm w-full focus:outline-none focus:ring-1 focus:ring-verde-500"
                        />
                      ) : (
                        <span className="font-medium text-gray-800">{u.nome}</span>
                      )}
                    </td>

                    {/* Email — campo editável */}
                    <td className="px-4 py-3">
                      {editando === u.id ? (
                        <input
                          type="email"
                          value={formEdicao.email}
                          onChange={(e) => setFormEdicao({ ...formEdicao, email: e.target.value })}
                          className="border rounded px-2 py-1 text-sm w-full focus:outline-none focus:ring-1 focus:ring-verde-500"
                        />
                      ) : (
                        <span className="text-gray-600">{u.email}</span>
                      )}
                    </td>

                    {/* Perfil */}
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${corPerfil[u.perfil]}`}>
                        {u.perfil}
                      </span>
                    </td>

                    {/* Ações */}
                    <td className="px-4 py-3">
                      {editando === u.id ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => salvarEdicao(u.id)}
                            className="text-xs bg-verde-600 text-white px-3 py-1 rounded hover:bg-verde-700"
                          >
                            Salvar
                          </button>
                          <button
                            onClick={cancelarEdicao}
                            className="text-xs bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => iniciarEdicao(u)}
                            className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded hover:bg-blue-100"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeletar(u.id, u.nome)}
                            className="text-xs bg-red-50 text-red-600 px-3 py-1 rounded hover:bg-red-100"
                          >
                            Remover
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {usuarios.length === 0 && (
              <p className="text-center text-gray-400 py-10">Nenhum usuário cadastrado.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Usuarios
