const crypto = require('crypto')

// JWT_SECRET DEVE estar definido no .env — sem fallback por segurança
const JWT_SECRET = process.env.JWT_SECRET

/**
 * Gera hash SHA-256 com salt para senhas
 */
function hashearSenha(senha) {
  if (!senha || typeof senha !== 'string') return ''
  return crypto.createHash('sha256').update(senha).digest('hex')
}

/**
 * Valida a senha comparando o hash
 */
function verificarSenha(senhaDigitada, hashArmazenado) {
  const hashDigitada = hashearSenha(senhaDigitada)
  if (hashDigitada.length !== hashArmazenado.length) return false
  return crypto.timingSafeEqual(Buffer.from(hashDigitada), Buffer.from(hashArmazenado))
}

/**
 * Cria um token JWT assinado com HMAC-SHA256
 */
function gerarToken(payload, duracaoHoras = 72) {
  const header = { alg: 'HS256', typ: 'JWT' }
  const expiraEm = Math.floor(Date.now() / 1000) + (duracaoHoras * 3600)
  const fullPayload = { ...payload, exp: expiraEm, iat: Math.floor(Date.now() / 1000) }

  const base64Header = Buffer.from(JSON.stringify(header)).toString('base64url')
  const base64Payload = Buffer.from(JSON.stringify(fullPayload)).toString('base64url')

  const assinatura = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${base64Header}.${base64Payload}`)
    .digest('base64url')

  return `${base64Header}.${base64Payload}.${assinatura}`
}

/**
 * Valida e decodifica um token JWT
 */
function verificarToken(token) {
  if (!token || typeof token !== 'string') return null
  const partes = token.split('.')
  if (partes.length !== 3) return null

  const [headerB64, payloadB64, assinatura] = partes

  const assinaturaEsperada = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${headerB64}.${payloadB64}`)
    .digest('base64url')

  if (assinatura.length !== assinaturaEsperada.length) return null
  const valido = crypto.timingSafeEqual(Buffer.from(assinatura), Buffer.from(assinaturaEsperada))
  if (!valido) return null

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf-8'))
    const agora = Math.floor(Date.now() / 1000)
    if (payload.exp && payload.exp < agora) return null
    return payload
  } catch {
    return null
  }
}

/**
 * Middleware Express para proteger rotas que exigem usuário autenticado
 */
function autenticarUsuario(req, res, next) {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null

  if (!token) {
    return res.status(401).json({ ok: false, erro: 'Acesso não autorizado. Faça login para continuar.' })
  }

  const payload = verificarToken(token)
  if (!payload) {
    return res.status(401).json({ ok: false, erro: 'Sessão expirada ou token inválido. Faça login novamente.' })
  }

  req.usuario = payload
  next()
}

/**
 * Middleware para rotas restritas a Gestor / Administrador
 */
function autenticarGestor(req, res, next) {
  autenticarUsuario(req, res, () => {
    if (req.usuario && (req.usuario.perfil === 'gestor' || req.usuario.perfil === 'admin')) {
      return next()
    }
    return res.status(403).json({ ok: false, erro: 'Acesso restrito a gestores e administradores.' })
  })
}

module.exports = {
  hashearSenha,
  verificarSenha,
  gerarToken,
  verificarToken,
  autenticarUsuario,
  autenticarGestor,
}
