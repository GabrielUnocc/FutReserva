// src/controllers/userController.js
// CRUD completo de usuários (RF04)
// Responsável: Gabriel Rosario

const bcrypt = require('bcryptjs')
const prisma = require('../prismaClient')

// GET /api/usuarios — Lista todos os usuários (somente ADMIN)
async function listar(req, res) {
  try {
    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        perfil: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return res.status(200).json(usuarios)
  } catch (error) {
    console.error('Erro ao listar usuários:', error)
    return res.status(500).json({ erro: 'Erro ao buscar usuários.' })
  }
}

// GET /api/usuarios/:id — Busca um usuário por ID
async function buscarPorId(req, res) {
  const { id } = req.params

  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: Number(id) },
      select: {
        id: true,
        nome: true,
        email: true,
        perfil: true,
        createdAt: true
      }
    })

    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' })
    }

    return res.status(200).json(usuario)
  } catch (error) {
    console.error('Erro ao buscar usuário:', error)
    return res.status(500).json({ erro: 'Erro ao buscar usuário.' })
  }
}

// PUT /api/usuarios/:id — Atualiza os dados de um usuário
async function atualizar(req, res) {
  const { id } = req.params
  const { nome, email, senha } = req.body

  // Apenas o próprio usuário ou um ADMIN pode editar
  if (req.usuario.id !== Number(id) && req.usuario.perfil !== 'ADMIN') {
    return res.status(403).json({ erro: 'Você só pode editar seu próprio perfil.' })
  }

  try {
    const dados = {}
    if (nome) dados.nome = nome
    if (email) dados.email = email
    if (senha) dados.senha = await bcrypt.hash(senha, 10)

    const usuarioAtualizado = await prisma.usuario.update({
      where: { id: Number(id) },
      data: dados,
      select: {
        id: true,
        nome: true,
        email: true,
        perfil: true
      }
    })

    return res.status(200).json({
      mensagem: 'Usuário atualizado com sucesso!',
      usuario: usuarioAtualizado
    })
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error)
    if (error.code === 'P2002') {
      return res.status(409).json({ erro: 'Este email já está em uso.' })
    }
    return res.status(500).json({ erro: 'Erro ao atualizar usuário.' })
  }
}

// DELETE /api/usuarios/:id — Remove um usuário (somente ADMIN)
async function deletar(req, res) {
  const { id } = req.params

  try {
    await prisma.usuario.delete({ where: { id: Number(id) } })

    return res.status(200).json({ mensagem: 'Usuário removido com sucesso.' })
  } catch (error) {
    console.error('Erro ao deletar usuário:', error)
    if (error.code === 'P2025') {
      return res.status(404).json({ erro: 'Usuário não encontrado.' })
    }
    return res.status(500).json({ erro: 'Erro ao remover usuário.' })
  }
}

module.exports = { listar, buscarPorId, atualizar, deletar }
