// ── Login (login.html → React) ─────────────────────────────────────────────
// Segurança aplicada:
//  - Erro genérico "E-mail ou senha incorretos" (não revela se o e-mail existe).
//  - Bloqueio progressivo após 5 falhas (no contexto de autenticação).
//  - autocomplete="current-password" e botão mostrar/ocultar.
//  - Redirecionamento pós-login apenas para rotas internas (anti open redirect).

import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAutenticacao } from '../contextos/AutenticacaoContexto'

function rotaInterna(caminho) {
  return typeof caminho === 'string' && caminho.startsWith('/') && !caminho.startsWith('//')
}

export default function Login() {
  const { usuario, entrar, pronto, erroCripto } = useAutenticacao()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  if (usuario) {
    const destino = rotaInterna(location.state?.de) ? location.state.de : '/'
    return <Navigate to={destino} replace />
  }

  const submeter = async (e) => {
    e.preventDefault()
    setErro('')
    setEnviando(true)
    try {
      const resultado = await entrar(email, senha)
      if (resultado.ok) {
        const destino = rotaInterna(location.state?.de) ? location.state.de : '/'
        navigate(destino, { replace: true })
      } else {
        setErro(resultado.erro)
      }
    } catch {
      setErro('Falha inesperada ao entrar. Tente novamente.')
    } finally {
      setEnviando(false)
      setSenha('')
    }
  }

  return (
    <main className="login-wrapper">
      <div className="login-container">
        <img src="/logomarca.png" alt="Logo Localize Sua Saúde" style={{ maxWidth: 160, margin: '0 auto 16px', display: 'block' }} />
        <h1 style={{ fontSize: '1.4rem', marginBottom: 8, color: '#1a2a6c' }}>Localize Sua Saúde</h1>
        <p style={{ fontSize: '.85rem', color: '#4a5568', marginBottom: 20 }}>
          Faça login para agendar consultas e avaliar unidades (RN02)
        </p>

        {erroCripto && (
          <div className="form-msg form-msg--erro" role="alert">
            Ambiente sem criptografia segura (HTTPS/localhost). O login está desativado por segurança.
          </div>
        )}

        <form onSubmit={submeter} noValidate>
          <div className="input-group">
            <label htmlFor="user">E-mail</label>
            <input
              type="email"
              id="user"
              value={email}
              onChange={(e) => setEmail(e.target.value.slice(0, 120))}
              placeholder="seu@email.com"
              required
              autoComplete="username"
              maxLength={120}
            />
          </div>

          <div className="input-group password-group">
            <label htmlFor="pass">Senha</label>
            <input
              type={mostrarSenha ? 'text' : 'password'}
              id="pass"
              value={senha}
              onChange={(e) => setSenha(e.target.value.slice(0, 128))}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              maxLength={128}
            />
            <button
              type="button"
              onClick={() => setMostrarSenha(m => !m)}
              className="btn-show-pass"
              aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
            >
              {mostrarSenha ? '🙈 Ocultar senha' : '👁 Mostrar senha'}
            </button>
          </div>

          {erro && (
            <div id="login-error" role="alert" aria-live="polite" className="form-msg form-msg--erro">
              ⚠️ {erro}
            </div>
          )}

          <button type="submit" className="btn-submit" disabled={!pronto || enviando || erroCripto}>
            {enviando ? 'Verificando...' : 'ENTRAR'}
          </button>
        </form>

        <div style={{ marginTop: 16, padding: 12, background: '#f0f4ff', borderRadius: 8, fontSize: '.8rem', color: '#4a5568', textAlign: 'left' }}>
          <strong>Perfis disponíveis:</strong><br />
          🧑 Cidadão · 👩‍⚕️ Atendente · 👔 Gestor
        </div>

        {/* Credenciais apenas para demonstração em ambiente controlado */}
        <details style={{ marginTop: 10, fontSize: '.78rem', color: '#718096' }}>
          <summary style={{ cursor: 'pointer' }}>Ambiente de demonstração</summary>
          <p style={{ marginTop: 6 }}>
            Usuários de teste (senha <code>123456</code>): cidadao@teste.com · atendente@teste.com · gestor@teste.com
          </p>
          <p style={{ color: '#e53e3e' }}>⚠️ Remover este bloco antes de publicar em produção.</p>
        </details>

        <Link to="/cadastro" className="signup-link">
          Não tem conta? Cadastre-se gratuitamente →
        </Link>
      </div>
    </main>
  )
}
