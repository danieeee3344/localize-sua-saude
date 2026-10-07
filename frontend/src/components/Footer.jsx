export default function Footer({ onOpenContact, onNavigateView }) {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer" role="contentinfo">
      <div className="col-1">
        <b>Localize Sua Saúde</b>
        <span>Vale do Araguaia (MT / GO)</span>
        <small style={{ color: 'rgba(255,255,255,0.7)', marginTop: '8px' }}>
          Barra do Garças • Pontal do Araguaia • Aragarças
        </small>
        <span style={{ fontSize: '.75rem', marginTop: '4px' }}>
          © {currentYear} Localize Sua Saúde. Todos os direitos reservados.
        </span>
      </div>

      <div className="col-2">
        <b>Navegação</b>
        <button
          type="button"
          onClick={() => onNavigateView && onNavigateView('unidades')}
          className="footer-link-btn"
        >
          Unidades de Saúde
        </button>
        <button
          type="button"
          onClick={() => onNavigateView && onNavigateView('medicamentos')}
          className="footer-link-btn"
        >
          Consulta de Medicamentos
        </button>
        <button
          type="button"
          onClick={() => onNavigateView && onNavigateView('agendamentos')}
          className="footer-link-btn"
        >
          Agendamento de Consultas
        </button>
      </div>

      <div className="col-3">
        <b>Telefones Úteis</b>
        <a href="tel:192">SAMU: 192</a>
        <a href="tel:193">Bombeiros: 193</a>
        <a href="tel:190">Polícia Militar: 190</a>
        <a href="tel:6634017000">UPA Barra do Garças: (66) 3401-7000</a>
      </div>

      <div className="col-4">
        <b>Institucional</b>
        <a href="#privacidade" onClick={(e) => { e.preventDefault(); alert('Em conformidade com a LGPD, seus dados pessoais e de saúde são protegidos.') }}>
          Segurança e Privacidade
        </a>
        <button
          type="button"
          onClick={onOpenContact}
          className="footer-link-btn"
          style={{ textAlign: 'left' }}
        >
          Fale Conosco / Contato
        </button>
      </div>
    </footer>
  )
}
