const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })

const rotasLeads = require('./rotas/leadRotas')

const app = express()

// Middlewares de segurança e parsing
app.use(helmet({
  contentSecurityPolicy: false
}))
app.use(cors({ origin: process.env.ORIGEM_PERMITIDA || '*' }))
app.use(express.json({ limit: '10kb' }))

// Servir arquivos estáticos do frontend (React build em dist ou fallback)
const fs = require('fs')
const caminhoDist = path.resolve(__dirname, '../../frontend/dist')
const caminhoFrontend = path.resolve(__dirname, '../../frontend')
const pastaEstatica = fs.existsSync(caminhoDist) ? caminhoDist : caminhoFrontend

app.use(express.static(pastaEstatica))

// Rotas da API
app.use('/api', rotasLeads)

// Rota de health check
app.get('/api/health', (_, res) => res.json({ sucesso: true, mensagem: 'API funcionando!' }))

// Fallback para a Landing Page (index.html)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next()
  res.sendFile(path.join(pastaEstatica, 'index.html'))
})

module.exports = app
