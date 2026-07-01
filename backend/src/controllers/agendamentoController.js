// src/controllers/agendamentoController.js
const prisma = require('../prismaClient')

// POST /api/agendamentos — Cria um novo agendamento (JOGADOR)
async function criar(req, res) {
  const { horarioId, data } = req.body
  const jogadorId = req.usuario.id

  if (!horarioId || !data) {
    return res.status(400).json({ erro: 'Horário e data são obrigatórios.' })
  }

  try {
    const novoAgendamento = await prisma.agendamento.create({
      data: {
        jogadorId,
        horarioId: Number(horarioId),
        data: new Date(data),
        status: 'PENDENTE'
      }
    })
    return res.status(201).json(novoAgendamento)
  } catch (error) {
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

    const atualizado = await prisma.agendamento.update({
      where: { id: Number(id) },
      data: { status: 'CONFIRMADO' }
    })
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