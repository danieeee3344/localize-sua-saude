import { useState, useEffect, useCallback } from 'react'
import { buscarUnidades, obterUnidade, enviarAvaliacao } from '../servicos/apiCliente'
import MapaUnidades from './MapaUnidades'

export default function UnidadesView({ initialFilters = {}, onNavigateAgendamento }) {
  const [unidades, setUnidades] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(initialFilters.q || '')
  const [city, setCity] = useState(initialFilters.cidade || '')
  const [type, setType] = useState(initialFilters.tipo || '')
  const [atend, setAtend] = useState(initialFilters.atendimento || '')
  const [especialidade, setEspecialidade] = useState(initialFilters.especialidade || '')
  const [sort, setSort] = useState('rating')
  const [mostrarMapa, setMostrarMapa] = useState(true)
  const [selectedMapUnitId, setSelectedMapUnitId] = useState(null)

  // Modal de Avaliações
  const [unidadeModal, setUnidadeModal] = useState(null)
  const [notaAvaliacao, setNotaAvaliacao] = useState(5)
  const [comentarioAvaliacao, setComentarioAvaliacao] = useState('')
  const [enviandoAvaliacao, setEnviandoAvaliacao] = useState(false)
  const [msgAvaliacao, setMsgAvaliacao] = useState(null)

  const carregarUnidades = useCallback(async () => {
    setLoading(true)
    const res = await buscarUnidades({
      q: search,
      cidade: city,
      tipo: type,
      atendimento: atend,
      especialidade,
      ordenar: sort,
    })
    if (res.ok && res.unidades) {
      setUnidades(res.unidades)
    } else {
      setUnidades([])
    }
    setLoading(false)
  }, [search, city, type, atend, especialidade, sort])

  useEffect(() => {
    carregarUnidades()
  }, [carregarUnidades])

  const abrirModalAvaliacoes = async (u) => {
    setMsgAvaliacao(null)
    setComentarioAvaliacao('')
    setNotaAvaliacao(5)
    setUnidadeModal(u)
    const res = await obterUnidade(u.id)
    if (res.ok && res.unidade) {
      setUnidadeModal(res.unidade)
    }
  }

  const handleSubmeterAvaliacao = async (e) => {
    e.preventDefault()
    const logged = localStorage.getItem('loggedIn') === 'true'
    const userId = localStorage.getItem('userId')

    if (!logged || !userId) {
      setMsgAvaliacao({
        tipo: 'erro',
        texto: 'Para avaliar este estabelecimento é necessário estar conectado com sua conta.',
      })
      return
    }

    setEnviandoAvaliacao(true)
    setMsgAvaliacao(null)

    const res = await enviarAvaliacao({
      usuarioId: Number(userId),
      unidadeId: unidadeModal.id,
      nota: notaAvaliacao,
      comentario: comentarioAvaliacao,
    })

    if (res.ok) {
      setMsgAvaliacao({
        tipo: 'sucesso',
        texto: 'Sua avaliação foi registrada com sucesso!',
      })
      setComentarioAvaliacao('')
      const resAtualizada = await obterUnidade(unidadeModal.id)
      if (resAtualizada.ok) {
        setUnidadeModal(resAtualizada.unidade)
      }
      carregarUnidades()
    } else {
      setMsgAvaliacao({
        tipo: 'erro',
        texto: res.erro || 'Falha ao registrar avaliação.',
      })
    }
    setEnviandoAvaliacao(false)
  }

  const renderEstrelas = (nota) => {
    const estrelas = []
    const notaArredondada = Math.round(nota || 0)
    for (let i = 1; i <= 5; i++) {
      estrelas.push(
        <span key={i} className={i <= notaArredondada ? 'star-filled' : 'star-empty'}>
          ★
        </span>
      )
    }
    return estrelas
  }

  const handleFocarNoMapa = (unitId) => {
    setSelectedMapUnitId(unitId)
    if (!mostrarMapa) setMostrarMapa(true)
    const el = document.getElementById('mapa-regional-container')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="unidades-page-container">
      <div className="page-header-banner">
        <h2>Unidades de Saúde no Vale do Araguaia</h2>
        <p>Hospitais, Clínicas, Laboratórios e Unidades Básicas de Saúde</p>
      </div>

      {/* Controles de Filtros e Busca Rápida */}
      <div className="unidades-filters-panel">
        <div className="search-bar-unified">
          <input
            type="search"
            placeholder="Filtrar por nome ou especialidade..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Filtrar unidades de saúde"
          />
        </div>

        <div className="filters-grid">
          <div className="filter-item">
            <label htmlFor="filter-cidade-local">Cidade</label>
            <select
              id="filter-cidade-local"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            >
              <option value="">Todas as cidades</option>
              <option value="Barra do Garças">Barra do Garças (MT)</option>
              <option value="Pontal do Araguaia">Pontal do Araguaia (MT)</option>
              <option value="Aragarças">Aragarças (GO)</option>
            </select>
          </div>

          <div className="filter-item">
            <label htmlFor="filter-tipo-local">Tipo</label>
            <select
              id="filter-tipo-local"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="">Todos os tipos</option>
              <option value="hospital">Hospitais</option>
              <option value="ubs">UBS / UPA</option>
              <option value="clinica">Clínicas</option>
              <option value="laboratorio">Laboratórios</option>
            </select>
          </div>

          <div className="filter-item">
            <label htmlFor="filter-atend-local">Atendimento</label>
            <select
              id="filter-atend-local"
              value={atend}
              onChange={(e) => setAtend(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="sus">SUS</option>
              <option value="particular">Particular</option>
              <option value="convenio">Convênios</option>
            </select>
          </div>

          <div className="filter-item">
            <label htmlFor="filter-ordenar">Ordenar por</label>
            <select
              id="filter-ordenar"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="rating">Avaliação</option>
              <option value="nome">Nome (A - Z)</option>
            </select>
          </div>
        </div>

        <div className="map-toggle-bar">
          <button
            type="button"
            className={`btn-toggle-map ${mostrarMapa ? 'active' : ''}`}
            onClick={() => setMostrarMapa(!mostrarMapa)}
          >
            {mostrarMapa ? 'Ocultar Mapa' : 'Exibir Mapa Interativo'}
          </button>
          <span className="results-count">
            Total de unidades: <strong>{unidades.length}</strong>
          </span>
        </div>
      </div>

      {/* Mapa Interativo Preciso com Leaflet */}
      {mostrarMapa && (
        <section id="mapa-regional-container" className="interactive-map-wrapper" aria-label="Mapa interativo de unidades">
          <div className="map-notice">
            <span>Localização das unidades em Barra do Garças (MT), Pontal do Araguaia (MT) e Aragarças (GO):</span>
          </div>
          <MapaUnidades
            unidades={unidades}
            selectedUnitId={selectedMapUnitId}
            onSelectUnit={(u) => setSelectedMapUnitId(u.id)}
          />
        </section>
      )}

      {/* Grid de Cards de Unidades de Saúde */}
      <section className="hospitals-grid" aria-label="Lista de unidades de saúde">
        {loading ? (
          <div className="loading-state">
            <div className="spinner" />
            <p>Carregando unidades de saúde...</p>
          </div>
        ) : unidades.length === 0 ? (
          <div className="empty-results-box">
            <h3>Nenhuma unidade encontrada</h3>
            <p>Ajuste os filtros de busca para visualizar outros estabelecimentos.</p>
            <button
              type="button"
              className="btn-cep"
              onClick={() => {
                setSearch('')
                setCity('')
                setType('')
                setAtend('')
                setEspecialidade('')
              }}
            >
              Limpar filtros
            </button>
          </div>
        ) : (
          unidades.map((u) => (
            <article key={u.id} className="hospital-card" id={`card-${u.id}`}>
              <div className="hospital-card__img-container">
                <img
                  src={u.image || '/logomarca.png'}
                  alt={`Unidade ${u.nome}`}
                  className="hospital-card__img"
                  onError={(e) => {
                    e.target.src = '/logomarca.png'
                  }}
                />
                <span className={`badge-atend badge-atend--${u.atend}`}>
                  {u.atend === 'sus' ? 'SUS' : u.atend === 'particular' ? 'Particular' : 'Convênio'}
                </span>
                <span className="badge-city">{u.cidade}</span>
              </div>

              <div className="hospital-card__content">
                <div className="hospital-card__header">
                  <h3 className="hospital-title">{u.nome}</h3>
                  <div className="hospital-rating" title={`Nota: ${u.rating} de 5`}>
                    <div className="stars-box">{renderEstrelas(u.rating)}</div>
                    <span className="rating-number">{u.rating ? u.rating.toFixed(1) : '5.0'}</span>
                    <span className="rating-count">({u.rating_count || 0})</span>
                  </div>
                </div>

                <div className="hospital-info-list">
                  <div className="info-row">
                    <span className="info-label">Endereço:</span>
                    <span className="info-text">{u.address}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Horários:</span>
                    <span className="info-text">{u.hours}</span>
                  </div>
                  {u.convenios && (
                    <div className="info-row">
                      <span className="info-label">Convênios:</span>
                      <span className="info-text">{u.convenios}</span>
                    </div>
                  )}
                  <div className="info-row">
                    <span className="info-label">Especialidades:</span>
                    <span className="info-text">{u.especialidades}</span>
                  </div>
                </div>

                {/* Botões de Ação Rápida */}
                <div className="hospital-actions-grid">
                  <a
                    href={`tel:${u.phone.replace(/\D/g, '')}`}
                    className="btn-action btn-action--phone"
                    title={`Ligar para ${u.nome}`}
                  >
                    Ligar
                  </a>

                  {u.whatsapp && (
                    <a
                      href={`https://wa.me/${u.whatsapp.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-action btn-action--whatsapp"
                      title="Contato via WhatsApp"
                    >
                      WhatsApp
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => handleFocarNoMapa(u.id)}
                    className="btn-action btn-action--maps"
                    title="Ver no mapa"
                  >
                    Ver no Mapa
                  </button>

                  {onNavigateAgendamento && (
                    <button
                      type="button"
                      onClick={() => onNavigateAgendamento(u)}
                      className="btn-action btn-action--schedule"
                    >
                      Agendar
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => abrirModalAvaliacoes(u)}
                    className="btn-action btn-action--reviews"
                  >
                    Avaliações ({u.rating_count || 0})
                  </button>
                </div>
              </div>
            </article>
          ))
        )}
      </section>

      {/* Modal de Avaliações */}
      {unidadeModal && (
        <div className="modal-overlay" onClick={() => setUnidadeModal(null)} role="dialog" aria-modal="true">
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>Avaliações — {unidadeModal.nome}</h3>
                <p className="modal-subtitle">
                  Média: {unidadeModal.rating?.toFixed(1) || '5.0'} ({unidadeModal.rating_count || 0} avaliações)
                </p>
              </div>
              <button
                type="button"
                className="btn-close-modal"
                onClick={() => setUnidadeModal(null)}
                aria-label="Fechar janela"
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="new-review-box">
                <h4>Registrar avaliação</h4>
                {msgAvaliacao && (
                  <div
                    role="alert"
                    className={`alert-box alert-box--${msgAvaliacao.tipo}`}
                  >
                    {msgAvaliacao.texto}
                  </div>
                )}
                <form onSubmit={handleSubmeterAvaliacao}>
                  <div className="star-picker-row">
                    <label>Nota:</label>
                    <div className="star-picker-buttons">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          className={`btn-star-pick ${notaAvaliacao >= n ? 'active' : ''}`}
                          onClick={() => setNotaAvaliacao(n)}
                          title={`${n} estrelas`}
                        >
                          ★
                        </button>
                      ))}
                      <span className="nota-selecionada-text">{notaAvaliacao} de 5</span>
                    </div>
                  </div>

                  <div className="review-textarea-group">
                    <label htmlFor="comentario-input">Comentário (opcional):</label>
                    <textarea
                      id="comentario-input"
                      rows={3}
                      placeholder="Descreva sua experiência sobre o atendimento recebido..."
                      value={comentarioAvaliacao}
                      onChange={(e) => setComentarioAvaliacao(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-submit-review"
                    disabled={enviandoAvaliacao}
                  >
                    {enviandoAvaliacao ? 'Enviando...' : 'Publicar Avaliação'}
                  </button>
                </form>
              </div>

              <div className="past-reviews-list">
                <h4>Feedbacks recentes:</h4>
                {!unidadeModal.avaliacoes || unidadeModal.avaliacoes.length === 0 ? (
                  <p className="no-reviews-text">
                    Nenhuma avaliação registrada até o momento.
                  </p>
                ) : (
                  unidadeModal.avaliacoes.map((av) => (
                    <div key={av.id} className="review-item-card">
                      <div className="review-item-header">
                        <div className="review-author-info">
                          <strong>{av.autor_nome || av.usuario_nome || 'Usuário'}</strong>
                        </div>
                        <div className="stars-box">{renderEstrelas(av.nota)}</div>
                      </div>
                      {av.comentario && <p className="review-comment-text">{av.comentario}</p>}
                      <span className="review-date-text">
                        {av.criado_em ? new Date(av.criado_em).toLocaleDateString('pt-BR') : 'Recente'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
