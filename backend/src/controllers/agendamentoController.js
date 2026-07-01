// src/controllers/agendamentoController.js
// CRUD de agendamentos (RF08, RF09, RF11)

const prisma = require('../prismaClient')

const INCLUDE_PADRAO = {
  campo: true,
  jogador: { select: { id: true, nome: true, email: true } },
  pagamento: true
}

// GET /api/agendamentos — Lista agendamentos, escopado por perfil
async function listar(req, res) {
  try {
    let where = {}

    if (req.usuario.perfil === 'JOGADOR') {
      where = { jogadorId: req.usuario.id }
    } else if (req.usuario.perfil === 'DONO') {
      where = { campo: { donoId: req.usuario.id } }
    }
    // ADMIN não tem filtro — vê todos os agendamentos

    const agendamentos = await prisma.agendamento.findMany({
      where,
      include: INCLUDE_PADRAO,
      orderBy: { data: 'desc' }
    })

    return res.status(200).json(agendamentos)
  } catch (error) {
    console.error('Erro ao listar agendamentos:', error)
    return res.status(500).json({ erro: 'Erro ao buscar agendamentos.' })
  }
}

// POST /api/agendamentos — Cria um agendamento (somente JOGADOR)
async function criar(req, res) {
  const { campoId, data, horaInicio, horaFim } = req.body

  if (!campoId || !data || !horaInicio || !horaFim) {
    return res.status(400).json({ erro: 'Campo, data, hora de início e hora de fim são obrigatórios.' })
  }

  if (horaFim <= horaInicio) {
    return res.status(400).json({ erro: 'A hora de fim deve ser depois da hora de início.' })
  }

  try {
    const campo = await prisma.campo.findUnique({ where: { id: Number(campoId) } })

    if (!campo) {
      return res.status(404).json({ erro: 'Campo não encontrado.' })
    }

    if (horaInicio < campo.horaAbertura || horaFim > campo.horaFechamento) {
      return res.status(400).json({
        erro: `Este campo funciona das ${campo.horaAbertura} às ${campo.horaFechamento}.`
      })
    }

    const dataNormalizada = new Date(`${data}T00:00:00.000Z`)

    const conflito = await prisma.agendamento.findFirst({
      where: {
        campoId: Number(campoId),
        data: dataNormalizada,
        status: { in: ['PENDENTE', 'CONFIRMADO'] },
        horaInicio: { lt: horaFim },
        horaFim: { gt: horaInicio }
      }
    })

    if (conflito) {
      return res.status(409).json({ erro: 'Já existe uma reserva que ocupa esse horário nesta data.' })
    }

    const novoAgendamento = await prisma.agendamento.create({
      data: {
        jogadorId: req.usuario.id,
        campoId: Number(campoId),
        data: dataNormalizada,
        horaInicio,
        horaFim,
        status: 'PENDENTE'
      },
      include: INCLUDE_PADRAO
    })

    return res.status(201).json({
      mensagem: 'Agendamento criado com sucesso!',
      agendamento: novoAgendamento
    })
  } catch (error) {
    console.error('Erro ao criar agendamento:', error)
    return res.status(500).json({ erro: 'Erro ao criar agendamento.' })
  }
}

// PUT /api/agendamentos/:id/confirmar — Confirma um agendamento (somente o DONO do campo)
async function confirmar(req, res) {
  const { id } = req.params

  try {
    const agendamento = await prisma.agendamento.findUnique({
      where: { id: Number(id) },
      include: { campo: true }
    })

    if (!agendamento) {
      return res.status(404).json({ erro: 'Agendamento não encontrado.' })
    }

    if (agendamento.campo.donoId !== req.usuario.id) {
      return res.status(403).json({ erro: 'Você só pode confirmar agendamentos dos seus próprios campos.' })
    }

    if (agendamento.status !== 'PENDENTE') {
      return res.status(400).json({ erro: 'Apenas agendamentos pendentes podem ser confirmados.' })
    }

    const agendamentoAtualizado = await prisma.agendamento.update({
      where: { id: Number(id) },
      data: { status: 'CONFIRMADO' },
      include: INCLUDE_PADRAO
    })

    return res.status(200).json({
      mensagem: 'Agendamento confirmado com sucesso!',
      agendamento: agendamentoAtualizado
    })
  } catch (error) {
    console.error('Erro ao confirmar agendamento:', error)
    if (error.code === 'P2025') {
      return res.status(404).json({ erro: 'Agendamento não encontrado.' })
    }
    return res.status(500).json({ erro: 'Erro ao confirmar agendamento.' })
  }
}

// PUT /api/agendamentos/:id/cancelar — Cancela um agendamento
// Permitido para: o próprio jogador, o dono do campo ou um ADMIN
async function cancelar(req, res) {
  const { id } = req.params

  try {
    const agendamento = await prisma.agendamento.findUnique({
      where: { id: Number(id) },
      include: { campo: true, pagamento: true }
    })

    if (!agendamento) {
      return res.status(404).json({ erro: 'Agendamento não encontrado.' })
    }

    const ehJogadorDono = agendamento.jogadorId === req.usuario.id
    const ehDonoDoCampo = agendamento.campo.donoId === req.usuario.id
    const ehAdmin = req.usuario.perfil === 'ADMIN'

    if (!ehJogadorDono && !ehDonoDoCampo && !ehAdmin) {
      return res.status(403).json({ erro: 'Você não tem permissão para cancelar este agendamento.' })
    }

    if (agendamento.status === 'CANCELADO') {
      return res.status(400).json({ erro: 'Agendamento já está cancelado.' })
    }

    const agendamentoAtualizado = await prisma.agendamento.update({
      where: { id: Number(id) },
      data: { status: 'CANCELADO' },
      include: INCLUDE_PADRAO
    })

    if (agendamento.pagamento) {
      await prisma.pagamento.update({
        where: { agendamentoId: Number(id) },
        data: { status: 'CANCELADO' }
      })
      agendamentoAtualizado.pagamento.status = 'CANCELADO'
    }

    return res.status(200).json({
      mensagem: 'Agendamento cancelado com sucesso.',
      agendamento: agendamentoAtualizado
    })
  } catch (error) {
    console.error('Erro ao cancelar agendamento:', error)
    if (error.code === 'P2025') {
      return res.status(404).json({ erro: 'Agendamento não encontrado.' })
    }
    return res.status(500).json({ erro: 'Erro ao cancelar agendamento.' })
  }
}

module.exports = { listar, criar, confirmar, cancelar }
