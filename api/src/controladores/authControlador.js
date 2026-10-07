const banco = require('../config/conexaoBanco')
const { hashearSenha, verificarSenha, gerarToken } = require('../utilitarios/seguranca')
const validator = require('validator')

/**
 * Cadastro de Usuários (RSF-002)
 */
function cadastrar(req, res) {
  try {
    const { nome, email, senha, perfil = 'cidadao' } = req.body

    if (!nome || !nome.trim()) {
      return res.status(400).json({ ok: false, erro: 'O nome é obrigatório.' })
    }
    if (!email || !validator.isEmail(String(email).trim())) {
      return res.status(400).json({ ok: false, erro: 'Informe um e-mail válido.' })
    }
    if (!senha || String(senha).length < 6) {
      return res.status(400).json({ ok: false, erro: 'A senha deve conter no mínimo 6 caracteres.' })
    }

    const perfilSanitizado = ['cidadao', 'atendente', 'gestor'].includes(perfil) ? perfil : 'cidadao'
    const emailSanitizado = String(email).trim().toLowerCase()
    const nomeSanitizado = String(nome).trim()

    const usuarioExiste = banco
      .prepare('SELECT id FROM usuarios WHERE email = ? COLLATE NOCASE')
      .get(emailSanitizado)

    if (usuarioExiste) {
      return res.status(400).json({ ok: false, erro: 'Este e-mail já está cadastrado no sistema.' })
    }

    const hash = hashearSenha(senha)
    const resultado = banco
      .prepare('INSERT INTO usuarios (nome, email, senha, perfil) VALUES (?, ?, ?, ?)')
      .run(nomeSanitizado, emailSanitizado, hash, perfilSanitizado)

    const novoId = resultado.lastInsertRowid
    const token = gerarToken({ id: novoId, nome: nomeSanitizado, email: emailSanitizado, perfil: perfilSanitizado })

    return res.status(201).json({
      ok: true,
      mensagem: 'Cadastro realizado com sucesso!',
      token,
      usuario: {
        id: novoId,
        nome: nomeSanitizado,
        email: emailSanitizado,
        perfil: perfilSanitizado,
      },
    })
  } catch (erro) {
    console.error('Erro no cadastro:', erro.message)
    return res.status(500).json({ ok: false, erro: 'Erro interno ao processar o cadastro.' })
  }
}

/**
 * Login de Usuários (RSF-001)
 */
function login(req, res) {
  try {
    const { email, senha } = req.body

    if (!email || !senha) {
      return res.status(400).json({ ok: false, erro: 'Informe e-mail e senha.' })
    }

    const emailSanitizado = String(email).trim().toLowerCase()
    const usuario = banco
      .prepare('SELECT id, nome, email, senha, perfil, criado_em FROM usuarios WHERE email = ? COLLATE NOCASE')
      .get(emailSanitizado)

    if (!usuario) {
      return res.status(401).json({ ok: false, erro: 'E-mail ou senha incorretos.' })
    }

    const senhaCorreta = verificarSenha(senha, usuario.senha)
    if (!senhaCorreta) {
      return res.status(401).json({ ok: false, erro: 'E-mail ou senha incorretos.' })
    }

    const token = gerarToken({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      perfil: usuario.perfil,
    })

    return res.json({
      ok: true,
      mensagem: 'Login realizado com sucesso!',
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil,
        criado_em: usuario.criado_em,
      },
    })
  } catch (erro) {
    console.error('Erro no login:', erro.message)
    return res.status(500).json({ ok: false, erro: 'Erro interno ao realizar autenticação.' })
  }
}

/**
 * Obter dados do Usuário Logado
 */
function me(req, res) {
  try {
    if (!req.usuario || !req.usuario.id) {
      return res.status(401).json({ ok: false, erro: 'Usuário não autenticado.' })
    }

    const usuario = banco
      .prepare('SELECT id, nome, email, perfil, criado_em FROM usuarios WHERE id = ?')
      .get(req.usuario.id)

    if (!usuario) {
      return res.status(404).json({ ok: false, erro: 'Usuário não encontrado.' })
    }

    return res.json({ ok: true, usuario })
  } catch (erro) {
    console.error('Erro ao buscar perfil do usuário:', erro.message)
    return res.status(500).json({ ok: false, erro: 'Erro interno ao consultar perfil.' })
  }
}

module.exports = { cadastrar, login, me }
