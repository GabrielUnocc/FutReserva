// src/components/Layout.jsx
// Layout padrão das páginas autenticadas: Navbar + Breadcrumb + conteúdo

import Navbar from './Navbar'
import Breadcrumb from './Breadcrumb'

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <Breadcrumb />
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}

export default Layout
