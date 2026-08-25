const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const path = require('path')

const rotasLeads = require('./rotas/leadRotas')
const { limitarRequisicoes } = require('./utilitarios/rateLimit')

const app = express()

// Middlewares de segurança e parsing
app.use(helmet({
  contentSecurityPolicy: false
}))
app.use(cors({ origin: process.env.ORIGEM_PERMITIDA || '*' }))
app.use(express.json({ limit: '10kb' }))

// Rate limiting global para toda a API
app.use('/api', limitarRequisicoes)

// Servir arquivos estáticos APENAS do build de produção (A3)
// Nunca cair na pasta raiz do frontend — isso exporia o código-fonte
const fs = require('fs')
const caminhoDist = path.resolve(__dirname, '../../frontend/dist')
const distExiste = fs.existsSync(caminhoDist)

if (distExiste) {
  app.use(express.static(caminhoDist, { dotfiles: 'ignore' }))
} else {
  console.warn('AVISO: frontend/dist não encontrado. Frontend não será servido (execute npm run build).')
}

// Rotas da API (autenticação por chave dentro das rotas)
app.use('/api', rotasLeads)

// Rota de health check (pública, sem autenticação)
app.get('/api/health', (_, res) => res.json({ sucesso: true, mensagem: 'API funcionando!' }))

// Handler 404 para rotas de API desconhecidas
app.use('/api', (req, res) => {
  res.status(404).json({ sucesso: false, mensagem: 'Rota de API não encontrada.' })
})

// Middleware global de tratamento de erros
app.use((erro, req, res, next) => {
  console.error('Erro não tratado:', erro.message)
  res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor.' })
})

// Fallback para a Landing Page (index.html)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next()
  if (!distExiste) {
    return res.status(503).send('Frontend não compilado. Execute: cd frontend && npm run build')
  }
  res.sendFile(path.join(caminhoDist, 'index.html'), (erro) => {
    if (erro) next(erro)
  })
})

module.exports = app
