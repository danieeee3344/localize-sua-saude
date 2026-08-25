const app = require('./app')
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })

const PORTA = process.env.PORT || 3000

// Handlers globais de erro — evitam crash silencioso do processo
process.on('uncaughtException', (erro) => {
  console.error('Exceção não capturada:', erro.message)
})

process.on('unhandledRejection', (motivo) => {
  console.error('Promise rejeitada não tratada:', motivo)
})

// Inicializa a tabela no banco antes de subir o servidor
require('../iniciarBanco')

const servidor = app.listen(PORTA, () => console.log(`Servidor rodando na porta ${PORTA}`))

// Encerramento limpo (SIGTERM/SIGINT)
function encerrarSinal(sinal) {
  console.log(`\n${sinal} recebido. Encerrando servidor...`)
  servidor.close(() => {
    const { fecharBanco } = require('./config/conexaoBanco')
    if (fecharBanco) fecharBanco()
    console.log('Servidor encerrado com segurança.')
    process.exit(0)
  })
}

process.on('SIGTERM', () => encerrarSinal('SIGTERM'))
process.on('SIGINT', () => encerrarSinal('SIGINT'))
