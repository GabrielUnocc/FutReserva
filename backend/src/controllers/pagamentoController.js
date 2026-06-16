// src/controllers/pagamentoController.js
// Registro de Pagamentos (RF10)
const prisma = require('../prismaClient')

// POST /api/pagamentos — Registra o pagamento de uma reserva (JOGADOR)
async function registrar(req, res) {
  const { agendamentoId, valor, metodoPagamento } = req.body
  const usuarioId = req.usuario.id

  try {
    const agendamento = await prisma.agendamento.findUnique({
      where: { id: Number(agendamentoId) }
    })

    if (!agendamento) return res.status(404).json({ erro: 'Agendamento não encontrado.' })
    if (agendamento.jogadorId !== usuarioId) return res.status(403).json({ erro: 'Apenas o titular da reserva pode registrar o pagamento.' })

    const pagamento = await prisma.pagamento.create({
      data: {
        agendamentoId: Number(agendamentoId),
        valor: parseFloat(valor),
        metodoPagamento,
        status: 'PAGO',
        dataPagamento: new Date()
      }
    })

    return res.status(201).json(pagamento)
  } catch (error) {
    console.error('Erro ao registrar pagamento:', error)
    return res.status(500).json({ erro: 'Erro ao processar pagamento.' })
  }
}

// GET /api/pagamentos/:agendamentoId — Busca detalhes do pagamento
async function buscarPorAgendamento(req, res) {
  const { agendamentoId } = req.params
  const { id: usuarioId, perfil } = req.usuario

  try {
    const pagamento = await prisma.pagamento.findFirst({
      where: { agendamentoId: Number(agendamentoId) },
      include: { agendamento: true }
    })

    if (!pagamento) return res.status(404).json({ erro: 'Pagamento não encontrado.' })
    
    // Verificação simples de privacidade
    if (perfil !== 'ADMIN' && pagamento.agendamento.jogadorId !== usuarioId) {
      return res.status(403).json({ erro: 'Acesso negado.' })
    }

    return res.status(200).json(pagamento)
  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao buscar dados do pagamento.' })
  }
}

module.exports = { registrar, buscarPorAgendamento }