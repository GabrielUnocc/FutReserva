// src/controllers/campoController.js
// CRUD de Campos de Futebol (RF05)
// Responsável: João Decarli
//
// Observação: apenas buscarPorId está implementado aqui para suportar
// a tela de gerenciamento de horários. O CRUD completo será implementado
// pelo responsável (João Decarli) neste mesmo arquivo.

const prisma = require('../prismaClient')

// GET /api/campos — Lista todos os campos disponíveis
async function listar(req, res) {
  try {
    const campos = await prisma.campo.findMany({
      include: {
        dono: { select: { id: true, nome: true, email: true } },
        _count: { select: { horarios: true } }
      },
      orderBy: { createdAt: 'desc' }
    })
    return res.status(200).json(campos)
  } catch (error) {
    console.error('Erro ao listar campos:', error)
    return res.status(500).json({ erro: 'Erro ao buscar campos.' })
  }
}

// GET /api/campos/:id — Busca um campo por ID
async function buscarPorId(req, res) {
  const { id } = req.params

  try {
    const campo = await prisma.campo.findUnique({
      where: { id: Number(id) },
      include: {
        dono: { select: { id: true, nome: true, email: true } },
        _count: { select: { horarios: true } }
      }
    })

    if (!campo) return res.status(404).json({ erro: 'Campo não encontrado.' })

    return res.status(200).json(campo)
  } catch (error) {
    console.error('Erro ao buscar campo:', error)
    return res.status(500).json({ erro: 'Erro ao buscar campo.' })
  }
}

// GET /api/campos/meus — Lista apenas os campos do dono logado
async function meusCampos(req, res) {
  try {
    const campos = await prisma.campo.findMany({
      where: { donoId: req.usuario.id },
      include: { _count: { select: { horarios: true } } },
      orderBy: { createdAt: 'desc' }
    })
    return res.status(200).json(campos)
  } catch (error) {
    console.error('Erro ao listar meus campos:', error)
    return res.status(500).json({ erro: 'Erro ao buscar seus campos.' })
  }
}

// POST /api/campos — Cria um novo campo
async function criar(req, res) {
  const { nome, endereco, descricao, preco } = req.body

  if (!nome || !endereco || !preco) {
    return res.status(400).json({ erro: 'Nome, endereço e preço são obrigatórios.' })
  }

  try {
    const campo = await prisma.campo.create({
      data: {
        nome,
        endereco,
        descricao: descricao || null,
        preco: Number(preco),
        donoId: req.usuario.id
      }
    })
    return res.status(201).json({ mensagem: 'Campo criado com sucesso!', campo })
  } catch (error) {
    console.error('Erro ao criar campo:', error)
    return res.status(500).json({ erro: 'Erro ao criar campo.' })
  }
}

// PUT /api/campos/:id — Atualiza dados de um campo
async function atualizar(req, res) {
  const { id } = req.params
  const { nome, endereco, descricao, preco } = req.body

  try {
    const campo = await prisma.campo.findUnique({ where: { id: Number(id) } })
    if (!campo) return res.status(404).json({ erro: 'Campo não encontrado.' })
    if (campo.donoId !== req.usuario.id && req.usuario.perfil !== 'ADMIN') {
      return res.status(403).json({ erro: 'Você não tem permissão para editar este campo.' })
    }

    const atualizado = await prisma.campo.update({
      where: { id: Number(id) },
      data: {
        ...(nome && { nome }),
        ...(endereco && { endereco }),
        ...(descricao !== undefined && { descricao }),
        ...(preco && { preco: Number(preco) })
      }
    })

    return res.status(200).json({ mensagem: 'Campo atualizado com sucesso!', campo: atualizado })
  } catch (error) {
    console.error('Erro ao atualizar campo:', error)
    return res.status(500).json({ erro: 'Erro ao atualizar campo.' })
  }
}

// DELETE /api/campos/:id — Remove um campo
async function deletar(req, res) {
  const { id } = req.params

  try {
    const campo = await prisma.campo.findUnique({ where: { id: Number(id) } })
    if (!campo) return res.status(404).json({ erro: 'Campo não encontrado.' })
    if (campo.donoId !== req.usuario.id && req.usuario.perfil !== 'ADMIN') {
      return res.status(403).json({ erro: 'Você não tem permissão para excluir este campo.' })
    }

    await prisma.campo.delete({ where: { id: Number(id) } })
    return res.status(200).json({ mensagem: 'Campo removido com sucesso.' })
  } catch (error) {
    console.error('Erro ao deletar campo:', error)
    if (error.code === 'P2025') return res.status(404).json({ erro: 'Campo não encontrado.' })
    return res.status(500).json({ erro: 'Erro ao remover campo.' })
  }
}

module.exports = { listar, buscarPorId, meusCampos, criar, atualizar, deletar }
