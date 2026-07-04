// src/controllers/dashboardController.js
// Resumo gerencial para o DONO: receita, ocupação e próximas reservas

const prisma = require('../prismaClient')
const { calcularDuracaoHoras } = require('../utils/tempo')

// GET /api/dashboard — Resumo dos campos do dono logado
async function resumo(req, res) {
  const donoId = req.usuario.id

  try {
    const agendamentos = await prisma.agendamento.findMany({
      where: { horario: { campo: { donoId } } },
      include: {
        horario: { include: { campo: true } },
        jogador: { select: { nome: true, email: true } }
      },
      orderBy: { data: 'asc' }
    })

    const confirmados = agendamentos.filter((a) => a.status === 'CONFIRMADO').length
    const pendentes = agendamentos.filter((a) => a.status === 'PENDENTE').length
    const cancelados = agendamentos.filter((a) => a.status === 'CANCELADO').length
    const total = agendamentos.length
    const totalValidos = total - cancelados
    const taxaConfirmacao = totalValidos > 0 ? Math.round((confirmados / totalValidos) * 100) : 0

    const agora = new Date()
    const hojeSemHora = new Date(agora.toDateString())

    // Valor gerado pelos agendamentos CONFIRMADOs cuja data já passou — calculado pelo
    // preço do campo x duração do horário, independente de haver Pagamento registrado
    let valorRealizado = 0
    const valorRealizadoPorCampo = {}
    for (const a of agendamentos) {
      if (a.status !== 'CONFIRMADO' || new Date(a.data) >= hojeSemHora) continue

      const duracaoHoras = calcularDuracaoHoras(a.horario.horaInicio, a.horario.horaFim)
      const valor = a.horario.campo.preco * duracaoHoras
      const nomeCampo = a.horario.campo.nome

      valorRealizado += valor
      valorRealizadoPorCampo[nomeCampo] = (valorRealizadoPorCampo[nomeCampo] || 0) + valor
    }
    valorRealizado = Math.round(valorRealizado * 100) / 100
    for (const nomeCampo in valorRealizadoPorCampo) {
      valorRealizadoPorCampo[nomeCampo] = Math.round(valorRealizadoPorCampo[nomeCampo] * 100) / 100
    }

    const proximasReservas = agendamentos
      .filter((a) => a.status !== 'CANCELADO' && new Date(a.data) >= hojeSemHora)
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
      valorRealizado,
      valorRealizadoPorCampo,
      proximasReservas
    })
  } catch (error) {
    console.error('Erro ao gerar resumo do dashboard:', error)
    return res.status(500).json({ erro: 'Erro ao gerar resumo.' })
  }
}

module.exports = { resumo }
