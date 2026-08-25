export default function QuickAccess() {
  return (
    <section className="quick-access" aria-label="Acesso rápido">
      <div className="container">
        <a href="/hospitais" className="btn-bloco" id="btn-ver-unidades">
          Ver Hospitais e Clínicas
        </a>
        <a href="/medicamentos" className="btn-bloco btn-bloco--green" id="btn-medicamentos">
          Consultar Medicamentos
        </a>
        <a href="/agendamento" className="btn-bloco btn-bloco--teal" id="btn-agendar">
          Agendar Consulta
        </a>
      </div>
    </section>
  )
}
