// Middleware de autenticação por API Key
// Valida o header "x-api-key" contra as chaves autorizadas no .env

const crypto = require('crypto')

const CHAVE_PUBLICA = process.env.API_KEY_PUBLICA
const CHAVE_ADMIN = process.env.API_KEY_ADMIN

// Registro de falhas de autenticação por IP (anti-brute-force)
const falhasPorIp = new Map()
const JANELA_FALHAS_MS = 15 * 60 * 1000 // 15 minutos
const MAX_FALHAS = 10

setInterval(() => {
  const agora = Date.now()
  for (const [ip, dados] of falhasPorIp.entries()) {
    if (agora - dados.inicio > JANELA_FALHAS_MS) falhasPorIp.delete(ip)
  }
}, JANELA_FALHAS_MS)

function registrarFalha(req) {
  const ip = req.ip || req.socket.remoteAddress
  const agora = Date.now()
  let dados = falhasPorIp.get(ip)
  if (!dados || agora - dados.inicio > JANELA_FALHAS_MS) {
    dados = { inicio: agora, contador: 0 }
    falhasPorIp.set(ip, dados)
  }
  dados.contador += 1
  return dados.contador
}

function ipBloqueado(req) {
  const ip = req.ip || req.socket.remoteAddress
  const dados = falhasPorIp.get(ip)
  if (!dados) return false
  if (Date.now() - dados.inicio > JANELA_FALHAS_MS) {
    falhasPorIp.delete(ip)
    return false
  }
  return dados.contador >= MAX_FALHAS
}

// Comparação em tempo CONSTANTE uniforme:
// hasheia ambas as entradas com SHA-256 antes de comparar,
// eliminando o vazamento de tempo por tamanho diferente (timing attack)
function comparacaoSegura(recebida, esperada) {
  if (typeof recebida !== 'string' || typeof esperada !== 'string') return false
  const hashRecebido = crypto.createHash('sha256').update(recebida).digest()
  const hashEsperado = crypto.createHash('sha256').update(esperada).digest()
  return crypto.timingSafeEqual(hashRecebido, hashEsperado)
}

// Autenticação pública: chave pública OU origem confiável (endpoints de escrita)
function autenticarPublico(req, res, next) {
  if (ipBloqueado(req)) {
    return res.status(429).json({
      sucesso: false,
      mensagem: 'Muitas tentativas de autenticação falharam. Tente mais tarde.'
    })
  }

  const origem = req.headers.origin
  const origensConfiveis = (process.env.ORIGENS_CONFIAVEIS || '')
    .split(',')
    .map(o => o.trim())
    .filter(Boolean)

  const origemValida = origem && origensConfiveis.includes(origem)
  const chaveValida = comparacaoSegura(req.headers['x-api-key'] || '', CHAVE_PUBLICA)

  if (!origemValida && !chaveValida) {
    registrarFalha(req)
    const temHeader = Boolean(req.headers['x-api-key'])
    return res.status(temHeader ? 403 : 401).json({
      sucesso: false,
      mensagem: temHeader
        ? 'API key inválida.'
        : 'Acesso negado. Informe o header x-api-key ou utilize uma origem confiável.'
    })
  }

  next()
}

// Autenticação admin: exige a chave administrativa (endpoints de leitura)
function autenticarAdmin(req, res, next) {
  if (ipBloqueado(req)) {
    return res.status(429).json({
      sucesso: false,
      mensagem: 'Muitas tentativas de autenticação falharam. Tente mais tarde.'
    })
  }

  const chaveRecebida = req.headers['x-api-key']

  if (!chaveRecebida) {
    registrarFalha(req)
    return res.status(401).json({
      sucesso: false,
      mensagem: 'Acesso negado. Header x-api-key é obrigatório.'
    })
  }

  if (!comparacaoSegura(chaveRecebida, CHAVE_ADMIN)) {
    registrarFalha(req)
    return res.status(403).json({
      sucesso: false,
      mensagem: 'API key administrativa inválida.'
    })
  }

  next()
}

module.exports = { autenticarPublico, autenticarAdmin, comparacaoSegura }
