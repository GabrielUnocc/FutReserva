// src/contexts/AuthContext.jsx
// Contexto global de autenticação — disponibiliza o usuário logado para todo o app

import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [carregando, setCarregando] = useState(true)

  // Ao carregar o app, verifica se há um usuário salvo no localStorage
  useEffect(() => {
    const usuarioSalvo = localStorage.getItem('futreserva_usuario')
    const tokenSalvo = localStorage.getItem('futreserva_token')

    if (usuarioSalvo && tokenSalvo) {
      setUsuario(JSON.parse(usuarioSalvo))
    }

    setCarregando(false)
  }, [])

  // Salva o usuário e token no localStorage após o login
  function salvarLogin(dadosUsuario, token) {
    localStorage.setItem('futreserva_usuario', JSON.stringify(dadosUsuario))
    localStorage.setItem('futreserva_token', token)
    setUsuario(dadosUsuario)
  }

  // Remove os dados do localStorage ao fazer logout
  function logout() {
    localStorage.removeItem('futreserva_usuario')
    localStorage.removeItem('futreserva_token')
    setUsuario(null)
  }

  return (
    <AuthContext.Provider value={{ usuario, salvarLogin, logout, carregando }}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook personalizado para usar o contexto facilmente
export function useAuth() {
  return useContext(AuthContext)
}
