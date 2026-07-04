// src/services/horarioService.js
// Funções para consumir a API de horários

import api from './api'

const base = (campoId) => `/campos/${campoId}/horarios`

// Lista todos os horários de um campo
export async function listarHorarios(campoId) {
  const { data } = await api.get(base(campoId))
  return data
}

// Busca horário por ID
export async function buscarHorario(campoId, id) {
  const { data } = await api.get(`${base(campoId)}/${id}`)
  return data
}

// Cria novo horário
export async function criarHorario(campoId, payload) {
  const { data } = await api.post(base(campoId), payload)
  return data
}

// Atualiza horário existente
export async function atualizarHorario(campoId, id, payload) {
  const { data } = await api.put(`${base(campoId)}/${id}`, payload)
  return data
}

// Remove horário
export async function deletarHorario(campoId, id) {
  const { data } = await api.delete(`${base(campoId)}/${id}`)
  return data
}

// Ativa ou desativa horário
export async function alterarDisponibilidade(campoId, id, disponivel) {
  const { data } = await api.patch(`${base(campoId)}/${id}/disponibilidade`, { disponivel })
  return data
}
