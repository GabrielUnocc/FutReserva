// src/services/pagamentoService.js
import api from './api'

export async function registrarPagamento(dados) {
  const resposta = await api.post('/pagamentos', dados)
  return resposta.data
}

export async function buscarPagamento(agendamentoId) {
  const resposta = await api.get(`/pagamentos/${agendamentoId}`)
  return resposta.data
}