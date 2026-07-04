// src/services/notificacaoService.js

import api from './api'

export async function getNotificacoes() {
  const res = await api.get('/notificacoes')
  return res.data
}

export async function getNaoLidasCount() {
  const res = await api.get('/notificacoes/nao-lidas')
  return res.data.total
}

export async function marcarLida(id) {
  const res = await api.patch(`/notificacoes/${id}/lida`)
  return res.data
}

export async function marcarTodasLidas() {
  const res = await api.patch('/notificacoes/todas-lidas')
  return res.data
}

export async function deletarNotificacao(id) {
  const res = await api.delete(`/notificacoes/${id}`)
  return res.data
}

export async function limparLidas() {
  const res = await api.delete('/notificacoes/lidas')
  return res.data
}
