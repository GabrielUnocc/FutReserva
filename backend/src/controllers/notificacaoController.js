// src/controllers/notificacaoController.js
// CRUD de notificações do usuário logado
// Responsável: Bernardo Dal Piva

const prisma = require('../prismaClient')

// GET /api/notificacoes — lista todas as notificações do usuário
async function listar(req, res) {
  const usuarioId = req.usuario.id

  try {
    const notificacoes = await prisma.notificacao.findMany({
      where: { usuarioId },
      orderBy: { createdAt: 'desc' }
    })

    return res.status(200).json(notificacoes)
  } catch (error) {
    console.error('Erro ao listar notificações:', error)
    return res.status(500).json({ erro: 'Erro ao buscar notificações.' })
  }
}

// GET /api/notificacoes/nao-lidas — retorna a contagem de não lidas (para o badge da navbar)
async function contarNaoLidas(req, res) {
  const usuarioId = req.usuario.id

  try {
    const total = await prisma.notificacao.count({
      where: { usuarioId, lida: false }
    })

    return res.status(200).json({ total })
  } catch (error) {
    console.error('Erro ao contar notificações:', error)
    return res.status(500).json({ erro: 'Erro ao contar notificações.' })
  }
}

// PATCH /api/notificacoes/:id/lida — marca uma notificação como lida
async function marcarLida(req, res) {
  const { id } = req.params
  const usuarioId = req.usuario.id

  try {
    const notificacao = await prisma.notificacao.findUnique({ where: { id: Number(id) } })

    if (!notificacao) return res.status(404).json({ erro: 'Notificação não encontrada.' })
    if (notificacao.usuarioId !== usuarioId) {
      return res.status(403).json({ erro: 'Sem permissão para acessar esta notificação.' })
    }

    const atualizada = await prisma.notificacao.update({
      where: { id: Number(id) },
      data: { lida: true }
    })

    return res.status(200).json({ mensagem: 'Notificação marcada como lida.', notificacao: atualizada })
  } catch (error) {
    console.error('Erro ao marcar notificação:', error)
    return res.status(500).json({ erro: 'Erro ao atualizar notificação.' })
  }
}

// PATCH /api/notificacoes/todas-lidas — marca todas as notificações do usuário como lidas
async function marcarTodasLidas(req, res) {
  const usuarioId = req.usuario.id

  try {
    await prisma.notificacao.updateMany({
      where: { usuarioId, lida: false },
      data: { lida: true }
    })

    return res.status(200).json({ mensagem: 'Todas as notificações foram marcadas como lidas.' })
  } catch (error) {
    console.error('Erro ao marcar todas como lidas:', error)
    return res.status(500).json({ erro: 'Erro ao atualizar notificações.' })
  }
}

// DELETE /api/notificacoes/:id — deleta uma notificação
async function deletar(req, res) {
  const { id } = req.params
  const usuarioId = req.usuario.id

  try {
    const notificacao = await prisma.notificacao.findUnique({ where: { id: Number(id) } })

    if (!notificacao) return res.status(404).json({ erro: 'Notificação não encontrada.' })
    if (notificacao.usuarioId !== usuarioId) {
      return res.status(403).json({ erro: 'Sem permissão para deletar esta notificação.' })
    }

    await prisma.notificacao.delete({ where: { id: Number(id) } })

    return res.status(200).json({ mensagem: 'Notificação removida.' })
  } catch (error) {
    console.error('Erro ao deletar notificação:', error)
    return res.status(500).json({ erro: 'Erro ao remover notificação.' })
  }
}

// DELETE /api/notificacoes/lidas — deleta todas as notificações já lidas do usuário
async function limparLidas(req, res) {
  const usuarioId = req.usuario.id

  try {
    const { count } = await prisma.notificacao.deleteMany({
      where: { usuarioId, lida: true }
    })

    return res.status(200).json({ mensagem: `${count} notificação(ões) removida(s).` })
  } catch (error) {
    console.error('Erro ao limpar notificações:', error)
    return res.status(500).json({ erro: 'Erro ao limpar notificações.' })
  }
}

module.exports = { listar, contarNaoLidas, marcarLida, marcarTodasLidas, deletar, limparLidas }
