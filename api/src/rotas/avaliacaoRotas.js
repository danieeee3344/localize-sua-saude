const { Router } = require('express')
const {
  listarAvaliacoes,
  criarAvaliacao,
  moderarAvaliacao,
} = require('../controladores/avaliacaoControlador')
const { autenticarUsuario, autenticarGestor } = require('../utilitarios/seguranca')

const rotas = Router()

rotas.get('/avaliacoes', listarAvaliacoes)
rotas.post('/avaliacoes', autenticarUsuario, criarAvaliacao)
rotas.put('/avaliacoes/:id/moderar', autenticarGestor, moderarAvaliacao)

module.exports = rotas
