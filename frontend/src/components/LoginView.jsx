import { useState } from 'react'
import { autenticarUsuario } from '../servicos/apiCliente'

export default function LoginView({ onLoginSuccess, onNavigateCadastro }) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = await autenticarUsuario(email, senha)

      if (data.ok && data.usuario && data.token) {
        localStorage.setItem('loggedIn', 'true')
        localStorage.setItem('token', data.token)
        localStorage.setItem('userId', String(data.usuario.id))
        localStorage.setItem('userPerfil', data.usuario.perfil)
        localStorage.setItem('userName', data.usuario.nome)
        localStorage.setItem('userEmail', data.usuario.email)

        window.dispatchEvent(new Event('authChange'))
        if (onLoginSuccess) {
          onLoginSuccess(data.usuario)
        }
      } else {
        setError(data.erro || 'E-mail ou senha incorretos.')
      }
    } catch {
      setError('Falha de comunicação com o servidor. Verifique sua conexão.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-wrapper">
      <div className="login-container">
        <div className="login-logo-box">
          <img
            src="/logomarca.png"
            alt="Logo Localize Sua Saúde"
            className="login-logo-img"
          />
        </div>

        <h2 className="login-title">Acesse sua Conta</h2>
        <p className="login-desc">
          Informe suas credenciais para gerenciar seus agendamentos e consultas.
        </p>

        {error && (
          <div id="login-error" role="alert" className="alert-box alert-box--erro">
            {error}
          </div>
        )}

        <form id="login-form" onSubmit={handleLogin} noValidate>
          <div className="input-group">
            <label htmlFor="login-email">E-mail</label>
            <input
              type="email"
              id="login-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="exemplo@dominio.com"
              required
              autoComplete="username"
            />
          </div>

          <div className="input-group password-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label htmlFor="login-pass">Senha</label>
              <button
                type="button"
                className="btn-toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              id="login-pass"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Digite sua senha"
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn-submit"
            disabled={loading}
          >
            {loading ? 'Autenticando...' : 'Entrar'}
          </button>
        </form>

        <div className="signup-prompt">
          <span>Ainda não possui uma conta?</span>
          <button
            type="button"
            className="link-btn-highlight"
            onClick={onNavigateCadastro}
          >
            Cadastre-se gratuitamente
          </button>
        </div>
      </div>
    </div>
  )
}
