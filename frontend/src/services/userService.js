// src/services/userService.js
// Funções de chamada à API para o CRUD de usuários

import api from './api'

export async function listarUsuarios() {
  const resposta = await api.get('/usuarios')
  return resposta.data
}

export async function buscarUsuario(id) {
  const resposta = await api.get(`/usuarios/${id}`)
  return resposta.data
}

export async function atualizarUsuario(id, dados) {
  const resposta = await api.put(`/usuarios/${id}`, dados)
  return resposta.data
}

export async function deletarUsuario(id) {
  const resposta = await api.delete(`/usuarios/${id}`)
  return resposta.data
}
