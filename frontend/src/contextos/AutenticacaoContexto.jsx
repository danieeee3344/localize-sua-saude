// ── Contexto de Autenticação (RN02) ────────────────────────────────────────
// Medidas de segurança:
//  - Senhas NUNCA são armazenadas em texto puro: SHA-256(salto + senha)
//    com salto aleatório de 128 bits por usuário (Web Crypto).
//  - Sessão mínima (nome, e-mail, perfil) em sessionStorage — é limpa ao
//    fechar a aba e não carrega dados sensíveis.
//  - Mensagens de erro genéricas no login (evita enumeração de usuários).
//  - Bloqueio temporário após MAX_TENTATIVAS falhas (anti força-bruta;
//    o backend também aplica rate limit).
//  - Falha fechada se Web Crypto não estiver disponível (contexto inseguro).

import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'

const CHAVE_USUARIOS = 'lss_usuarios'
const CHAVE_SESSAO = 'lss_sessao'
const CHAVE_BLOQUEIO = 'lss_bloqueio_login'
const MAX_TENTATIVAS = 5
const BLOQUEIO_MS = 5 * 60 * 1000
const SESSAO_MS = 8 * 60 * 60 * 1000

const USUARIOS_PADRAO = [
  { nome: 'Maria Silva', email: 'cidadao@teste.com', senha: '123456', perfil: 'cidadao' },
  { nome: 'Ana Atendente', email: 'atendente@teste.com', senha: '123456', perfil: 'atendente' },
  { nome: 'Dr. Gestor', email: 'gestor@teste.com', senha: '123456', perfil: 'gestor' }
]

function criptoDisponivel() {
  return typeof crypto !== 'undefined' && Boolean(crypto.subtle)
}

async function calcularHash(senha, salto) {
  const dados = new TextEncoder().encode(`${salto}:${senha}`)
  const buffer = await crypto.subtle.digest('SHA-256', dados)
  return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('')
}

function gerarSalto() {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
}

function lerUsuarios() {
  try {
    const bruto = localStorage.getItem(CHAVE_USUARIOS)
    const lista = bruto ? JSON.parse(bruto) : []
    return Array.isArray(lista) ? lista : []
  } catch {
    return []
  }
}

function salvarUsuarios(usuarios) {
  localStorage.setItem(CHAVE_USUARIOS, JSON.stringify(usuarios))
}

function lerSessao() {
  try {
    const bruto = sessionStorage.getItem(CHAVE_SESSAO)
    if (!bruto) return null
    const sessao = JSON.parse(bruto)
    if (!sessao || typeof sessao !== 'object') return null
    if (!sessao.expiraEm || sessao.expiraEm < Date.now()) {
      sessionStorage.removeItem(CHAVE_SESSAO)
      return null
    }
    return { nome: String(sessao.nome), email: String(sessao.email), perfil: String(sessao.perfil) }
  } catch {
    return null
  }
}

const AutenticacaoContexto = createContext(null)

