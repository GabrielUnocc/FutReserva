// src/controllers/campoController.js
// CRUD de campos de futebol (RF05)

const prisma = require('../prismaClient')

// GET /api/campos — Lista todos os campos (público)
async function listar(req, res) {
  try {
    const campos = await prisma.campo.findMany({
      include: {
        dono: { select: { id: true, nome: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    return res.status(200).json(campos)
  } catch (error) {
    console.error('Erro ao listar campos:', error)
    return res.status(500).json({ erro: 'Erro ao buscar campos.' })
  }
}

// GET /api/campos/:id — Busca um campo por ID (público)
async function buscarPorId(req, res) {
  const { id } = req.params

  try {
    const campo = await prisma.campo.findUnique({
      where: { id: Number(id) },
      include: {
        dono: { select: { id: true, nome: true } }
      }
    })

    if (!campo) {
      return res.status(404).json({ erro: 'Campo não encontrado.' })
    }

    return res.status(200).json(campo)
  } catch (error) {
    console.error('Erro ao buscar campo:', error)
    return res.status(500).json({ erro: 'Erro ao buscar campo.' })
  }
}

// POST /api/campos — Cria um novo campo (somente DONO)
async function criar(req, res) {
  const { nome, endereco, descricao, preco, horaAbertura, horaFechamento } = req.body

  if (!nome || !endereco || !preco || !horaAbertura || !horaFechamento) {
    return res.status(400).json({ erro: 'Nome, endereço, preço e horário de funcionamento são obrigatórios.' })
  }

  if (Number(preco) <= 0) {
    return res.status(400).json({ erro: 'O preço deve ser maior que zero.' })
  }

  if (horaFechamento <= horaAbertura) {
    return res.status(400).json({ erro: 'O horário de fechamento deve ser depois do horário de abertura.' })
  }

  try {
    const novoCampo = await prisma.campo.create({
      data: {
        nome,
        endereco,
        descricao: descricao || null,
        preco: Number(preco),
        horaAbertura,
        horaFechamento,
        donoId: req.usuario.id
      }
    })

    return res.status(201).json({
      mensagem: 'Campo cadastrado com sucesso!',
      campo: novoCampo
    })
  } catch (error) {
    console.error('Erro ao criar campo:', error)
    return res.status(500).json({ erro: 'Erro ao cadastrar campo.' })
  }
}

// PUT /api/campos/:id — Atualiza um campo (somente o DONO do campo)
async function atualizar(req, res) {
  const { id } = req.params
  const { nome, endereco, descricao, preco, horaAbertura, horaFechamento } = req.body

  try {
    const campo = await prisma.campo.findUnique({ where: { id: Number(id) } })

    if (!campo) {
      return res.status(404).json({ erro: 'Campo não encontrado.' })
    }

    if (campo.donoId !== req.usuario.id) {
      return res.status(403).json({ erro: 'Você só pode editar seus próprios campos.' })
    }

    if (preco !== undefined && Number(preco) <= 0) {
      return res.status(400).json({ erro: 'O preço deve ser maior que zero.' })
    }

    const novaAbertura = horaAbertura || campo.horaAbertura
    const novoFechamento = horaFechamento || campo.horaFechamento
    if (novoFechamento <= novaAbertura) {
      return res.status(400).json({ erro: 'O horário de fechamento deve ser depois do horário de abertura.' })
    }

    const dados = {}
    if (nome) dados.nome = nome
    if (endereco) dados.endereco = endereco
    if (descricao !== undefined) dados.descricao = descricao
    if (preco !== undefined) dados.preco = Number(preco)
    if (horaAbertura) dados.horaAbertura = horaAbertura
    if (horaFechamento) dados.horaFechamento = horaFechamento

    const campoAtualizado = await prisma.campo.update({
      where: { id: Number(id) },
      data: dados
    })

    return res.status(200).json({
      mensagem: 'Campo atualizado com sucesso!',
      campo: campoAtualizado
    })
  } catch (error) {
    console.error('Erro ao atualizar campo:', error)
    if (error.code === 'P2025') {
      return res.status(404).json({ erro: 'Campo não encontrado.' })
    }
    return res.status(500).json({ erro: 'Erro ao atualizar campo.' })
  }
}

// DELETE /api/campos/:id — Remove um campo (somente o DONO do campo)
async function deletar(req, res) {
  const { id } = req.params

  try {
    const campo = await prisma.campo.findUnique({
      where: { id: Number(id) },
      include: { agendamentos: true }
    })

    if (!campo) {
      return res.status(404).json({ erro: 'Campo não encontrado.' })
    }

    if (campo.donoId !== req.usuario.id) {
      return res.status(403).json({ erro: 'Você só pode remover seus próprios campos.' })
    }

    if (campo.agendamentos.length > 0) {
      return res.status(409).json({ erro: 'Não é possível excluir um campo com agendamentos vinculados.' })
    }

    await prisma.campo.delete({ where: { id: Number(id) } })

    return res.status(200).json({ mensagem: 'Campo removido com sucesso.' })
  } catch (error) {
    console.error('Erro ao deletar campo:', error)
    if (error.code === 'P2025') {
      return res.status(404).json({ erro: 'Campo não encontrado.' })
    }
    if (error.code === 'P2003') {
      return res.status(409).json({ erro: 'Não é possível excluir um campo com dados vinculados.' })
    }
    return res.status(500).json({ erro: 'Erro ao remover campo.' })
  }
}

module.exports = { listar, buscarPorId, criar, atualizar, deletar }
