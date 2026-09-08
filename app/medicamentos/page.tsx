'use client';

import { useState } from 'react';

const medsDatabase: Record<
  string,
  Array<{ unidade: string; disponivel: boolean; qtd: string; atualizado: string; tipo: string }>
> = {
  dipirona: [
    { unidade: 'UPA 24h', disponivel: true, qtd: 'Disponível', atualizado: '11/08/2026 08:30', tipo: 'sus' },
    { unidade: 'Medbarra', disponivel: true, qtd: 'Disponível', atualizado: '11/08/2026 07:00', tipo: 'particular' },
    { unidade: 'Hospital Cristo Redentor', disponivel: false, qtd: 'Sem estoque', atualizado: '10/08/2026 18:00', tipo: 'particular' },
  ],
  amoxicilina: [
    { unidade: 'UPA 24h', disponivel: true, qtd: 'Disponível', atualizado: '11/08/2026 06:00', tipo: 'sus' },
    { unidade: 'Medbarra', disponivel: false, qtd: 'Sem estoque', atualizado: '10/08/2026 14:00', tipo: 'particular' },
    { unidade: 'Hospital Cristo Redentor', disponivel: true, qtd: 'Disponível', atualizado: '11/08/2026 09:15', tipo: 'particular' },
  ],
  losartana: [
    { unidade: 'UPA 24h', disponivel: true, qtd: 'Disponível', atualizado: '11/08/2026 08:00', tipo: 'sus' },
    { unidade: 'Medbarra', disponivel: true, qtd: 'Disponível', atualizado: '11/08/2026 07:30', tipo: 'particular' },
    { unidade: 'Hospital Cristo Redentor', disponivel: true, qtd: 'Disponível', atualizado: '11/08/2026 09:00', tipo: 'particular' },
  ],
  metformina: [
    { unidade: 'UPA 24h', disponivel: false, qtd: 'Sem estoque', atualizado: '09/08/2026 16:00', tipo: 'sus' },
    { unidade: 'Medbarra', disponivel: true, qtd: 'Disponível', atualizado: '11/08/2026 07:00', tipo: 'particular' },
    { unidade: 'Hospital Cristo Redentor', disponivel: true, qtd: 'Disponível', atualizado: '11/08/2026 08:45', tipo: 'particular' },
  ],
  omeprazol: [
    { unidade: 'UPA 24h', disponivel: true, qtd: 'Disponível', atualizado: '11/08/2026 07:45', tipo: 'sus' },
    { unidade: 'Medbarra', disponivel: true, qtd: 'Disponível', atualizado: '11/08/2026 06:30', tipo: 'particular' },
    { unidade: 'Hospital Cristo Redentor', disponivel: false, qtd: 'Sem estoque', atualizado: '10/08/2026 17:00', tipo: 'particular' },
  ],
};

export default function MedicamentosPage() {
  const [query, setQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState('');

  const searchMed = (name?: string) => {
    const term = (name !== undefined ? name : query).trim().toLowerCase();
    setActiveSearch(term);
  };

  const foundKey = activeSearch
    ? Object.keys(medsDatabase).find((k) => k.includes(activeSearch) || activeSearch.includes(k))
    : null;

  return (
    <main className="intro-section">
      <div id="intro">
        <h1>Consulta de Medicamentos</h1>
        <p>Pesquise a disponibilidade de medicamentos nas unidades de saúde da região.</p>
      </div>

      <section className="meds-search-section" aria-label="Busca de medicamentos">
        <div className="meds-search-box">
          <input
            type="search"
            id="med-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && searchMed()}
            placeholder="Digite o nome do medicamento..."
            aria-label="Nome do medicamento"
            autoComplete="off"
          />
          <button onClick={() => searchMed()} className="btn-search" id="btn-buscar-med">
            🔍 Buscar
          </button>
        </div>

        <div className="med-suggestions" aria-label="Medicamentos comuns">
          <span>Buscas comuns:</span>
          {['Dipirona', 'Amoxicilina', 'Losartana', 'Metformina', 'Omeprazol'].map((med) => (
            <button
              key={med}
              onClick={() => {
                setQuery(med);
                searchMed(med);
              }}
              className="chip"
            >
              {med}
            </button>
          ))}
        </div>
      </section>

      <div
        id="med-results"
        className="med-results"
        role="region"
        aria-live="polite"
        aria-label="Resultados da busca de medicamentos"
      >
        {!activeSearch && (
          <div className="med-results-placeholder">
            <span>💊</span>
            <p>Digite o nome de um medicamento para ver onde está disponível.</p>
          </div>
        )}

        {activeSearch && !foundKey && (
          <div className="med-not-found">
            <p>
              😔 Nenhum resultado para &quot;<strong>{activeSearch}</strong>&quot;.
            </p>
            <p>Tente um nome diferente ou entre em contato diretamente com as unidades.</p>
          </div>
        )}

        {foundKey && (
          <>
            <h2 className="med-result-title">
              📋 Resultados para: <em>{foundKey.charAt(0).toUpperCase() + foundKey.slice(1)}</em>
            </h2>
            <div className="med-cards">
              {medsDatabase[foundKey].map((u, i) => (
                <div
                  key={i}
                  className={`med-card ${
                    u.disponivel ? 'med-card--available' : 'med-card--unavailable'
                  }`}
                >
                  <div className="med-card__status">
                    {u.disponivel ? '✅ Disponível' : '❌ Sem estoque'}
                  </div>
                  <h3 className="med-card__unit">{u.unidade}</h3>
                  <p className={`med-card__badge ${u.tipo === 'sus' ? 'badge--sus' : 'badge--private'}`}>
                    {u.tipo === 'sus' ? '🏥 SUS / Gratuito' : '💳 Particular/Convênio'}
                  </p>
                  <p className="med-card__updated">🕐 Atualizado em: {u.atualizado}</p>
                </div>
              ))}
            </div>
            <p className="med-disclaimer">
              ℹ️ As informações de estoque são atualizadas pelos atendentes das unidades. Confirme
              disponibilidade por telefone antes de se deslocar.
            </p>
          </>
        )}
      </div>
    </main>
  );
}
