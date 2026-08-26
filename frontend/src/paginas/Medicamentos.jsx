// ── Consulta de Medicamentos (medicamentos.html → React) ───────────────────
// Segurança aplicada:
//  - A versão estática interpolava a busca dentro de innerHTML
//    (XSS refletido). Aqui TODO resultado é renderizado como nó de texto.
//  - Entrada normalizada: trim + limite de 60 caracteres.
//  - Dados de exibição são constantes internas (sem origem externa).

import { useState } from 'react'

const ESTOQUE = {
  dipirona: [
    { unidade: 'UPA 24h', disponivel: true, atualizado: '11/08/2026 08:30', tipo: 'sus' },
    { unidade: 'Medbarra', disponivel: true, atualizado: '11/08/2026 07:00', tipo: 'particular' },
    { unidade: 'Hospital Cristo Redentor', disponivel: false, atualizado: '10/08/2026 18:00', tipo: 'particular' }
  ],
  amoxicilina: [
    { unidade: 'UPA 24h', disponivel: true, atualizado: '11/08/2026 06:00', tipo: 'sus' },
    { unidade: 'Medbarra', disponivel: false, atualizado: '10/08/2026 14:00', tipo: 'particular' },
    { unidade: 'Hospital Cristo Redentor', disponivel: true, atualizado: '11/08/2026 09:15', tipo: 'particular' }
  ],
  losartana: [
    { unidade: 'UPA 24h', disponivel: true, atualizado: '11/08/2026 08:00', tipo: 'sus' },
    { unidade: 'Medbarra', disponivel: true, atualizado: '11/08/2026 07:30', tipo: 'particular' },
    { unidade: 'Hospital Cristo Redentor', disponivel: true, atualizado: '11/08/2026 09:00', tipo: 'particular' }
  ],
  metformina: [
    { unidade: 'UPA 24h', disponivel: false, atualizado: '09/08/2026 16:00', tipo: 'sus' },
    { unidade: 'Medbarra', disponivel: true, atualizado: '11/08/2026 07:00', tipo: 'particular' },
    { unidade: 'Hospital Cristo Redentor', disponivel: true, atualizado: '11/08/2026 08:45', tipo: 'particular' }
  ],
  omeprazol: [
    { unidade: 'UPA 24h', disponivel: true, atualizado: '11/08/2026 07:45', tipo: 'sus' },
    { unidade: 'Medbarra', disponivel: true, atualizado: '11/08/2026 06:30', tipo: 'particular' },
    { unidade: 'Hospital Cristo Redentor', disponivel: false, atualizado: '10/08/2026 17:00', tipo: 'particular' }
  ]
}

const SUGESTOES = ['Dipirona', 'Amoxicilina', 'Losartana', 'Metformina', 'Omeprazol']

export default function Medicamentos() {
  const [busca, setBusca] = useState('')
  const [consulta, setConsulta] = useState(null)

  const pesquisar = () => {
    const termo = busca.trim().toLowerCase().slice(0, 60)
    if (!termo) {
      setConsulta(null)
      return
    }
    const chave = Object.keys(ESTOQUE).find(k => k.includes(termo) || termo.includes(k))
    setConsulta({ termo: busca.trim().slice(0, 60), chave: chave || null })
  }

  const pesquisarRapido = (nome) => {
    setBusca(nome)
    setConsulta({ termo: nome, chave: nome.toLowerCase() })
  }

  return (
    <main className="intro-section">
      <div id="intro">
        <h1>Consulta de Medicamentos</h1>
        <p>Pesquise a disponibilidade de medicamentos nas unidades de saúde da região. (US03)</p>
      </div>

      <section className="meds-search-section" aria-label="Busca de medicamentos">
        <div className="meds-search-box">
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value.slice(0, 60))}
            onKeyDown={(e) => { if (e.key === 'Enter') pesquisar() }}
            placeholder="Digite o nome do medicamento..."
            aria-label="Nome do medicamento"
            maxLength={60}
            autoComplete="off"
          />
          <button onClick={pesquisar} className="btn-search">🔍 Buscar</button>
        </div>

        <div className="med-suggestions" aria-label="Medicamentos comuns">
          <span>Buscas comuns:</span>
          {SUGESTOES.map(nome => (
            <button key={nome} onClick={() => pesquisarRapido(nome)} className="chip">{nome}</button>
          ))}
        </div>
      </section>

      <div id="med-results" className="med-results" role="region" aria-live="polite" aria-label="Resultados da busca de medicamentos">
        {!consulta && (
          <div className="med-results-placeholder">
            <span>💊</span>
            <p>Digite o nome de um medicamento para ver onde está disponível.</p>
          </div>
        )}

        {consulta && !consulta.chave && (
          <div className="med-not-found">
            {/* Texto puro — sem interpolação em HTML */}
            <p>😔 Nenhum resultado para "<strong>{consulta.termo}</strong>".</p>
            <p>Tente um nome diferente ou entre em contato diretamente com as unidades.</p>
          </div>
        )}

        {consulta?.chave && (
          <>
            <h2 className="med-result-title">
              📋 Resultados para: <em>{consulta.chave.charAt(0).toUpperCase() + consulta.chave.slice(1)}</em>
            </h2>
            <div className="med-cards">
              {ESTOQUE[consulta.chave].map((item, i) => (
                <div key={i} className={`med-card ${item.disponivel ? 'med-card--available' : 'med-card--unavailable'}`}>
                  <div className="med-card__status">{item.disponivel ? '✅ Disponível' : '❌ Sem estoque'}</div>
                  <h3 className="med-card__unit">{item.unidade}</h3>
                  <p className={`med-card__badge ${item.tipo === 'sus' ? 'badge--sus' : 'badge--private'}`}>
                    {item.tipo === 'sus' ? '🏥 SUS / Gratuito' : '💳 Particular/Convênio'}
                  </p>
                  <p className="med-card__updated">🕐 Atualizado em: {item.atualizado}</p>
                  <a href="/hospitais" className="btn-action btn-map">Ver unidade →</a>
                </div>
              ))}
            </div>
            <p className="med-disclaimer">
              ℹ️ As informações de estoque são atualizadas pelos atendentes das unidades. Confirme a
              disponibilidade por telefone antes de se deslocar.
            </p>
          </>
        )}
      </div>
    </main>
  )
}
