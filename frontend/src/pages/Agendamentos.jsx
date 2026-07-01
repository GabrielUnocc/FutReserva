import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { listarAgendamentos, confirmarAgendamento, cancelarAgendamento } from '../services/agendamentoService'
import { useAuth } from '../contexts/AuthContext'
import Navbar from '../components/Navbar'

function Agendamentos() {
  const [agendamentos, setAgendamentos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const { usuario } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    carregarDados()
  }, [])

  async function carregarDados() {
    try {
      const dados = await listarAgendamentos()
      setAgendamentos(dados)
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error)
    } finally {
      setCarregando(false)
    }
  }

  async function handleConfirmar(id) {
    if (!window.confirm('Deseja confirmar este agendamento?')) return
    try {
      await confirmarAgendamento(id)
      carregarDados()
    } catch (error) {
      alert('Erro ao confirmar agendamento.')
    }
  }

  async function handleCancelar(id) {
    if (!window.confirm('Deseja cancelar este agendamento?')) return
    try {
      await cancelarAgendamento(id)
      carregarDados()
    } catch (error) {
      alert('Erro ao cancelar agendamento.')
    }
  }

  if (carregando) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="p-8 text-center">Carregando agendamentos...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto p-6">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-verde-800">
          {usuario.perfil === 'DONO' ? 'Gerenciar Reservas' : 'Meus Agendamentos'}
        </h1>
        
        {usuario.perfil === 'JOGADOR' && (
          <button 
            onClick={() => navigate('/campos')}
            className="bg-verde-800 text-white px-4 py-2 rounded-lg hover:bg-verde-900 transition-colors flex items-center gap-2"
          >
            <span>+</span> Novo Agendamento
          </button>
        )}
      </header>

      {agendamentos.length === 0 ? (
        <div className="bg-white p-8 rounded-xl shadow-sm text-center border">
          <p className="text-gray-500 mb-4">Nenhum agendamento encontrado.</p>
          {usuario.perfil === 'JOGADOR' && (
            <button onClick={() => navigate('/campos')} className="text-verde-700 font-bold hover:underline">Buscar campos disponíveis</button>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {agendamentos.map((item) => (
            <div key={item.id} className="bg-white p-5 rounded-xl shadow-sm border flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                    item.status === 'CONFIRMADO' ? 'bg-green-100 text-green-700' : 
                    item.status === 'CANCELADO' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {item.status}
                  </span>
                  <span className="text-gray-400 text-sm">•</span>
                  <span className="text-gray-600 text-sm font-medium">
                    {new Date(item.data).toLocaleDateString()} às {item.horario.horaInicio}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-800">{item.horario.campo.nome}</h3>
                <p className="text-sm text-gray-500">{item.horario.campo.endereco}</p>
                
                {usuario.perfil === 'DONO' && (
                  <div className="mt-2 p-2 bg-gray-50 rounded border border-gray-100">
                    <p className="text-xs text-gray-500 uppercase font-bold">Cliente</p>
                    <p className="text-sm text-gray-700">{item.jogador.nome} ({item.jogador.email})</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                {item.status === 'PENDENTE' && usuario.perfil === 'DONO' && (
                  <button
                    onClick={() => handleConfirmar(item.id)}
                    className="bg-verde-700 text-white px-4 py-2 rounded-lg hover:bg-verde-800 transition-colors text-sm font-semibold"
                  >
                    Confirmar
                  </button>
                )}
                
                {item.status !== 'CANCELADO' && (
                  <button
                    onClick={() => handleCancelar(item.id)}
                    className="border border-red-200 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors text-sm font-semibold"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  )
}

export default Agendamentos