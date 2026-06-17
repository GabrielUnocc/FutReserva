// src/services/agendamentoService.js
// Funções de comunicação com a API de agendamentos

import api from './api'

export async function criarAgendamento(dados) {
  const res = await api.post('/agendamentos', dados)
  return res.data
}

export async function getMeusAgendamentos() {
  const res = await api.get('/agendamentos/meus')
  return res.data
}

export async function getAgendamentosPendentes() {
  const res = await api.get('/agendamentos/pendentes')
  return res.data
}

export async function getAgendamentosConfirmados() {
  const res = await api.get('/agendamentos/confirmados')
  return res.data
}

export async function confirmarAgendamento(id) {
  const res = await api.patch(`/agendamentos/${id}/confirmar`)
  return res.data
}

export async function cancelarAgendamento(id) {
  const res = await api.patch(`/agendamentos/${id}/cancelar`)
  return res.data
}
