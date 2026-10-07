const { Router } = require('express')
const {
  listarAgendamentos,
  criarAgendamento,
  cancelarAgendamento,
} = require('../controladores/agendamentoControlador')
const { autenticarUsuario } = require('../utilitarios/seguranca')

const rotas = Router()

// Endpoints de agendamentos — exigem autenticacao JWT via header Authorization: Bearer <token>
rotas.get('/agendamentos', autenticarUsuario, listarAgendamentos)
rotas.post('/agendamentos', autenticarUsuario, criarAgendamento)
rotas.delete('/agendamentos/:id', autenticarUsuario, cancelarAgendamento)

module.exports = rotas
