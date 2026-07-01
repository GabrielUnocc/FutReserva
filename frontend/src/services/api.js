// src/services/api.js
// Instância do axios configurada com a URL base do backend

import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3001/api'
})

// Interceptor — adiciona o token JWT automaticamente em todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('futreserva_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
