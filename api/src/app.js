const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const path = require('path')
const fs = require('fs')

const rotasAuth = require('./rotas/authRotas')
const rotasUnidades = require('./rotas/unidadeRotas')
const rotasMedicamentos = require('./rotas/medicamentoRotas')
const rotasAgendamentos = require('./rotas/agendamentoRotas')
const rotasAvaliacoes = require('./rotas/avaliacaoRotas')
const rotasLeads = require('./rotas/leadRotas')
const { limitarRequisicoes } = require('./utilitarios/rateLimit')

const app = express()

// Middlewares de segurança e parsing
app.use(helmet({
  contentSecurityPolicy: false
}))

// Configuração de CORS para permitir requisições do frontend
const origensPermitidas = (process.env.ORIGENS_CONFIAVEIS || process.env.ORIGEM_PERMITIDA || 'http://localhost:5173,http://localhost:3000')
  .split(',')
  .map(o => o.trim())

app.use(cors({
  origin: (origin, callback) => {
    // Permite requests sem origin (ex: ferramentas locais, mobile nativo)
    if (!origin) return callback(null, true)
    // Em produção, rejeita origens não autorizadas
    if (origensPermitidas.includes(origin)) return callback(null, true)
    return callback(new Error('Origem não autorizada pela política de CORS.'))
  },
  credentials: true
}))

app.use(express.json({ limit: '50kb' }))

// Rate limiting global para a API
app.use('/api', limitarRequisicoes)

// Servir arquivos estáticos APENAS do build de produção
const caminhoDist = path.resolve(__dirname, '../../frontend/dist')
const distExiste = fs.existsSync(caminhoDist)

if (distExiste) {
  app.use(express.static(caminhoDist, { dotfiles: 'ignore' }))
}

// ── Rotas da API RESTful ──────────────────────────────────────────
app.use('/api', rotasAuth)
app.use('/api', rotasUnidades)
app.use('/api', rotasMedicamentos)
app.use('/api', rotasAgendamentos)
app.use('/api', rotasAvaliacoes)
app.use('/api', rotasLeads)

// Rota de Health Check
app.get('/api/health', (_, res) => res.json({ ok: true, sucesso: true, mensagem: 'API Localize Sua Saúde operacional!' }))

// Handler 404 para rotas de API desconhecidas
app.use('/api', (req, res) => {
  res.status(404).json({ ok: false, sucesso: false, mensagem: 'Endpoint da API não encontrado.' })
})

// Middleware global de tratamento de erros
app.use((erro, req, res, next) => {
  console.error('Erro global não tratado:', erro.message)
  res.status(500).json({ ok: false, sucesso: false, mensagem: 'Erro interno do servidor.' })
})

// Fallback para Single Page Application (index.html)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next()
  if (!distExiste) {
    return res.status(200).send(`
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head><meta charset="utf-8"><title>Localize Sua Saude — API</title></head>
        <body style="font-family: sans-serif; padding: 40px; text-align: center;">
          <h1>API Localize Sua Saude ativa!</h1>
          <p>Para visualizar a interface do usuario, execute o frontend via <code>npm run dev:frontend</code> ou compile com <code>npm run build</code>.</p>
          <p><a href="/api/health">Status da API (/api/health)</a> | <a href="/api/unidades">Ver Unidades de Saude (/api/unidades)</a></p>
        </body>
      </html>
    `)
  }
  res.sendFile(path.join(caminhoDist, 'index.html'), (erro) => {
    if (erro) next(erro)
  })
})

module.exports = app
