export default function QuickAccess({ onNavigate }) {
  return (
    <section className="quick-access" aria-label="Acesso rápido">
      <div className="container">
        <button
          type="button"
          onClick={() => onNavigate('unidades')}
          className="btn-bloco"
          id="btn-ver-unidades"
        >
          Hospitais e Clínicas
        </button>
        <button
          type="button"
          onClick={() => onNavigate('medicamentos')}
          className="btn-bloco btn-bloco--green"
          id="btn-medicamentos"
        >
          Consulta de Medicamentos
        </button>
        <button
          type="button"
          onClick={() => onNavigate('agendamentos')}
          className="btn-bloco btn-bloco--teal"
          id="btn-agendar"
        >
          Agendar Atendimento
        </button>
      </div>
    </section>
  )
}
