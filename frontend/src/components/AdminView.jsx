import { useState, useEffect, useCallback } from 'react'
import { listarAvaliacoes, moderarAvaliacao, cadastrarNovaUnidade } from '../servicos/apiCliente'

export default function AdminView() {
  const [tab, setTab] = useState('avaliacoes') // 'avaliacoes' | 'nova-unidade'
  const [avaliacoes, setAvaliacoes] = useState([])
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState(null)

  // Formulário Nova Unidade
  const [nome, setNome] = useState('')
  const [tipo, setTipo] = useState('hospital')
  const [cidade, setCidade] = useState('Barra do Garças')
  const [atend, setAtend] = useState('particular')
  const [address, setAddress] = useState('')
  const [hours, setHours] = useState('Seg–Sex: 07h–18h | Sáb: 07h–12h')
  const [convenios, setConvenios] = useState('Particular, Unimed')
  const [especialidades, setEspecialidades] = useState('Clínica Geral, Pediatria')
  const [phone, setPhone] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [mapsUrl, setMapsUrl] = useState('')

  const carregarAvaliacoes = useCallback(async () => {
    setLoading(true)
    const res = await listarAvaliacoes(null, 'todos')
    if (res.ok && res.avaliacoes) {
      setAvaliacoes(res.avaliacoes)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (tab === 'avaliacoes') {
      carregarAvaliacoes()
    }
  }, [tab, carregarAvaliacoes])

  const handleModerar = async (id, status) => {
    setMsg(null)
    const res = await moderarAvaliacao(id, status)
    if (res.ok) {
      setMsg({ tipo: 'sucesso', texto: `Avaliação #${id} atualizada para '${status}'.` })
      carregarAvaliacoes()
    } else {
      setMsg({ tipo: 'erro', texto: res.erro || 'Falha na moderação.' })
    }
  }

  const handleCadastrarUnidade = async (e) => {
    e.preventDefault()
    setMsg(null)

    if (!nome || !address || !phone || !especialidades) {
      setMsg({ tipo: 'erro', texto: 'Preencha todos os campos obrigatórios.' })
      return
    }

    setLoading(true)
    const res = await cadastrarNovaUnidade({
      nome,
      tipo,
      cidade,
      atend,
      address,
      hours,
      convenios,
      especialidades,
      phone,
      whatsapp,
      maps_url: mapsUrl,
    })

    if (res.ok) {
      setMsg({ tipo: 'sucesso', texto: `Unidade '${nome}' cadastrada com sucesso!` })
      setNome('')
      setAddress('')
      setPhone('')
      setWhatsapp('')
      setMapsUrl('')
    } else {
      setMsg({ tipo: 'erro', texto: res.erro || 'Erro ao cadastrar unidade.' })
    }
    setLoading(false)
  }

  return (
    <div className="admin-page-container">
      <div className="page-header-banner">
        <h2>Painel de Gestão e Moderação</h2>
        <p>Moderação de avaliações comunitárias e cadastro de novos estabelecimentos.</p>
      </div>

      <div className="schedule-tabs-bar">
        <button
          type="button"
          className={`tab-btn ${tab === 'avaliacoes' ? 'active' : ''}`}
          onClick={() => setTab('avaliacoes')}
        >
          Moderação de Avaliações
        </button>
        <button
          type="button"
          className={`tab-btn ${tab === 'nova-unidade' ? 'active' : ''}`}
          onClick={() => setTab('nova-unidade')}
        >
          Cadastrar Novo Estabelecimento
        </button>
      </div>

      {msg && (
        <div role="alert" className={`alert-box alert-box--${msg.tipo}`} style={{ maxWidth: '900px', margin: '0 auto 20px' }}>
          {msg.texto}
        </div>
      )}

      {tab === 'avaliacoes' ? (
        <section className="admin-moderation-section">
          <h3>Avaliações Registradas:</h3>
          {loading ? (
            <div className="loading-state">
              <div className="spinner" />
              <p>Carregando avaliações...</p>
            </div>
          ) : avaliacoes.length === 0 ? (
            <div className="empty-results-box">
              <h3>Nenhuma avaliação registrada</h3>
            </div>
          ) : (
            <div className="moderation-grid">
              {avaliacoes.map((av) => (
                <div key={av.id} className={`moderation-card moderation-card--${av.status}`}>
                  <div className="mod-card-header">
                    <div>
                      <strong>{av.unidade_nome || av.unidade_id}</strong>
                      <span className="mod-author">por {av.autor_nome || av.usuario_nome || 'Usuário'}</span>
                    </div>
                    <span className={`status-pill status-pill--${av.status}`}>
                      {av.status === 'aprovado' ? 'Aprovada' : av.status === 'rejeitado' ? 'Oculta' : 'Pendente'}
                    </span>
                  </div>

                  <div className="mod-rating-stars">
                    Nota: {av.nota}/5
                  </div>

                  <p className="mod-comment">"{av.comentario || 'Sem comentário por escrito.'}"</p>

                  <div className="mod-actions-row">
                    {av.status !== 'aprovado' && (
                      <button
                        type="button"
                        className="btn-approve"
                        onClick={() => handleModerar(av.id, 'aprovado')}
                      >
                        Aprovar
                      </button>
                    )}
                    {av.status !== 'rejeitado' && (
                      <button
                        type="button"
                        className="btn-reject"
                        onClick={() => handleModerar(av.id, 'rejeitado')}
                      >
                        Ocultar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      ) : (
        <section className="booking-card" style={{ maxWidth: '850px', margin: '0 auto' }}>
          <h3>Cadastrar Estabelecimento de Saúde</h3>
          <p style={{ color: '#4a5568', marginBottom: '20px' }}>
            Adicione hospitais, clínicas ou laboratórios para inclusão no catálogo.
          </p>

          <form onSubmit={handleCadastrarUnidade} className="booking-form">
            <div className="form-grid-2">
              <div className="form-group">
                <label>Nome do Estabelecimento: <span className="req">*</span></label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Nome do hospital ou clínica"
                  required
                />
              </div>

              <div className="form-group">
                <label>Tipo de Unidade:</label>
                <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
                  <option value="hospital">Hospital</option>
                  <option value="clinica">Clínica Médica</option>
                  <option value="laboratorio">Laboratório</option>
                  <option value="ubs">UBS / UPA</option>
                </select>
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label>Cidade:</label>
                <select value={cidade} onChange={(e) => setCidade(e.target.value)}>
                  <option value="Barra do Garças">Barra do Garças (MT)</option>
                  <option value="Pontal do Araguaia">Pontal do Araguaia (MT)</option>
                  <option value="Aragarças">Aragarças (GO)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Atendimento:</label>
                <select value={atend} onChange={(e) => setAtend(e.target.value)}>
                  <option value="sus">SUS</option>
                  <option value="particular">Particular</option>
                  <option value="convenio">Convênios</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Endereço Completo: <span className="req">*</span></label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Logradouro, número, bairro"
                required
              />
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label>Telefone Principal: <span className="req">*</span></label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(66) 3401-0000"
                  required
                />
              </div>

              <div className="form-group">
                <label>WhatsApp:</label>
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="(66) 99999-0000"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Especialidades Atendidas: <span className="req">*</span></label>
              <input
                type="text"
                value={especialidades}
                onChange={(e) => setEspecialidades(e.target.value)}
                placeholder="Ex: Cardiologia, Pediatria, Ortopedia"
                required
              />
            </div>

            <div className="form-group">
              <label>Convênios Aceitos:</label>
              <input
                type="text"
                value={convenios}
                onChange={(e) => setConvenios(e.target.value)}
                placeholder="Ex: Unimed, Cassi, Bradesco Saúde"
              />
            </div>

            <div className="form-group">
              <label>Link do Google Maps (opcional):</label>
              <input
                type="url"
                value={mapsUrl}
                onChange={(e) => setMapsUrl(e.target.value)}
                placeholder="https://maps.google.com/..."
              />
            </div>

            <button type="submit" className="btn-submit-booking" disabled={loading}>
              {loading ? 'Salvando...' : 'Cadastrar Estabelecimento'}
            </button>
          </form>
        </section>
      )}
    </div>
  )
}
