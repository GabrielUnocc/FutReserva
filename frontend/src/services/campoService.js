// src/services/campoService.js
// Funções de chamada à API para o CRUD de campos

import api from './api'

export async function listarCampos() {
  const resposta = await api.get('/campos')
  return resposta.data
}

export async function listarMeusCampos() {
  const resposta = await api.get('/campos/meus')
  return resposta.data
}

export async function buscarCampo(id) {
  const resposta = await api.get(`/campos/${id}`)
  return resposta.data
}

export async function criarCampo(dados) {
  const resposta = await api.post('/campos', dados)
  return resposta.data
}

export async function atualizarCampo(id, dados) {
  const resposta = await api.put(`/campos/${id}`, dados)
  return resposta.data
}

export async function deletarCampo(id) {
  const resposta = await api.delete(`/campos/${id}`)
  return resposta.data
}
