import { useState } from 'react'
import { cadastrarUsuario } from '../servicos/apiCliente'

export default function CadastroView({ onCadastroSuccess, onNavigateLogin }) {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [perfil, setPerfil] = useState('cidadao')
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [termos, setTermos] = useState(true)
  const [showPasswords, setShowPasswords] = useState(false)
  const [msg, setMsg] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleCadastro = async (e) => {
    e.preventDefault()
    setMsg(null)

    if (!termos) {
      setMsg({ texto: 'Você deve aceitar os Termos de Uso para prosseguir.', tipo: 'erro' })
      return
    }

    if (senha !== confirmarSenha) {
      setMsg({ texto: 'A confirmação de senha não confere.', tipo: 'erro' })
      return
    }

    if (senha.length < 6) {
      setMsg({ texto: 'A senha deve ter no mínimo 6 caracteres.', tipo: 'erro' })
      return
    }

    setLoading(true)

    try {
      const data = await cadastrarUsuario({ nome, email, senha, perfil })

      if (data.ok) {
        setMsg({
          texto: 'Conta criada com sucesso! Redirecionando para o login...',
          tipo: 'sucesso',
        })
        setTimeout(() => {
          if (onCadastroSuccess) onCadastroSuccess()
        }, 1500)
      } else {
        setMsg({ texto: data.erro || 'Falha ao processar cadastro.', tipo: 'erro' })
      }
    } catch {
      setMsg({ texto: 'Falha ao conectar com o servidor. Tente novamente.', tipo: 'erro' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-wrapper">
      <div className="login-container signup-container">
        <div className="login-logo-box">
          <img
            src="/logomarca.png"
            alt="Logo Localize Sua Saúde"
            className="login-logo-img"
          />
        </div>

        <h2 className="login-title">Criar Conta</h2>
        <p className="login-desc">
          Cadastre-se para acessar os serviços de agendamento e saúde regional.
        </p>

        {msg && (
          <div role="alert" className={`alert-box alert-box--${msg.tipo}`}>
            {msg.texto}
          </div>
        )}

        <form onSubmit={handleCadastro} noValidate>
          <div className="input-group">
            <label htmlFor="cad-nome">Nome Completo</label>
            <input
              type="text"
              id="cad-nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Informe seu nome completo"
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="cad-email">E-mail</label>
            <input
              type="email"
              id="cad-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="exemplo@dominio.com"
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="cad-perfil">Tipo de Perfil</label>
            <select
              id="cad-perfil"
              value={perfil}
              onChange={(e) => setPerfil(e.target.value)}
            >
              <option value="cidadao">Cidadão / Paciente</option>
              <option value="atendente">Atendente de Saúde</option>
              <option value="gestor">Gestor / Administrador</option>
            </select>
          </div>

          <div className="input-group">
            <label htmlFor="cad-senha">
              Senha <small>(mínimo 6 caracteres)</small>
            </label>
            <input
              type={showPasswords ? 'text' : 'password'}
              id="cad-senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Digite uma senha segura"
              required
            />
          </div>

          <div className="input-group password-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label htmlFor="cad-confirmar-senha">Confirmar Senha</label>
              <button
                type="button"
                className="btn-toggle-password"
                onClick={() => setShowPasswords(!showPasswords)}
              >
                {showPasswords ? 'Ocultar senhas' : 'Mostrar senhas'}
              </button>
            </div>
            <input
              type={showPasswords ? 'text' : 'password'}
              id="cad-confirmar-senha"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              placeholder="Repita a senha"
              required
            />
          </div>

          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={termos}
                onChange={(e) => setTermos(e.target.checked)}
                required
              />
              <span>
                Li e aceito os Termos de Uso e Políticas de Privacidade.
              </span>
            </label>
          </div>

          <button
            type="submit"
            className="btn-submit"
            disabled={loading}
          >
            {loading ? 'Processando...' : 'Finalizar Cadastro'}
          </button>
        </form>

        <div className="signup-prompt">
          <span>Já possui uma conta?</span>
          <button
            type="button"
            className="link-btn-highlight"
            onClick={onNavigateLogin}
          >
            Fazer Login
          </button>
        </div>
      </div>
    </div>
  )
}
