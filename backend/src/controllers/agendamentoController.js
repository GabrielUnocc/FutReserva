// src/controllers/agendamentoController.js
// CRUD de confirmação de agendamentos (RF08, RF09, RF11, RF12)
// Responsável: Bernardo Dal Piva

const prisma = require('../prismaClient')

// POST /api/agendamentos — JOGADOR cria um agendamento
async function criar(req, res) {
  const { horarioId, data } = req.body
  const jogadorId = req.usuario.id

  try {
    const horario = await prisma.horario.findUnique({ where: { id: Number(horarioId) } })
    if (!horario) return res.status(404).json({ erro: 'Horário não encontrado.' })
    if (!horario.disponivel) return res.status(400).json({ erro: 'Este horário não está disponível.' })

    const conflito = await prisma.agendamento.findFirst({
      where: {
        horarioId: Number(horarioId),
        data: new Date(data),
        status: { in: ['PENDENTE', 'CONFIRMADO'] }
      }
    })
    if (conflito) return res.status(409).json({ erro: 'Este horário já está reservado para esta data.' })

    const agendamento = await prisma.agendamento.create({
      data: {
        jogadorId,
        horarioId: Number(horarioId),
        data: new Date(data),
        status: 'PENDENTE'
      },
      include: {
        horario: { include: { campo: true } },
        jogador: { select: { id: true, nome: true, email: true } }
      }
    })

    return res.status(201).json({ mensagem: 'Agendamento criado com sucesso!', agendamento })
  } catch (error) {
    console.error('Erro ao criar agendamento:', error)
    return res.status(500).json({ erro: 'Erro ao criar agendamento.' })
  }
}

// GET /api/agendamentos/meus — JOGADOR lista seus agendamentos
async function listarMeus(req, res) {
  const jogadorId = req.usuario.id

  try {
    const agendamentos = await prisma.agendamento.findMany({
      where: { jogadorId },
      include: { horario: { include: { campo: true } } },
      orderBy: { data: 'desc' }
    })

    return res.status(200).json(agendamentos)
  } catch (error) {
    console.error('Erro ao listar agendamentos:', error)
    return res.status(500).json({ erro: 'Erro ao buscar agendamentos.' })
  }
}

// GET /api/agendamentos/pendentes — DONO lista pendentes dos seus campos
async function listarPendentes(req, res) {
  const donoId = req.usuario.id

  try {
    const agendamentos = await prisma.agendamento.findMany({
      where: {
        status: 'PENDENTE',
        horario: { campo: { donoId } }
      },
      include: {
        horario: { include: { campo: true } },
        jogador: { select: { id: true, nome: true, email: true } }
      },
      orderBy: { createdAt: 'asc' }
    })

    return res.status(200).json(agendamentos)
  } catch (error) {
    console.error('Erro ao listar pendentes:', error)
    return res.status(500).json({ erro: 'Erro ao buscar agendamentos pendentes.' })
  }
}

// GET /api/agendamentos/confirmados — DONO lista confirmados dos seus campos (RF12)
async function listarConfirmados(req, res) {
  const donoId = req.usuario.id

  try {
    const agendamentos = await prisma.agendamento.findMany({
      where: {
        status: 'CONFIRMADO',
        horario: { campo: { donoId } }
      },
      include: {
        horario: { include: { campo: true } },
        jogador: { select: { id: true, nome: true, email: true } }
      },
      orderBy: { data: 'asc' }
    })

    return res.status(200).json(agendamentos)
  } catch (error) {
    console.error('Erro ao listar confirmados:', error)
    return res.status(500).json({ erro: 'Erro ao buscar agendamentos confirmados.' })
  }
}

// PATCH /api/agendamentos/:id/confirmar — DONO confirma um agendamento (RF09)
async function confirmar(req, res) {
  const { id } = req.params
  const donoId = req.usuario.id

  try {
    const agendamento = await prisma.agendamento.findUnique({
      where: { id: Number(id) },
      include: { horario: { include: { campo: true } } }
    })

    if (!agendamento) return res.status(404).json({ erro: 'Agendamento não encontrado.' })

    if (agendamento.horario.campo.donoId !== donoId) {
      return res.status(403).json({ erro: 'Você não tem permissão para confirmar este agendamento.' })
    }

    if (agendamento.status !== 'PENDENTE') {
      return res.status(400).json({ erro: `Agendamento já está com status: ${agendamento.status}.` })
    }

    const atualizado = await prisma.agendamento.update({
      where: { id: Number(id) },
      data: { status: 'CONFIRMADO' },
      include: {
        horario: { include: { campo: true } },
        jogador: { select: { id: true, nome: true, email: true } }
      }
    })

    return res.status(200).json({ mensagem: 'Agendamento confirmado com sucesso!', agendamento: atualizado })
  } catch (error) {
    console.error('Erro ao confirmar agendamento:', error)
    return res.status(500).json({ erro: 'Erro ao confirmar agendamento.' })
  }
}

// PATCH /api/agendamentos/:id/cancelar — DONO ou JOGADOR cancela (RF11)
async function cancelar(req, res) {
  const { id } = req.params
  const usuarioId = req.usuario.id
  const perfil = req.usuario.perfil

  try {
    const agendamento = await prisma.agendamento.findUnique({
      where: { id: Number(id) },
      include: { horario: { include: { campo: true } } }
    })

    if (!agendamento) return res.status(404).json({ erro: 'Agendamento não encontrado.' })

    const ehDono = perfil === 'DONO' && agendamento.horario.campo.donoId === usuarioId
    const ehJogador = agendamento.jogadorId === usuarioId
    const ehAdmin = perfil === 'ADMIN'

    if (!ehDono && !ehJogador && !ehAdmin) {
      return res.status(403).json({ erro: 'Você não tem permissão para cancelar este agendamento.' })
    }

    if (agendamento.status === 'CANCELADO') {
      return res.status(400).json({ erro: 'Este agendamento já está cancelado.' })
    }

    const atualizado = await prisma.agendamento.update({
      where: { id: Number(id) },
      data: { status: 'CANCELADO' }
    })

    return res.status(200).json({ mensagem: 'Agendamento cancelado com sucesso.', agendamento: atualizado })
  } catch (error) {
    console.error('Erro ao cancelar agendamento:', error)
    return res.status(500).json({ erro: 'Erro ao cancelar agendamento.' })
  }
}

module.exports = { criar, listarMeus, listarPendentes, listarConfirmados, confirmar, cancelar }
