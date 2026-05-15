// src/controllers/authController.js
// Responsável pelo cadastro e login de usuários

const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const prisma = require('../prismaClient')

// POST /api/auth/cadastro
async function cadastro(req, res) {
  const { nome, email, senha, perfil } = req.body

  // Validação dos campos obrigatórios
  if (!nome || !email || !senha) {
    return res.status(400).json({ erro: 'Nome, email e senha são obrigatórios.' })
  }

  // Validação do perfil informado
  const perfisValidos = ['JOGADOR', 'DONO']
  const perfilFinal = perfil && perfisValidos.includes(perfil) ? perfil : 'JOGADOR'

  try {
    // Verifica se já existe um usuário com esse email
    const usuarioExistente = await prisma.usuario.findUnique({ where: { email } })
    if (usuarioExistente) {
      return res.status(409).json({ erro: 'Este email já está cadastrado.' })
    }

    // Criptografa a senha antes de salvar
    const senhaCriptografada = await bcrypt.hash(senha, 10)

    // Cria o usuário no banco
    const novoUsuario = await prisma.usuario.create({
      data: {
        nome,
        email,
        senha: senhaCriptografada,
        perfil: perfilFinal
      },
      select: {
        id: true,
        nome: true,
        email: true,
        perfil: true,
        createdAt: true
      }
    })

    return res.status(201).json({
      mensagem: 'Usuário cadastrado com sucesso!',
      usuario: novoUsuario
    })
  } catch (error) {
    console.error('Erro no cadastro:', error)
    return res.status(500).json({ erro: 'Erro interno ao cadastrar usuário.' })
  }
}

// POST /api/auth/login
async function login(req, res) {
  const { email, senha } = req.body

  if (!email || !senha) {
    return res.status(400).json({ erro: 'Email e senha são obrigatórios.' })
  }

  try {
    // Busca o usuário pelo email
    const usuario = await prisma.usuario.findUnique({ where: { email } })

    if (!usuario) {
      return res.status(401).json({ erro: 'Email ou senha incorretos.' })
    }

    // Compara a senha informada com a senha criptografada no banco
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha)

    if (!senhaCorreta) {
      return res.status(401).json({ erro: 'Email ou senha incorretos.' })
    }

    // Gera o token JWT com os dados do usuário (expira em 8 horas)
    const token = jwt.sign(
      { id: usuario.id, nome: usuario.nome, email: usuario.email, perfil: usuario.perfil },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    )

    return res.status(200).json({
      mensagem: 'Login realizado com sucesso!',
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil
      }
    })
  } catch (error) {
    console.error('Erro no login:', error)
    return res.status(500).json({ erro: 'Erro interno ao realizar login.' })
  }
}

module.exports = { cadastro, login }
