// src/controllers/agendamentoController.js
const prisma = require('../prismaClient')

// Índice = Date.prototype.getUTCDay() (0 = Domingo ... 6 = Sábado)
const DIAS_SEMANA_POR_INDICE = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

async function notificar(usuarioId, mensagem) {
  await prisma.notificacao.create({ data: { usuarioId, mensagem } })
}

// POST /api/agendamentos — Cria um novo agendamento (JOGADOR)
async function criar(req, res) {
  const { horarioId, data } = req.body
  const jogadorId = req.usuario.id

  if (!horarioId || !data) {
    return res.status(400).json({ erro: 'Horário e data são obrigatórios.' })
  }

  try {
    const horario = await prisma.horario.findUnique({ where: { id: Number(horarioId) } })
    if (!horario) return res.status(404).json({ erro: 'Horário não encontrado.' })
    if (!horario.disponivel) return res.status(400).json({ erro: 'Este horário não está disponível.' })

    // O horário é um template recorrente por dia da semana — a data escolhida precisa cair nesse dia
    const diaDaData = DIAS_SEMANA_POR_INDICE[new Date(data).getUTCDay()]
    if (diaDaData !== horario.diaSemana) {
      return res.status(400).json({
        erro: `Este horário é recorrente às ${horario.diaSemana}s. A data informada cai em uma ${diaDaData}.`
      })
    }

    const conflito = await prisma.agendamento.findFirst({
      where: {
        horarioId: Number(horarioId),
        data: new Date(data),
        status: { in: ['PENDENTE', 'CONFIRMADO'] }
      }
    })
    if (conflito) return res.status(409).json({ erro: 'Este horário já está reservado para esta data.' })

    const novoAgendamento = await prisma.agendamento.create({
      data: {
        jogadorId,
        horarioId: Number(horarioId),
        data: new Date(data),
        status: 'PENDENTE'
      },
      include: {
        jogador: { select: { nome: true } },
        horario: { include: { campo: true } }
      }
    })

    await notificar(
      novoAgendamento.horario.campo.donoId,
      `Nova reserva de ${novoAgendamento.jogador.nome} para ${novoAgendamento.horario.campo.nome} em ${new Date(novoAgendamento.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}.`
    )

    return res.status(201).json(novoAgendamento)
  } catch (error) {
    if (error.code === 'P2003') {
      return res.status(401).json({ erro: 'Sua sessão é inválida. Faça login novamente.' })
    }
    return res.status(500).json({ erro: 'Erro ao processar agendamento.' })
  }
}

// GET /api/agendamentos — Lista agendamentos com base no perfil
async function listar(req, res) {
  const { id, perfil } = req.usuario
  try {
    let filtro = {}
    if (perfil === 'JOGADOR') filtro = { jogadorId: id }
    else if (perfil === 'DONO') filtro = { horario: { campo: { donoId: id } } }

    const agendamentos = await prisma.agendamento.findMany({
      where: filtro,
      include: {
        jogador: { select: { nome: true, email: true } },
        horario: { include: { campo: { select: { nome: true, endereco: true } } } }
      },
      orderBy: { data: 'asc' }
    })
    return res.status(200).json(agendamentos)
  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao buscar agendamentos.' })
  }
}

// PUT /api/agendamentos/:id/confirmar — Confirmação (DONO)
async function confirmar(req, res) {
  const { id } = req.params
  const { id: usuarioId, perfil } = req.usuario

  try {
    const agendamento = await prisma.agendamento.findUnique({
      where: { id: Number(id) },
      include: { horario: { include: { campo: true } } }
    })

    if (!agendamento) return res.status(404).json({ erro: 'Agendamento não encontrado.' })
    if (perfil !== 'ADMIN' && agendamento.horario.campo.donoId !== usuarioId) {
      return res.status(403).json({ erro: 'Apenas o dono do campo pode confirmar.' })
    }
    if (agendamento.status !== 'PENDENTE') {
      return res.status(409).json({ erro: `Apenas agendamentos pendentes podem ser confirmados (status atual: ${agendamento.status}).` })
    }

    const atualizado = await prisma.agendamento.update({
      where: { id: Number(id) },
      data: { status: 'CONFIRMADO' }
    })

    await notificar(
      agendamento.jogadorId,
      `Sua reserva em ${agendamento.horario.campo.nome} (${agendamento.horario.diaSemana}, ${agendamento.horario.horaInicio} às ${agendamento.horario.horaFim}) foi confirmada!`
    )

    return res.status(200).json(atualizado)
  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao confirmar agendamento.' })
  }
}

// PUT /api/agendamentos/:id/cancelar — Cancelamento (JOGADOR/DONO)
async function cancelar(req, res) {
  const { id } = req.params
  const { id: usuarioId, perfil } = req.usuario

  try {
    const agendamento = await prisma.agendamento.findUnique({
      where: { id: Number(id) },
      include: { horario: { include: { campo: true } } }
    })

    if (!agendamento) return res.status(404).json({ erro: 'Agendamento não encontrado.' })

    const isDono = agendamento.horario.campo.donoId === usuarioId
    const isJogador = agendamento.jogadorId === usuarioId

    if (perfil !== 'ADMIN' && !isDono && !isJogador) {
      return res.status(403).json({ erro: 'Sem permissão para cancelar.' })
    }

    const cancelado = await prisma.agendamento.update({
      where: { id: Number(id) },
      data: { status: 'CANCELADO' }
    })

    if (isJogador) {
      await notificar(
        agendamento.horario.campo.donoId,
        `A reserva de ${req.usuario.nome} para ${agendamento.horario.campo.nome} foi cancelada pelo jogador.`
      )
    } else if (isDono) {
      await notificar(
        agendamento.jogadorId,
        `Sua reserva em ${agendamento.horario.campo.nome} foi cancelada pelo dono do campo.`
      )
    }

    return res.status(200).json(cancelado)
  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao cancelar agendamento.' })
  }
}

async function deletar(req, res) {
  const { id } = req.params
  try {
    await prisma.agendamento.delete({ where: { id: Number(id) } })
    return res.status(200).json({ mensagem: 'Agendamento removido.' })
  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao remover agendamento.' })
  }
}

module.exports = {
  criar,
  listar,
  confirmar,
  cancelar,
  deletar
}