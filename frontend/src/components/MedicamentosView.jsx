import { useState, useEffect, useCallback } from 'react'
import { buscarMedicamentos } from '../servicos/apiCliente'

export default function MedicamentosView() {
  const [query, setQuery] = useState('')
  const [cidade, setCidade] = useState('')
  const [apenasDisponiveis, setApenasDisponiveis] = useState(false)
  const [medicamentos, setMedicamentos] = useState([])
  const [loading, setLoading] = useState(false)
  const [termoPesquisado, setTermoPesquisado] = useState('')

  const chipsComuns = [
    'Dipirona',
    'Amoxicilina',
    'Losartana',
    'Metformina',
    'Omeprazol',
    'Paracetamol',
    'Ibuprofeno',
    'Azitromicina',
  ]

  const executarBusca = useCallback(
    async (termo = query) => {
      setLoading(true)
      setTermoPesquisado(termo)
      const res = await buscarMedicamentos({
        q: termo,
        cidade,
        apenasDisponiveis,
      })
      if (res.ok && res.medicamentos) {
        setMedicamentos(res.medicamentos)
      } else {
        setMedicamentos([])
      }
      setLoading(false)
    },
    [query, cidade, apenasDisponiveis]
  )

  useEffect(() => {
    executarBusca('')
  }, [cidade, apenasDisponiveis, executarBusca])

  const handleChipClick = (nome) => {
    setQuery(nome)
    executarBusca(nome)
  }

  return (
    <div className="medicamentos-page-container">
      <div className="page-header-banner">
        <h2>Consulta e Disponibilidade de Medicamentos</h2>
        <p>Verifique o estoque de medicamentos nas unidades de saúde e farmácias da região.</p>
      </div>

      <section className="meds-search-box-card" aria-label="Formulário de busca de medicamentos">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            executarBusca(query)
          }}
          className="meds-search-form"
        >
          <div className="meds-input-row">
            <input
              type="search"
              id="med-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Digite o nome do medicamento ou princípio ativo..."
              aria-label="Nome do medicamento"
              autoComplete="off"
            />
            <button type="submit" className="btn-search" id="btn-buscar-med">
              Consultar Estoque
            </button>
          </div>

          <div className="meds-filters-row">
            <div className="filter-group-inline">
              <label htmlFor="med-cidade-select">Cidade:</label>
              <select
                id="med-cidade-select"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
              >
                <option value="">Todas as cidades</option>
                <option value="Barra do Garças">Barra do Garças (MT)</option>
                <option value="Pontal do Araguaia">Pontal do Araguaia (MT)</option>
                <option value="Aragarças">Aragarças (GO)</option>
              </select>
            </div>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={apenasDisponiveis}
                onChange={(e) => setApenasDisponiveis(e.target.checked)}
              />
              <span>Apenas com estoque disponível</span>
            </label>
          </div>

          <div className="med-suggestions" aria-label="Sugestões de medicamentos">
            <span>Buscas frequentes:</span>
            {chipsComuns.map((med) => (
              <button
                key={med}
                type="button"
                onClick={() => handleChipClick(med)}
                className={`chip ${query.toLowerCase().includes(med.toLowerCase()) ? 'chip--active' : ''}`}
              >
                {med}
              </button>
            ))}
          </div>
        </form>
      </section>

      {/* Resultados da Pesquisa de Medicamentos */}
      <section
        className="med-results-container"
        role="region"
        aria-live="polite"
        aria-label="Resultados de estoque de medicamentos"
      >
        {loading ? (
          <div className="loading-state">
            <div className="spinner" />
            <p>Consultando disponibilidade nas unidades...</p>
          </div>
        ) : medicamentos.length === 0 ? (
          <div className="empty-results-box">
            <h3>Nenhum medicamento encontrado para "{termoPesquisado || query}"</h3>
            <p>Verifique a ortografia ou tente pesquisar pelo princípio ativo.</p>
          </div>
        ) : (
          <div className="med-cards-grid">
            {medicamentos.map((m) => (
              <div key={m.id} className="med-card">
                <div className="med-card-header">
                  <div className="med-title-group">
                    <div>
                      <h3>{m.nome}</h3>
                      <span className="med-category">{m.categoria || 'Medicamento'}</span>
                      {m.principio_ativo && (
                        <span className="med-active-ingredient">
                          Princípio ativo: {m.principio_ativo}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="med-stock-list">
                  <h4>Disponibilidade na rede de atendimento:</h4>
                  {m.estoques && m.estoques.length > 0 ? (
                    <div className="stock-table-wrapper">
                      <table className="stock-table">
                        <thead>
                          <tr>
                            <th>Unidade de Saúde</th>
                            <th>Cidade</th>
                            <th>Atendimento</th>
                            <th>Status</th>
                            <th>Contato</th>
                          </tr>
                        </thead>
                        <tbody>
                          {m.estoques.map((e) => (
                            <tr key={e.id} className={e.disponivel ? 'row-available' : 'row-unavailable'}>
                              <td>
                                <strong>{e.unidade_nome}</strong>
                                <small className="unit-address-sub">{e.address}</small>
                              </td>
                              <td>{e.cidade}</td>
                              <td>
                                <span className={`pill-type pill-type--${e.tipo}`}>
                                  {e.tipo === 'sus' ? 'SUS' : 'Particular'}
                                </span>
                              </td>
                              <td>
                                <span className={`stock-status-badge stock-status-badge--${e.disponivel ? (e.qtd === 'Baixo estoque' ? 'low' : 'ok') : 'out'}`}>
                                  {e.disponivel ? (e.qtd === 'Baixo estoque' ? 'Baixo estoque' : 'Disponível') : 'Sem estoque'}
                                </span>
                              </td>
                              <td>
                                {e.phone && (
                                  <a
                                    href={`tel:${e.phone.replace(/\D/g, '')}`}
                                    className="btn-call-small"
                                    title={`Ligar para ${e.unidade_nome}`}
                                  >
                                    Ligar
                                  </a>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="no-stock-notice">
                      Nenhuma unidade registrou estoque para os filtros selecionados.
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
