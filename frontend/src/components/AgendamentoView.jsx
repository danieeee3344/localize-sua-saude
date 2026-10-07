import { useState, useEffect, useCallback } from 'react'
import { listarAgendamentos, criarAgendamento, cancelarAgendamento, buscarUnidades } from '../servicos/apiCliente'

const horariosPadrao = [
  '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
]

export default function AgendamentoView({ preselectedUnit, onNavigateLogin }) {
  const [activeTab, setActiveTab] = useState('novo') // 'novo' | 'meus'
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [usuarioId, setUsuarioId] = useState(null)
  const [usuarioNome, setUsuarioNome] = useState('')

  // Form State
  const [unidadesList, setUnidadesList] = useState([])
  const [unidade, setUnidade] = useState(preselectedUnit ? preselectedUnit.nome : '')
  const [especialidade, setEspecialidade] = useState('')
  const [data, setData] = useState('')
  const [horario, setHorario] = useState('')
  const [paciente, setPaciente] = useState('')
  const [cpf, setCpf] = useState('')
  const [telefone, setTelefone] = useState('')
  const [observacoes, setObservacoes] = useState('')

  // Status & Feedback
  const [loading, setLoading] = useState(false)
  const [agendamentos, setAgendamentos] = useState([])
  const [msgFeedback, setMsgFeedback] = useState(null)

  const hoje = new Date().toISOString().split('T')[0]

  useEffect(() => {
    const logged = localStorage.getItem('loggedIn') === 'true'
    const uid = localStorage.getItem('userId')
    const unome = localStorage.getItem('userName')
    setIsLoggedIn(logged)
    setUsuarioId(uid)
    setUsuarioNome(unome || '')

    if (unome && !paciente) {
      setPaciente(unome)
    }

    buscarUnidades().then((res) => {
      if (res.ok && res.unidades) {
        setUnidadesList(res.unidades)
      }
    })
  }, [paciente])

  const carregarMeusAgendamentos = useCallback(async () => {
    const uid = localStorage.getItem('userId')
    if (!uid) return
    setLoading(true)
    const res = await listarAgendamentos(uid)
    if (res.ok && res.agendamentos) {
      setAgendamentos(res.agendamentos)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (activeTab === 'meus' && isLoggedIn) {
      carregarMeusAgendamentos()
    }
  }, [activeTab, isLoggedIn, carregarMeusAgendamentos])

  const handleCpfMask = (e) => {
    let v = e.target.value.replace(/\D/g, '')
    if (v.length > 11) v = v.slice(0, 11)
    if (v.length > 9) v = v.replace(/^(\d{3})(\d{3})(\d{3})(\d{1,2})$/, '$1.$2.$3-$4')
    else if (v.length > 6) v = v.replace(/^(\d{3})(\d{3})(\d{1,3})$/, '$1.$2.$3')
    else if (v.length > 3) v = v.replace(/^(\d{3})(\d{1,3})$/, '$1.$2')
    setCpf(v)
  }

  const handlePhoneMask = (e) => {
    let v = e.target.value.replace(/\D/g, '')
    if (v.length > 11) v = v.slice(0, 11)
    if (v.length > 10) v = v.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3')
    else if (v.length > 6) v = v.replace(/^(\d{2})(\d{4})(\d{0,4})$/, '($1) $2-$3')
    else if (v.length > 2) v = v.replace(/^(\d{2})(\d{0,5})$/, '($1) $2')
    setTelefone(v)
  }

  const handleSchedule = async (e) => {
    e.preventDefault()
    setMsgFeedback(null)

    if (!isLoggedIn || !usuarioId) {
      setMsgFeedback({
        tipo: 'erro',
        texto: 'É necessário estar conectado com sua conta para confirmar um agendamento.',
      })
      return
    }

    if (!unidade || !especialidade || !data || !horario || !paciente) {
      setMsgFeedback({
        tipo: 'erro',
        texto: 'Preencha todos os campos obrigatórios: Unidade, Especialidade, Data, Horário e Nome do Paciente.',
      })
      return
    }

    setLoading(true)

    const res = await criarAgendamento({
      usuarioId: Number(usuarioId),
      unidade,
      especialidade,
      data,
      horario,
      paciente,
      cpf,
      telefone,
      observacoes,
    })

    if (res.ok) {
      setMsgFeedback({
        tipo: 'sucesso',
        texto: `Consulta confirmada com sucesso para ${data} às ${horario} na unidade ${unidade}.`,
      })
      setObservacoes('')
      setHorario('')
      setActiveTab('meus')
      carregarMeusAgendamentos()
    } else {
      setMsgFeedback({
        tipo: 'erro',
        texto: res.erro || 'Falha ao agendar consulta. Tente novamente.',
      })
    }
    setLoading(false)
  }

  const handleCancelar = async (agendamentoId) => {
    if (!window.confirm('Tem certeza de que deseja cancelar esta consulta?')) return

    setLoading(true)
    const res = await cancelarAgendamento(agendamentoId, Number(usuarioId))
    if (res.ok) {
      setMsgFeedback({
        tipo: 'sucesso',
        texto: 'Consulta cancelada com sucesso.',
      })
      carregarMeusAgendamentos()
    } else {
      setMsgFeedback({
        tipo: 'erro',
        texto: res.erro || 'Falha ao cancelar consulta.',
      })
    }
    setLoading(false)
  }

  return (
    <div className="agendamento-page-container">
      <div className="page-header-banner">
        <h2>Agendamento de Consultas</h2>
        <p>Marque seu atendimento nas unidades de saúde parceiras da região.</p>
      </div>

      {!isLoggedIn && (
        <div className="auth-alert-banner">
          <p>Para agendar ou visualizar suas consultas, acesse sua conta.</p>
          <button
            type="button"
            className="btn-login-now"
            onClick={onNavigateLogin}
          >
            Acessar Conta
          </button>
        </div>
      )}

      {/* Navegação de Abas */}
      <div className="schedule-tabs-bar">
        <button
          type="button"
          className={`tab-btn ${activeTab === 'novo' ? 'active' : ''}`}
          onClick={() => setActiveTab('novo')}
        >
          Novo Agendamento
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'meus' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('meus')
            carregarMeusAgendamentos()
          }}
        >
          Meus Agendamentos {isLoggedIn && agendamentos.length > 0 ? `(${agendamentos.length})` : ''}
        </button>
      </div>

      {msgFeedback && (
        <div
          role="alert"
          className={`alert-box alert-box--${msgFeedback.tipo}`}
          style={{ maxWidth: '800px', margin: '0 auto 20px' }}
        >
          {msgFeedback.texto}
        </div>
      )}

      {activeTab === 'novo' ? (
        <section className="booking-card" aria-label="Formulário de agendamento">
          <form onSubmit={handleSchedule} className="booking-form">
            <div className="form-grid-2">
              <div className="form-group">
                <label htmlFor="unidade-select">
                  Unidade de Saúde: <span className="req">*</span>
                </label>
                <select
                  id="unidade-select"
                  value={unidade}
                  onChange={(e) => setUnidade(e.target.value)}
                  required
                >
                  <option value="">Selecione o estabelecimento...</option>
                  {unidadesList.map((u) => (
                    <option key={u.id} value={u.nome}>
                      {u.nome} ({u.cidade})
                    </option>
                  ))}
                  {unidadesList.length === 0 && (
                    <>
                      <option value="Hospital e Maternidade Medbarra">Hospital e Maternidade Medbarra (Barra do Garças)</option>
                      <option value="UPA 24h Barra do Garças">UPA 24h Barra do Garças</option>
                      <option value="Hospital Cristo Redentor">Hospital Cristo Redentor (Barra do Garças)</option>
                      <option value="UBS Dr. José Pontal">UBS Dr. José Pontal (Pontal do Araguaia)</option>
                      <option value="Clínica Médica São Lucas">Clínica Médica São Lucas (Aragarças)</option>
                    </>
                  )}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="especialidade-select">
                  Especialidade: <span className="req">*</span>
                </label>
                <select
                  id="especialidade-select"
                  value={especialidade}
                  onChange={(e) => setEspecialidade(e.target.value)}
                  required
                >
                  <option value="">Selecione a especialidade...</option>
                  <option value="Clínica Geral">Clínica Geral</option>
                  <option value="Cardiologia">Cardiologia</option>
                  <option value="Ortopedia">Ortopedia</option>
                  <option value="Pediatria">Pediatria</option>
                  <option value="Ginecologia">Ginecologia</option>
                  <option value="Neurologia">Neurologia</option>
                  <option value="Cirurgia Geral">Cirurgia Geral</option>
                  <option value="Exames Laboratoriais">Exames Laboratoriais</option>
                </select>
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label htmlFor="data-input">
                  Data: <span className="req">*</span>
                </label>
                <input
                  type="date"
                  id="data-input"
                  min={hoje}
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="horario-select">
                  Horário: <span className="req">*</span>
                </label>
                <select
                  id="horario-select"
                  value={horario}
                  onChange={(e) => setHorario(e.target.value)}
                  required
                >
                  <option value="">Selecione o horário...</option>
                  {horariosPadrao.map((h) => (
                    <option key={h} value={h}>
                      {h} horas
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-grid-3">
              <div className="form-group">
                <label htmlFor="paciente-input">
                  Nome do Paciente: <span className="req">*</span>
                </label>
                <input
                  type="text"
                  id="paciente-input"
                  value={paciente}
                  onChange={(e) => setPaciente(e.target.value)}
                  placeholder="Nome do paciente"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="cpf-input">CPF do Paciente:</label>
                <input
                  type="text"
                  id="cpf-input"
                  value={cpf}
                  onChange={handleCpfMask}
                  placeholder="000.000.000-00"
                  maxLength={14}
                />
              </div>

              <div className="form-group">
                <label htmlFor="telefone-input">Telefone / WhatsApp:</label>
                <input
                  type="tel"
                  id="telefone-input"
                  value={telefone}
                  onChange={handlePhoneMask}
                  placeholder="(66) 99999-0000"
                  maxLength={15}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="observacoes-input">Observações (opcional):</label>
              <textarea
                id="observacoes-input"
                rows={2}
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Informe observações relevantes ou histórico do paciente..."
              />
            </div>

            <button
              type="submit"
              className="btn-submit-booking"
              disabled={loading}
            >
              {loading ? 'Confirmando...' : 'Confirmar Agendamento'}
            </button>
          </form>
        </section>
      ) : (
        <section className="my-bookings-section" aria-label="Lista de agendamentos realizados">
          {!isLoggedIn ? (
            <div className="empty-results-box">
              <h3>Acesso restrito</h3>
              <p>Conecte-se para acompanhar suas consultas agendadas.</p>
              <button
                type="button"
                className="btn-login-now"
                onClick={onNavigateLogin}
              >
                Entrar
              </button>
            </div>
          ) : loading ? (
            <div className="loading-state">
              <div className="spinner" />
              <p>Buscando consultas agendadas...</p>
            </div>
          ) : agendamentos.length === 0 ? (
            <div className="empty-results-box">
              <h3>Nenhum agendamento ativo</h3>
              <p>Você ainda não possui consultas agendadas no sistema.</p>
              <button
                type="button"
                className="btn-cep"
                onClick={() => setActiveTab('novo')}
              >
                Agendar Consulta
              </button>
            </div>
          ) : (
            <div className="bookings-list-grid">
              {agendamentos.map((ag) => (
                <article key={ag.id} className={`booking-card-item booking-card-item--${ag.status}`}>
                  <div className="booking-card-item__header">
                    <div>
                      <span className={`status-pill status-pill--${ag.status}`}>
                        {ag.status === 'confirmado' ? 'Confirmado' : ag.status === 'cancelado' ? 'Cancelado' : 'Concluído'}
                      </span>
                      <h4>{ag.unidade}</h4>
                    </div>
                    <span className="booking-id-tag">Protocolo #{ag.id}</span>
                  </div>

                  <div className="booking-details-grid">
                    <div><strong>Especialidade:</strong> {ag.especialidade}</div>
                    <div><strong>Data:</strong> {ag.data}</div>
                    <div><strong>Horário:</strong> {ag.horario}h</div>
                    <div><strong>Paciente:</strong> {ag.paciente}</div>
                    {ag.telefone && <div><strong>Contato:</strong> {ag.telefone}</div>}
                    {ag.observacoes && <div><strong>Obs:</strong> {ag.observacoes}</div>}
                  </div>

                  {ag.status === 'confirmado' && (
                    <div className="booking-actions-row">
                      <button
                        type="button"
                        onClick={() => handleCancelar(ag.id)}
                        className="btn-cancel-booking"
                      >
                        Cancelar Agendamento
                      </button>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  )
}
