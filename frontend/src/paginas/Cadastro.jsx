// ── Cadastro (login2.html → React) ─────────────────────────────────────────
// Segurança aplicada:
//  - Senha mínima de 8 caracteres com letras e números.
//  - Perfil validado contra lista fixa no contexto (não confia no client).
//  - E-mail duplicado retorna mensagem neutra (não confirma existência).
//  - A senha nunca é logada nem exibida; hash com salto é feito no contexto.

import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAutenticacao } from '../contextos/AutenticacaoContexto'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function Cadastro() {
  const { usuario, cadastrar, pronto, erroCripto } = useAutenticacao()
  const navigate = useNavigate()

  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [perfil, setPerfil] = useState('cidadao')
  const [senha, setSenha] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [termos, setTermos] = useState(false)
  const [mostrarSenhas, setMostrarSenhas] = useState(false)
  const [msg, setMsg] = useState(null)
  const [enviando, setEnviando] = useState(false)

  if (usuario) return <Navigate to="/" replace />

  const forcaSenhaOk = (s) => s.length >= 8 && /[A-Za-z]/.test(s) && /\d/.test(s)

  const submeter = async (e) => {
    e.preventDefault()
    setMsg(null)

    if (!nome.trim()) return setMsg({ tipo: 'erro', texto: 'Informe seu nome completo.' })
    if (!EMAIL_REGEX.test(email.trim())) return setMsg({ tipo: 'erro', texto: 'Informe um e-mail válido.' })
    if (!forcaSenhaOk(senha)) {
      return setMsg({ tipo: 'erro', texto: 'A senha deve ter ao menos 8 caracteres, incluindo letras e números.' })
    }
    if (senha !== confirmar) return setMsg({ tipo: 'erro', texto: 'As senhas não conferem.' })
    if (!termos) return setMsg({ tipo: 'erro', texto: 'Você precisa aceitar os termos e condições.' })

    setEnviando(true)
    try {
      const resultado = await cadastrar(nome, email, senha, perfil)
      if (resultado.ok) {
        setMsg({ tipo: 'sucesso', texto: '✅ Conta criada com sucesso! Redirecionando para o login...' })
        setTimeout(() => navigate('/login', { replace: true }), 1500)
      } else {
        setMsg({ tipo: 'erro', texto: `⚠️ ${resultado.erro}` })
      }
    } catch {
      setMsg({ tipo: 'erro', texto: '⚠️ Erro inesperado ao cadastrar. Tente novamente.' })
    } finally {
      setEnviando(false)
      setSenha('')
      setConfirmar('')
    }
  }

  return (
    <main className="login-wrapper">
      <div className="login-container signup-container">
        <img src="/logomarca.png" alt="Logo Localize Sua Saúde" style={{ maxWidth: 140, margin: '0 auto 12px', display: 'block' }} />
        <div className="signup-header">
          <h1 style={{ fontSize: '1.4rem', color: '#1a2a6c' }}>Crie sua conta</h1>
          <p style={{ fontSize: '.85rem', color: '#4a5568' }}>Preencha os campos abaixo para se cadastrar</p>
        </div>

        {msg && (
          <div id="form-msg" role="alert" aria-live="polite" className={`form-msg ${msg.tipo === 'sucesso' ? 'form-msg--sucesso' : 'form-msg--erro'}`}>
            {msg.texto}
          </div>
        )}

        <form onSubmit={submeter} noValidate>
          <div className="input-group">
            <label htmlFor="nome">Nome Completo</label>
            <input
              type="text"
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value.slice(0, 80))}
              placeholder="Digite seu nome completo"
              required
              autoComplete="name"
              maxLength={80}
            />
          </div>

          <div className="input-group">
            <label htmlFor="email">E-mail</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value.slice(0, 120))}
              placeholder="seu@email.com"
              required
              autoComplete="email"
              maxLength={120}
            />
          </div>

          <div className="input-group">
            <label htmlFor="perfil">Perfil de acesso</label>
            <select id="perfil" value={perfil} onChange={(e) => setPerfil(e.target.value)} className="select-full">
              <option value="cidadao">🧑 Cidadão</option>
              <option value="atendente">👩‍⚕️ Atendente</option>
              <option value="gestor">👔 Gestor</option>
            </select>
          </div>

          <div className="input-group">
            <label htmlFor="senha">
              Senha <small style={{ color: '#718096' }}>(mín. 8 caracteres, com letras e números)</small>
            </label>
            <input
              type={mostrarSenhas ? 'text' : 'password'}
              id="senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value.slice(0, 128))}
              placeholder="Crie uma senha segura"
              required
              autoComplete="new-password"
              maxLength={128}
            />
          </div>

          <div className="input-group password-group">
            <label htmlFor="confirmar_senha">Confirmar Senha</label>
            <input
              type={mostrarSenhas ? 'text' : 'password'}
              id="confirmar_senha"
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value.slice(0, 128))}
              placeholder="Repita a senha"
              required
              autoComplete="new-password"
              maxLength={128}
            />
            <button
              type="button"
              onClick={() => setMostrarSenhas(m => !m)}
              className="btn-show-pass"
              aria-label={mostrarSenhas ? 'Ocultar senhas' : 'Mostrar senhas'}
            >
              {mostrarSenhas ? '🙈 Ocultar senhas' : '👁 Mostrar senhas'}
            </button>
          </div>

          <div className="terms-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={termos}
                onChange={(e) => setTermos(e.target.checked)}
                required
              />
              <span>Eu aceito os <Link to="/">termos e condições</Link>.</span>
            </label>
          </div>

          <button type="submit" className="btn-submit" disabled={!pronto || enviando || erroCripto}>
            {enviando ? 'Salvando...' : 'Finalizar Cadastro'}
          </button>
        </form>

        <div className="footer-link" style={{ marginTop: 16, textAlign: 'center', fontSize: '.9rem', color: '#4a5568' }}>
          Já tem uma conta?
          <Link to="/login" className="signup-link">Faça login →</Link>
        </div>
      </div>
    </main>
  )
}
