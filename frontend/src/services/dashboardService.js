// src/services/dashboardService.js
import api from './api'

export async function getResumoDashboard() {
  const { data } = await api.get('/dashboard')
  return data
}
