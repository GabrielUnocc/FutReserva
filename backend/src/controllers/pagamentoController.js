// src/controllers/pagamentoController.js
// Registro de pagamentos de reservas (RF10)

const prisma = require('../prismaClient')

// POST /api/pagamentos — Registra o pagamento de uma reserva confirmada (somente JOGADOR)
async function criar(req, res) {
  const { agendamentoId, metodo } = req.body

  if (!agendamentoId || !metodo) {
    return res.status(400).json({ erro: 'Agendamento e método de pagamento são obrigatórios.' })
  }

  try {
    const agendamento = await prisma.agendamento.findUnique({
      where: { id: Number(agendamentoId) },
      include: { campo: true }
    })

    if (!agendamento) {
      return res.status(404).json({ erro: 'Agendamento não encontrado.' })
    }

    if (agendamento.jogadorId !== req.usuario.id) {
      return res.status(403).json({ erro: 'Você só pode pagar suas próprias reservas.' })
    }

    if (agendamento.status !== 'CONFIRMADO') {
      return res.status(400).json({ erro: 'Somente agendamentos confirmados podem ser pagos.' })
    }

    const pagamentoExistente = await prisma.pagamento.findUnique({
      where: { agendamentoId: Number(agendamentoId) }
    })

    if (pagamentoExistente) {
      return res.status(409).json({ erro: 'Pagamento já registrado para este agendamento.' })
    }

    const novoPagamento = await prisma.pagamento.create({
      data: {
        agendamentoId: Number(agendamentoId),
        valor: agendamento.campo.preco,
        metodo,
        status: 'PAGO'
      }
    })

    return res.status(201).json({
      mensagem: 'Pagamento registrado com sucesso!',
      pagamento: novoPagamento
    })
  } catch (error) {
    console.error('Erro ao registrar pagamento:', error)
    if (error.code === 'P2002') {
      return res.status(409).json({ erro: 'Pagamento já registrado para este agendamento.' })
    }
    return res.status(500).json({ erro: 'Erro ao registrar pagamento.' })
  }
}

// GET /api/pagamentos/:agendamentoId — Busca o pagamento de um agendamento
async function buscarPorAgendamento(req, res) {
  const { agendamentoId } = req.params

  try {
    const agendamento = await prisma.agendamento.findUnique({
      where: { id: Number(agendamentoId) },
      include: { campo: true }
    })

    if (!agendamento) {
      return res.status(404).json({ erro: 'Agendamento não encontrado.' })
    }

    const ehJogadorDono = agendamento.jogadorId === req.usuario.id
    const ehDonoDoCampo = agendamento.campo.donoId === req.usuario.id
    const ehAdmin = req.usuario.perfil === 'ADMIN'

    if (!ehJogadorDono && !ehDonoDoCampo && !ehAdmin) {
      return res.status(403).json({ erro: 'Você não tem permissão para ver este pagamento.' })
    }

    const pagamento = await prisma.pagamento.findUnique({
      where: { agendamentoId: Number(agendamentoId) }
    })

    if (!pagamento) {
      return res.status(404).json({ erro: 'Nenhum pagamento encontrado para este agendamento.' })
    }

    return res.status(200).json(pagamento)
  } catch (error) {
    console.error('Erro ao buscar pagamento:', error)
    return res.status(500).json({ erro: 'Erro ao buscar pagamento.' })
  }
}

module.exports = { criar, buscarPorAgendamento }
