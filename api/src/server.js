// dotenv carregado UMA única vez, antes de qualquer outro módulo
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') })

const path = require('path')
const app = require('./app')

const PORTA = process.env.PORT || 3000

// ── Validação fail-fast de segredos (A2) ──────────────────────────
// O servidor se recusa a iniciar sem chaves fortes configuradas
function validarSegredos() {
  const erros = []
  const CHAVE_MIN = 32

  if (!process.env.API_KEY_PUBLICA || process.env.API_KEY_PUBLICA.length < CHAVE_MIN) {
    erros.push('API_KEY_PUBLICA ausente ou com menos de 32 caracteres no .env')
  }
  if (!process.env.API_KEY_ADMIN || process.env.API_KEY_ADMIN.length < CHAVE_MIN) {
    erros.push('API_KEY_ADMIN ausente ou com menos de 32 caracteres no .env')
  }

  if (erros.length > 0) {
    console.error('═══════════════════════════════════════════════')
    console.error('FALHA DE SEGURANÇA — servidor não será iniciado:')
    erros.forEach(erro => console.error(` • ${erro}`))
    console.error('Gere chaves com: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"')
    console.error('═══════════════════════════════════════════════')
    process.exit(1)
  }
}
validarSegredos()

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
