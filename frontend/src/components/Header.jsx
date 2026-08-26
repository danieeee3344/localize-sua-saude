import { NavLink, useNavigate } from 'react-router-dom'
import { useAutenticacao } from '../contextos/AutenticacaoContexto'

export default function Header() {
  const { usuario, sair } = useAutenticacao()
  const navigate = useNavigate()

  const sairEVoltar = () => {
    sair()
    navigate('/', { replace: true })
  }

  return (
    <header className="nav-bar">
      <div id="navbar">
        <NavLink to="/">Início</NavLink>
        <NavLink to="/hospitais">Unidades de Saúde</NavLink>
        <NavLink to="/medicamentos">Medicamentos</NavLink>
        <NavLink to="/agendamento">Agendamento</NavLink>
        {usuario ? (
          <>
            <span className="nav-right nav-usuario" title={usuario.email}>
              👤 {usuario.nome} · {usuario.perfil}
            </span>
            <button type="button" className="btn-login btn-logout" onClick={sairEVoltar}>
              Sair
            </button>
          </>
        ) : (
          <NavLink to="/login" className="nav-right btn-login">Login</NavLink>
        )}
      </div>
    </header>
  )
}
