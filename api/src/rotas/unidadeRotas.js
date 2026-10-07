const { Router } = require('express')
const { listarUnidades, obterUnidadePorId, cadastrarUnidade } = require('../controladores/unidadeControlador')

const rotas = Router()

// Rotas de unidades de saúde
rotas.get('/unidades', listarUnidades)
rotas.get('/hospitais', listarUnidades) // Alias compatível
rotas.get('/unidades/:id', obterUnidadePorId)
rotas.get('/hospitais/:id', obterUnidadePorId) // Alias compatível
rotas.post('/unidades', cadastrarUnidade)

module.exports = rotas
