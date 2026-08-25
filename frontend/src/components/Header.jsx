export default function Header() {
  return (
    <header className="nav-bar">
      <div id="navbar">
        <a href="/" aria-current="page">Início</a>
        <a href="/hospitais">Unidades de Saúde</a>
        <a href="/medicamentos">Medicamentos</a>
        <a href="/agendamento">Agendamento</a>
        <a href="/login" className="nav-right btn-login" id="nav-login">Login</a>
      </div>
    </header>
  )
}
