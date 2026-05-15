// src/routes/AppRoutes.jsx
// Definição de todas as rotas do sistema com proteção por perfil

import { Routes, Route, Navigate } from 'react-router-dom'
import PrivateRoute from '../components/PrivateRoute'

import Login from '../pages/Login'
import Cadastro from '../pages/Cadastro'
import Home from '../pages/Home'
import Usuarios from '../pages/Usuarios'
import SemPermissao from '../pages/SemPermissao'

// Páginas ainda não implementadas (placeholder)
const EmConstrucao = ({ titulo }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <p className="text-5xl mb-4">🚧</p>
      <h1 className="text-xl font-bold text-gray-700">{titulo}</h1>
      <p className="text-gray-400 text-sm mt-2">Em desenvolvimento...</p>
    </div>
  </div>
)

function AppRoutes() {
  return (
    <Routes>
      {/* ─── Rotas Públicas ─────────────────────────────── */}
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/sem-permissao" element={<SemPermissao />} />

      {/* ─── Rotas Protegidas (qualquer usuário logado) ─── */}
      <Route path="/" element={
        <PrivateRoute>
          <Home />
        </PrivateRoute>
      } />

      <Route path="/agendamentos" element={
        <PrivateRoute>
          <EmConstrucao titulo="Agendamentos" />
        </PrivateRoute>
      } />

      {/* ─── Rotas de JOGADOR ───────────────────────────── */}
      <Route path="/campos" element={
        <PrivateRoute perfisPermitidos={['JOGADOR', 'ADMIN']}>
          <EmConstrucao titulo="Catálogo de Campos" />
        </PrivateRoute>
      } />

      {/* ─── Rotas de DONO DE CAMPO ─────────────────────── */}
      <Route path="/meus-campos" element={
        <PrivateRoute perfisPermitidos={['DONO']}>
          <EmConstrucao titulo="Meus Campos" />
        </PrivateRoute>
      } />

      <Route path="/horarios" element={
        <PrivateRoute perfisPermitidos={['DONO']}>
          <EmConstrucao titulo="Gerenciar Horários" />
        </PrivateRoute>
      } />

      {/* ─── Rotas de ADMIN ─────────────────────────────── */}
      <Route path="/usuarios" element={
        <PrivateRoute perfisPermitidos={['ADMIN']}>
          <Usuarios />
        </PrivateRoute>
      } />

      {/* Redireciona rotas desconhecidas para home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default AppRoutes
