// Middleware de rate limiting por IP (implementação própria, sem dependências)
// Limita o número de requisições por janela de tempo
// Obs: dotenv já é carregado em server.js antes deste módulo

const JANELA_MS = parseInt(process.env.RATE_LIMIT_JANELA_MS) || 900000
const MAX_REQUISICOES = parseInt(process.env.RATE_LIMIT_MAX_REQUISICOES) || 100

const registroRequisicoes = new Map()

// Limpa registros antigos periodicamente para evitar vazamento de memória
setInterval(() => {
  const agora = Date.now()
  for (const [ip, dados] of registroRequisicoes.entries()) {
    if (agora - dados.inicio > JANELA_MS) {
      registroRequisicoes.delete(ip)
    }
  }
}, JANELA_MS)

function limitarRequisicoes(req, res, next) {
  const ip = req.ip || req.socket.remoteAddress
  const agora = Date.now()

  let dados = registroRequisicoes.get(ip)

  if (!dados || agora - dados.inicio > JANELA_MS) {
    dados = { inicio: agora, contador: 0 }
    registroRequisicoes.set(ip, dados)
  }

  dados.contador += 1

  // Headers informativos padrão de rate limit
  res.setHeader('X-RateLimit-Limit', MAX_REQUISICOES)
  res.setHeader('X-RateLimit-Remaining', Math.max(0, MAX_REQUISICOES - dados.contador))
  res.setHeader('X-RateLimit-Reset', new Date(dados.inicio + JANELA_MS).toISOString())

  if (dados.contador > MAX_REQUISICOES) {
    return res.status(429).json({
      sucesso: false,
      mensagem: 'Muitas requisições. Tente novamente mais tarde.'
    })
  }

  next()
}

module.exports = { limitarRequisicoes }
