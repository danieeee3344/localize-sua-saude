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

// Servir arquivos estáticos do frontend (React build em dist ou fallback)
const fs = require('fs')
const caminhoDist = path.resolve(__dirname, '../../frontend/dist')
const caminhoFrontend = path.resolve(__dirname, '../../frontend')
const pastaEstatica = fs.existsSync(caminhoDist) ? caminhoDist : caminhoFrontend

// Bloqueia acesso direto a arquivos sensíveis
app.use(express.static(pastaEstatica, {
  dotfiles: 'ignore'
}))

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
  res.sendFile(path.join(pastaEstatica, 'index.html'), (erro) => {
    if (erro) next(erro)
  })
})

module.exports = app
