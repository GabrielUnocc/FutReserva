// src/controllers/dashboardController.js
// Resumo gerencial para o DONO: receita, ocupação e próximas reservas

const prisma = require('../prismaClient')

// GET /api/dashboard — Resumo dos campos do dono logado
async function resumo(req, res) {
  const donoId = req.usuario.id

  try {
    const agendamentos = await prisma.agendamento.findMany({
      where: { horario: { campo: { donoId } } },
      include: {
        horario: { include: { campo: true } },
        jogador: { select: { nome: true, email: true } },
        pagamento: true
      },
      orderBy: { data: 'asc' }
    })

    const confirmados = agendamentos.filter((a) => a.status === 'CONFIRMADO').length
    const pendentes = agendamentos.filter((a) => a.status === 'PENDENTE').length
    const cancelados = agendamentos.filter((a) => a.status === 'CANCELADO').length
    const total = agendamentos.length
    const totalValidos = total - cancelados
    const taxaConfirmacao = totalValidos > 0 ? Math.round((confirmados / totalValidos) * 100) : 0

    const receitaTotal = agendamentos
      .filter((a) => a.pagamento?.status === 'PAGO')
      .reduce((soma, a) => soma + a.pagamento.valor, 0)

    const receitaPorCampo = {}
    for (const a of agendamentos) {
      if (a.pagamento?.status !== 'PAGO') continue
      const nomeCampo = a.horario.campo.nome
      receitaPorCampo[nomeCampo] = (receitaPorCampo[nomeCampo] || 0) + a.pagamento.valor
    }

    const agora = new Date()
    const proximasReservas = agendamentos
      .filter((a) => a.status !== 'CANCELADO' && new Date(a.data) >= new Date(agora.toDateString()))
      .slice(0, 10)
      .map((a) => ({
        id: a.id,
        campo: a.horario.campo.nome,
        jogador: a.jogador.nome,
        data: a.data,
        horaInicio: a.horario.horaInicio,
        horaFim: a.horario.horaFim,
        status: a.status
      }))

    return res.status(200).json({
      totalAgendamentos: total,
      confirmados,
      pendentes,
      cancelados,
      taxaConfirmacao,
      receitaTotal,
      receitaPorCampo,
      proximasReservas
    })
  } catch (error) {
    console.error('Erro ao gerar resumo do dashboard:', error)
    return res.status(500).json({ erro: 'Erro ao gerar resumo.' })
  }
}

module.exports = { resumo }