export function AutenticacaoProvider({ children }) {
  const [usuario, setUsuario] = useState(() => lerSessao())
  const [pronto, setPronto] = useState(false)
  const [erroCripto, setErroCripto] = useState(false)
  const prontoRef = useRef(null)

  // Semear usuários padrão apenas na primeira execução (hash + salto)
  useEffect(() => {
    if (!criptoDisponivel()) {
      setErroCripto(true)
      setPronto(true)
      return
    }
    let cancelado = false
    prontoRef.current = (async () => {
      const usuarios = lerUsuarios()
      if (usuarios.length === 0) {
        const semeados = []
        for (const u of USUARIOS_PADRAO) {
          const salto = gerarSalto()
          semeados.push({
            nome: u.nome,
            email: u.email,
            perfil: u.perfil,
            salto,
            hash: await calcularHash(u.senha, salto)
          })
        }
        salvarUsuarios(semeados)
      }
    })()
    prontoRef.current.then(() => {
      if (!cancelado) setPronto(true)
    })
    return () => { cancelado = true }
  }, [])

  const contexto = useMemo(() => ({
    usuario,
    pronto,
    erroCripto,

    async cadastrar(nome, email, senha, perfil) {
      if (!criptoDisponivel()) {
        return { ok: false, erro: 'Recurso de criptografia indisponível. Use HTTPS ou localhost.' }
      }
      await prontoRef.current
      const nomeLimpo = String(nome || '').trim().slice(0, 80)
      const emailLimpo = String(email || '').trim().toLowerCase().slice(0, 120)

      if (!nomeLimpo) return { ok: false, erro: 'Informe seu nome completo.' }

      const perfisValidos = ['cidadao', 'atendente', 'gestor']
      const perfilSeguro = perfisValidos.includes(perfil) ? perfil : 'cidadao'

      const usuarios = lerUsuarios()
      if (usuarios.some(u => u.email === emailLimpo)) {
        return { ok: false, erro: 'Não foi possível concluir o cadastro com os dados informados.' }
      }

      const salto = gerarSalto()
      const hash = await calcularHash(senha, salto)
      usuarios.push({ nome: nomeLimpo, email: emailLimpo, perfil: perfilSeguro, salto, hash })
      salvarUsuarios(usuarios)
      return { ok: true }
    },

    async entrar(email, senha) {
      if (!criptoDisponivel()) {
        return { ok: false, erro: 'Recurso de criptografia indisponível. Use HTTPS ou localhost.' }
      }
      await prontoRef.current

      // Anti força-bruta local (defesa adicional ao rate limit do servidor)
      let bloqueio = null
      try { bloqueio = JSON.parse(sessionStorage.getItem(CHAVE_BLOQUEIO)) } catch { /* ignora */ }
      if (bloqueio && bloqueio.ate > Date.now()) {
        const minutos = Math.ceil((bloqueio.ate - Date.now()) / 60000)
        return { ok: false, erro: `Muitas tentativas. Tente novamente em ${minutos} minuto(s).` }
      }

      const emailLimpo = String(email || '').trim().toLowerCase().slice(0, 120)
      const usuarios = lerUsuarios()
      const encontrado = usuarios.find(u => u.email === emailLimpo)

      // Mensagem única para os dois casos (não revela se o e-mail existe)
      const falhar = () => {
        const tentativas = (Number(bloqueio?.tentativas) || 0) + 1
        if (tentativas >= MAX_TENTATIVAS) {
          sessionStorage.setItem(CHAVE_BLOQUEIO, JSON.stringify({ tentativas: 0, ate: Date.now() + BLOQUEIO_MS }))
          return { ok: false, erro: `Muitas tentativas. Tente novamente em ${Math.ceil(BLOQUEIO_MS / 60000)} minutos.` }
        }
        sessionStorage.setItem(CHAVE_BLOQUEIO, JSON.stringify({ tentativas, ate: Date.now() }))
        return { ok: false, erro: 'E-mail ou senha incorretos.' }
      }

      if (!encontrado) return falhar()

      const hash = await calcularHash(senha, encontrado.salto)
      // Comparação de tempo constante entre hashes de mesmo tamanho
      if (hash.length !== encontrado.hash.length) return falhar()
      let difere = 0
      for (let i = 0; i < hash.length; i++) difere |= hash.charCodeAt(i) ^ encontrado.hash.charCodeAt(i)
      if (difere !== 0) return falhar()

      sessionStorage.removeItem(CHAVE_BLOQUEIO)
      const sessao = {
        nome: encontrado.nome,
        email: encontrado.email,
        perfil: encontrado.perfil,
        expiraEm: Date.now() + SESSAO_MS
      }
      sessionStorage.setItem(CHAVE_SESSAO, JSON.stringify(sessao))
      setUsuario({ nome: sessao.nome, email: sessao.email, perfil: sessao.perfil })
      return { ok: true, usuario: { nome: sessao.nome, email: sessao.email, perfil: sessao.perfil } }
    },

    sair() {
      sessionStorage.removeItem(CHAVE_SESSAO)
      setUsuario(null)
    }
  }), [usuario, pronto])

  return (
    <AutenticacaoContexto.Provider value={contexto}>
      {children}
    </AutenticacaoContexto.Provider>
  )
}

export function useAutenticacao() {
  const ctx = useContext(AutenticacaoContexto)
  if (!ctx) throw new Error('useAutenticacao deve ser usado dentro de AutenticacaoProvider')
  return ctx
}
