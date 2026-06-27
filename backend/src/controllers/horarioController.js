// src/controllers/horarioController.js
// CRUD de Horários disponíveis por campo (RF07)
// Responsável: Rafael Almeida
//
// Regras de negócio:
// - Horários são RECORRENTES por dia da semana (template semanal)
// - Apenas o DONO do campo pode criar/editar/excluir horários do seu campo
// - A verificação de disponibilidade (ocupado/livre) considera cada data individualmente
//   via tabela de Agendamento — o horário em si nunca é bloqueado para sempre

const prisma = require('../prismaClient')

const DIAS_VALIDOS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']

// ─── Helpers ─────────────────────────────────────────────────────────────────

// Valida formato HH:MM
function validarHora(hora) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(hora)
}

// Garante que o usuário logado é o dono do campo
async function verificarPropriedade(campoId, donoId) {
  const campo = await prisma.campo.findUnique({ where: { id: Number(campoId) } })
  if (!campo) return { erro: 'Campo não encontrado.', status: 404 }
  if (campo.donoId !== donoId) return { erro: 'Você não tem permissão para gerenciar este campo.', status: 403 }
  return { campo }
}

// ─── GET /api/campos/:campoId/horarios ───────────────────────────────────────
// Lista todos os horários de um campo (acessível a qualquer usuário autenticado)
async function listar(req, res) {
  const { campoId } = req.params

  try {
    const campo = await prisma.campo.findUnique({ where: { id: Number(campoId) } })
    if (!campo) return res.status(404).json({ erro: 'Campo não encontrado.' })

    const horarios = await prisma.horario.findMany({
      where: { campoId: Number(campoId) },
      orderBy: [
        // Ordena por posição no array DIAS_VALIDOS, depois por hora
        { diaSemana: 'asc' },
        { horaInicio: 'asc' }
      ]
    })

    // Reordena conforme a ordem real dos dias da semana
    const ordenado = horarios.sort((a, b) => {
      const ia = DIAS_VALIDOS.indexOf(a.diaSemana)
      const ib = DIAS_VALIDOS.indexOf(b.diaSemana)
      if (ia !== ib) return ia - ib
      return a.horaInicio.localeCompare(b.horaInicio)
    })

    return res.status(200).json(ordenado)
  } catch (error) {
    console.error('Erro ao listar horários:', error)
    return res.status(500).json({ erro: 'Erro ao buscar horários.' })
  }
}

// ─── GET /api/campos/:campoId/horarios/:id ───────────────────────────────────
// Busca um horário específico por ID
async function buscarPorId(req, res) {
  const { campoId, id } = req.params

  try {
    const horario = await prisma.horario.findFirst({
      where: { id: Number(id), campoId: Number(campoId) }
    })

    if (!horario) return res.status(404).json({ erro: 'Horário não encontrado.' })

    return res.status(200).json(horario)
  } catch (error) {
    console.error('Erro ao buscar horário:', error)
    return res.status(500).json({ erro: 'Erro ao buscar horário.' })
  }
}

// ─── POST /api/campos/:campoId/horarios ──────────────────────────────────────
// Cria um novo horário recorrente no campo
async function criar(req, res) {
  const { campoId } = req.params
  const { diaSemana, horaInicio, horaFim, disponivel } = req.body

  // Validações
  if (!diaSemana || !horaInicio || !horaFim) {
    return res.status(400).json({ erro: 'Dia da semana, hora de início e hora de fim são obrigatórios.' })
  }

  if (!DIAS_VALIDOS.includes(diaSemana)) {
    return res.status(400).json({ erro: `Dia da semana inválido. Use: ${DIAS_VALIDOS.join(', ')}.` })
  }

  if (!validarHora(horaInicio) || !validarHora(horaFim)) {
    return res.status(400).json({ erro: 'Horário deve estar no formato HH:MM (ex: 08:00).' })
  }

  if (horaInicio >= horaFim) {
    return res.status(400).json({ erro: 'A hora de início deve ser anterior à hora de fim.' })
  }

  try {
    // Verifica se o usuário é dono do campo
    const check = await verificarPropriedade(campoId, req.usuario.id)
    if (check.erro) return res.status(check.status).json({ erro: check.erro })

    // Verifica conflito de horário no mesmo dia da semana
    const conflito = await prisma.horario.findFirst({
      where: {
        campoId: Number(campoId),
        diaSemana,
        OR: [
          // Novo horário começa dentro de um existente
          { horaInicio: { lte: horaInicio }, horaFim: { gt: horaInicio } },
          // Novo horário termina dentro de um existente
          { horaInicio: { lt: horaFim }, horaFim: { gte: horaFim } },
          // Novo horário engloba completamente um existente
          { horaInicio: { gte: horaInicio }, horaFim: { lte: horaFim } }
        ]
      }
    })

    if (conflito) {
      return res.status(409).json({
        erro: `Conflito de horário: já existe um slot de ${conflito.horaInicio} às ${conflito.horaFim} neste dia.`
      })
    }

    const novoHorario = await prisma.horario.create({
      data: {
        campoId: Number(campoId),
        diaSemana,
        horaInicio,
        horaFim,
        disponivel: disponivel !== undefined ? Boolean(disponivel) : true
      }
    })

    return res.status(201).json({
      mensagem: 'Horário criado com sucesso!',
      horario: novoHorario
    })
  } catch (error) {
    console.error('Erro ao criar horário:', error)
    return res.status(500).json({ erro: 'Erro ao criar horário.' })
  }
}

