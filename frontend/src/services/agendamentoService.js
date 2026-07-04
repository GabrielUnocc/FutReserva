// src/services/agendamentoService.js
import api from './api'

export async function listarAgendamentos() {
  const resposta = await api.get('/agendamentos')
  return resposta.data
}

export async function criarAgendamento(dados) {
  // dados: { horarioId, data }
  const resposta = await api.post('/agendamentos', dados)
  return resposta.data
}

export async function confirmarAgendamento(id) {
  const resposta = await api.put(`/agendamentos/${id}/confirmar`)
  return resposta.data
}

export async function cancelarAgendamento(id) {
  const resposta = await api.put(`/agendamentos/${id}/cancelar`)
  return resposta.data
}

export async function deletarAgendamento(id) {
  const resposta = await api.delete(`/agendamentos/${id}`)
  return resposta.data
}