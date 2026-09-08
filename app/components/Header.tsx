import Link from 'next/link';

export default function Header() {
  return (
    <header className="nav-bar">
      <div id="navbar">
        <Link href="/">Início</Link>
        <Link href="/hospitais">Unidades de Saúde</Link>
        <Link href="/medicamentos">Medicamentos</Link>
        <Link href="/agendamento">Agendamento</Link>
        <Link href="/login" className="nav-right btn-login" id="nav-login">
          Login
        </Link>
      </div>
    </header>
  );
}
