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

// Interceptor — se o token expirou ou é inválido (401), limpa a sessão e manda pro login
// em vez de deixar o app preso mostrando erro genérico em toda tela protegida
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('futreserva_token')
      localStorage.removeItem('futreserva_usuario')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
