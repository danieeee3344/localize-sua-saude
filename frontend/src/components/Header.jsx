import { useState, useEffect } from 'react'

export default function Header({ currentView, setView }) {
  const [usuario, setUsuario] = useState(null)

  useEffect(() => {
    const atualizarUsuario = () => {
      const logged = localStorage.getItem('loggedIn') === 'true'
      if (logged) {
        setUsuario({
          id: localStorage.getItem('userId'),
          nome: localStorage.getItem('userName') || 'Usuário',
          perfil: localStorage.getItem('userPerfil') || 'cidadao',
          email: localStorage.getItem('userEmail') || '',
        })
      } else {
        setUsuario(null)
      }
    }

    atualizarUsuario()
    window.addEventListener('storage', atualizarUsuario)
    window.addEventListener('authChange', atualizarUsuario)
    return () => {
      window.removeEventListener('storage', atualizarUsuario)
      window.removeEventListener('authChange', atualizarUsuario)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('loggedIn')
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    localStorage.removeItem('userName')
    localStorage.removeItem('userPerfil')
    localStorage.removeItem('userEmail')
    setUsuario(null)
    window.dispatchEvent(new Event('authChange'))
    setView('home')
  }

  const getPerfilLabel = (perfil) => {
    switch (perfil) {
      case 'gestor':
        return 'Gestor'
      case 'atendente':
        return 'Atendente'
      default:
        return 'Cidadão'
    }
  }

  return (
    <header className="nav-bar">
      <nav id="navbar" aria-label="Navegação Principal">
        <button
          type="button"
          className={`nav-link-btn ${currentView === 'home' ? 'active' : ''}`}
          onClick={() => setView('home')}
          aria-current={currentView === 'home' ? 'page' : undefined}
        >
          Início
        </button>

        <button
          type="button"
          className={`nav-link-btn ${currentView === 'unidades' ? 'active' : ''}`}
          onClick={() => setView('unidades')}
          aria-current={currentView === 'unidades' ? 'page' : undefined}
        >
          Unidades de Saúde
        </button>

        <button
          type="button"
          className={`nav-link-btn ${currentView === 'medicamentos' ? 'active' : ''}`}
          onClick={() => setView('medicamentos')}
          aria-current={currentView === 'medicamentos' ? 'page' : undefined}
        >
          Medicamentos
        </button>

        <button
          type="button"
          className={`nav-link-btn ${currentView === 'agendamentos' ? 'active' : ''}`}
          onClick={() => setView('agendamentos')}
          aria-current={currentView === 'agendamentos' ? 'page' : undefined}
        >
          Agendamentos
        </button>

        {usuario && (usuario.perfil === 'gestor' || usuario.perfil === 'atendente') && (
          <button
            type="button"
            className={`nav-link-btn ${currentView === 'admin' ? 'active' : ''}`}
            onClick={() => setView('admin')}
            aria-current={currentView === 'admin' ? 'page' : undefined}
          >
            Painel Gestor
          </button>
        )}

        <div className="nav-right">
          {usuario ? (
            <div className="user-nav-badge">
              <span className="user-name">
                {usuario.nome.split(' ')[0]} <small className="user-role-tag">({getPerfilLabel(usuario.perfil)})</small>
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="btn-logout"
                title="Encerrar sessão"
                aria-label="Encerrar sessão"
              >
                Sair
              </button>
            </div>
          ) : (
            <div className="auth-buttons-group">
              <button
                type="button"
                className="btn-login"
                id="nav-login"
                onClick={() => setView('login')}
              >
                Entrar
              </button>
              <button
                type="button"
                className="btn-signup"
                onClick={() => setView('cadastro')}
              >
                Cadastre-se
              </button>
            </div>
          )}
        </div>
      </nav>
    </header>
  )
}
