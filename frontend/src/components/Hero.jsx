export default function Hero({ onExplore }) {
  return (
    <section className="hero-container" aria-label="Apresentação da plataforma">
      <div className="logo-container">
        <img
          src="/logomarca.png"
          alt="Logomarca Localize Sua Saúde"
          className="hero-logo"
        />
      </div>

      <div id="intro">
        <h1>Encontre Hospitais, Clínicas e Medicamentos no Vale do Araguaia</h1>
        <p className="hero-subtitle">
          Informações atualizadas, gratuitas e acessíveis para a população de{' '}
          <strong>Barra do Garças (MT)</strong>, <strong>Pontal do Araguaia (MT)</strong> e{' '}
          <strong>Aragarças (GO)</strong>.
        </p>

        <div className="hero-badges">
          <span className="hero-badge">Região do Vale do Araguaia</span>
          <span className="hero-badge">Rede SUS e Particular</span>
          <span className="hero-badge">Disponibilidade de Medicamentos</span>
          <span className="hero-badge">Acessibilidade WCAG 2.1 AA</span>
        </div>
      </div>
    </section>
  )
}
