// src/services/authService.js
// Funções de chamada à API para autenticação

import api from './api'

// Cadastra um novo usuário
export async function cadastrar(dados) {
  const resposta = await api.post('/auth/cadastro', dados)
  return resposta.data
}

// Realiza o login e retorna o token + dados do usuário
export async function login(email, senha) {
  const resposta = await api.post('/auth/login', { email, senha })
  return resposta.data
}
