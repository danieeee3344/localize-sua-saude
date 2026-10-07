const { Router } = require('express')
const { cadastrar, login, me } = require('../controladores/authControlador')
const { autenticarUsuario } = require('../utilitarios/seguranca')

const rotas = Router()

// Rotas públicas de autenticação
rotas.post('/auth/cadastro', cadastrar)
rotas.post('/auth/login', login)

// Rota protegida para consultar o usuário atual
rotas.get('/auth/me', autenticarUsuario, me)

module.exports = rotas