// ─── PUT /api/campos/:campoId/horarios/:id ───────────────────────────────────
// Atualiza um horário existente
async function atualizar(req, res) {
  const { campoId, id } = req.params
  const { diaSemana, horaInicio, horaFim, disponivel } = req.body

  try {
    // Verifica propriedade do campo
    const check = await verificarPropriedade(campoId, req.usuario.id)
    if (check.erro) return res.status(check.status).json({ erro: check.erro })

    // Verifica se o horário existe e pertence ao campo
    const horarioExistente = await prisma.horario.findFirst({
      where: { id: Number(id), campoId: Number(campoId) }
    })
    if (!horarioExistente) return res.status(404).json({ erro: 'Horário não encontrado.' })

    // Monta dados de atualização com os valores atuais como fallback
    const diaFinal = diaSemana || horarioExistente.diaSemana
    const inicioFinal = horaInicio || horarioExistente.horaInicio
    const fimFinal = horaFim || horarioExistente.horaFim

    if (diaSemana && !DIAS_VALIDOS.includes(diaSemana)) {
      return res.status(400).json({ erro: `Dia inválido. Use: ${DIAS_VALIDOS.join(', ')}.` })
    }

    if ((horaInicio && !validarHora(horaInicio)) || (horaFim && !validarHora(horaFim))) {
      return res.status(400).json({ erro: 'Horário deve estar no formato HH:MM.' })
    }

    if (inicioFinal >= fimFinal) {
      return res.status(400).json({ erro: 'A hora de início deve ser anterior à hora de fim.' })
    }

    // Verifica conflito (excluindo o próprio horário)
    const conflito = await prisma.horario.findFirst({
      where: {
        campoId: Number(campoId),
        diaSemana: diaFinal,
        id: { not: Number(id) },
        OR: [
          { horaInicio: { lte: inicioFinal }, horaFim: { gt: inicioFinal } },
          { horaInicio: { lt: fimFinal }, horaFim: { gte: fimFinal } },
          { horaInicio: { gte: inicioFinal }, horaFim: { lte: fimFinal } }
        ]
      }
    })

    if (conflito) {
      return res.status(409).json({
        erro: `Conflito de horário: já existe um slot de ${conflito.horaInicio} às ${conflito.horaFim} neste dia.`
      })
    }

    const horarioAtualizado = await prisma.horario.update({
      where: { id: Number(id) },
      data: {
        diaSemana: diaFinal,
        horaInicio: inicioFinal,
        horaFim: fimFinal,
        ...(disponivel !== undefined && { disponivel: Boolean(disponivel) })
      }
    })

    return res.status(200).json({
      mensagem: 'Horário atualizado com sucesso!',
      horario: horarioAtualizado
    })
  } catch (error) {
    console.error('Erro ao atualizar horário:', error)
    return res.status(500).json({ erro: 'Erro ao atualizar horário.' })
  }
}

// ─── DELETE /api/campos/:campoId/horarios/:id ────────────────────────────────
// Remove um horário (não pode remover se tiver agendamentos futuros pendentes)
async function deletar(req, res) {
  const { campoId, id } = req.params

  try {
    const check = await verificarPropriedade(campoId, req.usuario.id)
    if (check.erro) return res.status(check.status).json({ erro: check.erro })

    const horario = await prisma.horario.findFirst({
      where: { id: Number(id), campoId: Number(campoId) }
    })
    if (!horario) return res.status(404).json({ erro: 'Horário não encontrado.' })

    // Bloqueia exclusão se houver agendamentos futuros pendentes ou confirmados
    const agendamentosFuturos = await prisma.agendamento.findFirst({
      where: {
        horarioId: Number(id),
        data: { gte: new Date() },
        status: { in: ['PENDENTE', 'CONFIRMADO'] }
      }
    })

    if (agendamentosFuturos) {
      return res.status(409).json({
        erro: 'Não é possível excluir este horário pois há agendamentos futuros vinculados a ele.'
      })
    }

    await prisma.horario.delete({ where: { id: Number(id) } })

    return res.status(200).json({ mensagem: 'Horário excluído com sucesso.' })
  } catch (error) {
    console.error('Erro ao deletar horário:', error)
    if (error.code === 'P2025') {
      return res.status(404).json({ erro: 'Horário não encontrado.' })
    }
    return res.status(500).json({ erro: 'Erro ao excluir horário.' })
  }
}

// ─── PATCH /api/campos/:campoId/horarios/:id/disponibilidade ─────────────────
// Ativa ou desativa um horário sem excluí-lo
async function alterarDisponibilidade(req, res) {
  const { campoId, id } = req.params
  const { disponivel } = req.body

  if (typeof disponivel !== 'boolean') {
    return res.status(400).json({ erro: 'O campo "disponivel" deve ser true ou false.' })
  }

  try {
    const check = await verificarPropriedade(campoId, req.usuario.id)
    if (check.erro) return res.status(check.status).json({ erro: check.erro })

    const horario = await prisma.horario.findFirst({
      where: { id: Number(id), campoId: Number(campoId) }
    })
    if (!horario) return res.status(404).json({ erro: 'Horário não encontrado.' })

    const atualizado = await prisma.horario.update({
      where: { id: Number(id) },
      data: { disponivel }
    })

    return res.status(200).json({
      mensagem: `Horário ${disponivel ? 'ativado' : 'desativado'} com sucesso.`,
      horario: atualizado
    })
  } catch (error) {
    console.error('Erro ao alterar disponibilidade:', error)
    return res.status(500).json({ erro: 'Erro ao alterar disponibilidade.' })
  }
}

module.exports = { listar, buscarPorId, criar, atualizar, deletar, alterarDisponibilidade }
