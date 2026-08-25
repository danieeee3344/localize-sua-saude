const { Router } = require('express')
const { cadastrarLead, listarLeads } = require('../controladores/leadControlador')
const { autenticarPublico, autenticarAdmin } = require('../utilitarios/autenticacao')

const rotas = Router()

// POST /leads — escrita: exige chave pública + rate limit aplicado no app
rotas.post('/leads', autenticarPublico, cadastrarLead)

// GET /leads — leitura de dados sensíveis: exige chave administrativa
rotas.get('/leads', autenticarAdmin, listarLeads)

module.exports = rotas
