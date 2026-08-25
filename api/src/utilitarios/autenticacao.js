require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') })

// Middleware de autenticação por API Key
// Valida o header "x-api-key" contra as chaves autorizadas no .env

const CHAVE_PUBLICA = process.env.API_KEY_PUBLICA
const CHAVE_ADMIN = process.env.API_KEY_ADMIN

// Comparação em tempo constante para prevenir timing attacks
function comparacaoSegura(a, b) {
  if (!a || !b || a.length !== b.length) return false
  let resultado = 0
  for (let i = 0; i < a.length; i++) {
    resultado |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return resultado === 0
}

// Autenticação pública: permite apenas a chave pública (endpoints de escrita)
function autenticarPublico(req, res, next) {
  const chaveRecebida = req.headers['x-api-key']

  if (!chaveRecebida) {
    return res.status(401).json({
      sucesso: false,
      mensagem: 'Acesso negado. Header x-api-key é obrigatório.'
    })
  }

  if (!comparacaoSegura(chaveRecebida, CHAVE_PUBLICA)) {
    return res.status(403).json({
      sucesso: false,
      mensagem: 'API key inválida.'
    })
  }

  next()
}

// Autenticação admin: exige a chave administrativa (endpoints de leitura)
function autenticarAdmin(req, res, next) {
  const chaveRecebida = req.headers['x-api-key']

  if (!chaveRecebida) {
    return res.status(401).json({
      sucesso: false,
      mensagem: 'Acesso negado. Header x-api-key é obrigatório.'
    })
  }

  if (!comparacaoSegura(chaveRecebida, CHAVE_ADMIN)) {
    return res.status(403).json({
      sucesso: false,
      mensagem: 'API key administrativa inválida.'
    })
  }

  next()
}

module.exports = { autenticarPublico, autenticarAdmin, comparacaoSegura }
