const { Router } = require('express')
const { listarMedicamentos, obterMedicamentoPorId } = require('../controladores/medicamentoControlador')

const rotas = Router()

rotas.get('/medicamentos', listarMedicamentos)
rotas.get('/medicamentos/:id', obterMedicamentoPorId)

module.exports = rotas
