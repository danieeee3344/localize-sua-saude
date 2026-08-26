// ── Agendamento de Consulta (agendamento.html → React) ─────────────────────
// Segurança aplicada:
//  - RN02 reforçada na UI: sem sessão, o formulário não é exibido
//    (falha fechada, em vez de validar apenas no submit).
//  - Validação de CPF por dígitos verificadores (não apenas formato).
//  - Datas validadas contra relógio local; agendamentos vinculados à conta.
//  - "Meus agendamentos" mostra SOMENTE os da sessão atual.
//  - Todos os campos têm limite de tamanho; textos renderizados como texto.

import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAutenticacao } from '../contextos/AutenticacaoContexto'

const CHAVE_AGENDAMENTOS = 'lss_agendamentos'

const HORARIOS = {
  medbarra: ['08:00', '08:30', '09:00', '10:00', '10:30', '14:00', '14:30', '15:00', '16:00'],
  upa: [],
  cristo: ['07:00', '07:30', '08:00', '09:00', '11:00', '13:30', '14:00', '15:30', '16:30']
}

const OCUPADOS = {
  medbarra: ['09:00', '14:30'],
  cristo: ['08:00', '15:30']
}

const UNIDADES_ROTULO = {
  medbarra: 'Medbarra',
  upa: 'UPA 24h (Urgência – sem agendamento)',
  cristo: 'Hospital Cristo Redentor'
}

const ESPECIALIDADES = {
  clinico: 'Clínico Geral',
  cardiologia: 'Cardiologia',
  ortopedia: 'Ortopedia',
  pediatria: 'Pediatria',
  ginecologia: 'Ginecologia',
  neurologia: 'Neurologia'
}

function dataHoje() {
  const agora = new Date()
  const mes = String(agora.getMonth() + 1).padStart(2, '0')
  const dia = String(agora.getDate()).padStart(2, '0')
  return `${agora.getFullYear()}-${mes}-${dia}`
}

// Validação oficial de CPF (dígitos verificadores)
function cpfValido(cpf) {
  const d = String(cpf).replace(/\D/g, '')
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false
  const digito = (base) => {
    let soma = 0
    for (let i = 0; i < base - 1; i++) soma += Number(d[i]) * (base - i)
    const resto = (soma * 10) % 11 % 10
    return resto === Number(d[base - 1])
  }
  return digito(10) && digito(11)
}

function lerAgendamentos() {
  try {
    const lista = JSON.parse(localStorage.getItem(CHAVE_AGENDAMENTOS))
    return Array.isArray(lista) ? lista : []
  } catch {
    return []
  }
}

export default function Agendamento() {
  const { usuario } = useAutenticacao()
  const [unidade, setUnidade] = useState('')
  const [especialidade, setEspecialidade] = useState('')
  const [data, setData] = useState('')
  const [paciente, setPaciente] = useState('')
  const [cpf, setCpf] = useState('')
  const [telefone, setTelefone] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [horarioSelecionado, setHorarioSelecionado] = useState('')
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [versao, setVersao] = useState(0)

  const hoje = dataHoje()

  const horariosDisponiveis = useMemo(() => {
    if (!unidade || !data || unidade === 'upa') return []
    if (data < hoje) return []
    return (HORARIOS[unidade] || []).filter(h => !(OCUPADOS[unidade] || []).includes(h))
  }, [unidade, data, hoje])

  if (!usuario) {
    // RN02 — falha fechada: formulário só existe para usuários autenticados
    return (
      <main className="intro-section">
        <div id="intro">
          <h1>Agendamento de Consulta</h1>
          <p>Escolha a unidade, especialidade e horário disponível para agendar sua consulta. (US05)</p>
        </div>
        <div className="login-notice" role="alert">
          <span>⚠️ <strong>Atenção:</strong> Para agendar consultas você precisa estar cadastrado e logado.</span>
          <Link to="/login" state={{ de: '/agendamento' }} className="btn-action btn-call">Fazer Login</Link>
          <Link to="/cadastro" className="btn-action btn-whatsapp">Cadastrar-se</Link>
        </div>
      </main>
    )
  }

  const mascararCpf = (valor) => {
    let v = valor.replace(/\D/g, '').slice(0, 11)
    v = v.replace(/(\d{3})(\d)/, '$1.$2')
    v = v.replace(/(\d{3})(\d)/, '$1.$2')
    v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    return v
  }

  const mascararTelefone = (valor) => {
    const v = valor.replace(/\D/g, '').slice(0, 11)
    if (v.length <= 2) return v
    if (v.length <= 7) return `(${v.slice(0, 2)}) ${v.slice(2)}`
    return `(${v.slice(0, 2)}) ${v.length > 10 ? v.slice(2, 7) + '-' + v.slice(7) : v.slice(2, 6) + '-' + v.slice(6)}`
  }

  const agendar = (e) => {
    e.preventDefault()
    setErro('')
    setSucesso('')

    if (!usuario) { setErro('Sessão expirada. Faça login novamente.'); return }
    if (!unidade || !especialidade || !data || !horarioSelecionado) {
      setErro('Selecione a unidade, a especialidade e um horário disponível.')
      return
    }
    if (unidade === 'upa') {
      setErro('A UPA 24h atende por demanda espontânea e não aceita agendamento.')
      return
    }
    if (data < hoje) {
      setErro('Selecione uma data futura.')
      return
    }
    if (!cpfValido(cpf)) {
      setErro('CPF inválido. Verifique os números digitados.')
      return
    }
    const nomeLimpo = paciente.trim().slice(0, 80)
    if (nomeLimpo.length < 3) {
      setErro('Informe o nome completo do paciente.')
      return
    }

    const agendamentos = lerAgendamentos()
    agendamentos.push({
      id: Date.now(),
      usuario: usuario.email,
      unidade,
      especialidade,
      data,
      horario: horarioSelecionado,
      paciente: nomeLimpo,
      telefone: telefone.trim().slice(0, 20),
      observacoes: observacoes.trim().slice(0, 300),
      criadoEm: new Date().toISOString()
    })
    localStorage.setItem(CHAVE_AGENDAMENTOS, JSON.stringify(agendamentos))

    setSucesso(
      `Consulta agendada! ${UNIDADES_ROTULO[unidade]} • ${ESPECIALIDADES[especialidade]} • ${data.split('-').reverse().join('/')} às ${horarioSelecionado}. O cancelamento pode ser feito até 24 horas antes (US05).`
    )
    setUnidade(''); setEspecialidade(''); setData(''); setHorarioSelecionado('')
    setPaciente(''); setCpf(''); setTelefone(''); setObservacoes('')
    setVersao(v => v + 1)
  }

  const cancelar = (id) => {
    if (!window.confirm('Deseja realmente cancelar este agendamento?')) return
    const restantes = lerAgendamentos().filter(a => a.id !== id || a.usuario !== usuario.email)
    localStorage.setItem(CHAVE_AGENDAMENTOS, JSON.stringify(restantes))
    setSucesso('Agendamento cancelado.')
    setVersao(v => v + 1)
  }

  // Apenas agendamentos do usuário logado (isolamento entre contas)
  const meus = lerAgendamentos()
    .filter(a => a.usuario === usuario.email)
    .sort((a, b) => (a.data + a.horario).localeCompare(b.data + b.horario))
  void versao

  return (
    <main className="intro-section">
      <div id="intro">
        <h1>Agendamento de Consulta</h1>
        <p>Olá, {usuario.nome}! Escolha a unidade, especialidade e horário disponível. (US05)</p>
      </div>

      {(erro || sucesso) && (
        <div
          className={`form-msg ${sucesso ? 'form-msg--sucesso' : 'form-msg--erro'}`}
          role={sucesso ? 'status' : 'alert'}
          style={{ maxWidth: 800, margin: '0 auto 16px' }}
        >
          {sucesso || erro}
        </div>
      )}

      <section className="sched-section" aria-label="Formulário de agendamento">
        <form className="sched-form" onSubmit={agendar} noValidate>
          <div className="sched-grid">
            <div className="form-group">
              <label htmlFor="sched-unit">Unidade de Saúde</label>
              <select id="sched-unit" value={unidade} onChange={(e) => { setUnidade(e.target.value); setHorarioSelecionado('') }} required>
                <option value="">Selecione a unidade...</option>
                <option value="medbarra">Medbarra</option>
                <option value="upa">UPA 24h (Urgência – sem agendamento)</option>
                <option value="cristo">Hospital Cristo Redentor</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="sched-spec">Especialidade</label>
              <select id="sched-spec" value={especialidade} onChange={(e) => setEspecialidade(e.target.value)} required>
                <option value="">Selecione a especialidade...</option>
                {Object.entries(ESPECIALIDADES).map(([valor, rotulo]) => (
                  <option key={valor} value={valor}>{rotulo}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="sched-date">Data da Consulta</label>
              <input
                type="date"
                id="sched-date"
                min={hoje}
                max={`${Number(hoje.slice(0, 4)) + 1}${hoje.slice(4)}`}
                value={data}
                onChange={(e) => { setData(e.target.value); setHorarioSelecionado('') }}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="sched-patient">Nome do Paciente</label>
              <input
                id="sched-patient"
                value={paciente}
                onChange={(e) => setPaciente(e.target.value.slice(0, 80))}
                placeholder="Nome completo"
                maxLength={80}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="sched-cpf">CPF</label>
              <input
                id="sched-cpf"
                value={cpf}
                onChange={(e) => setCpf(mascararCpf(e.target.value))}
                placeholder="000.000.000-00"
                inputMode="numeric"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="sched-phone">Telefone / WhatsApp</label>
              <input
                id="sched-phone"
                type="tel"
                value={telefone}
                onChange={(e) => setTelefone(mascararTelefone(e.target.value))}
                placeholder="(66) 9 0000-0000"
                maxLength={16}
                required
              />
            </div>
          </div>

          <div className="slots-section" aria-label="Horários disponíveis">
            <h2>Horários disponíveis</h2>
            <div className="slots-grid" role="group" aria-label="Selecione um horário">
              {unidade === 'upa' && (
                <p className="slots-placeholder">⚠️ A UPA 24h atende por demanda espontânea — não é necessário agendamento.</p>
              )}
              {(!unidade || !data) && unidade !== 'upa' && (
                <p className="slots-placeholder">Selecione a unidade e a data para ver os horários.</p>
              )}
              {unidade && data && unidade !== 'upa' && data < hoje && (
                <p className="slots-placeholder">⚠️ Selecione uma data futura.</p>
              )}
              {unidade && data >= hoje && unidade !== 'upa' && horariosDisponiveis.length === 0 && (
                <p className="slots-placeholder">😔 Nenhum horário disponível para essa data. Tente outro dia.</p>
              )}
              {horariosDisponiveis.map(h => (
                <button
                  key={h}
                  type="button"
                  className={`slot-btn ${horarioSelecionado === h ? 'selected' : ''}`}
                  onClick={() => setHorarioSelecionado(h)}
                  aria-pressed={horarioSelecionado === h}
                  aria-label={`Selecionar horário ${h}`}
                >
                  {h}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group form-group--full" style={{ marginTop: 16 }}>
            <label htmlFor="sched-notes">Observações (opcional)</label>
            <textarea
              id="sched-notes"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value.slice(0, 300))}
              placeholder="Informe sintomas ou outras observações relevantes..."
              rows={3}
              maxLength={300}
              aria-label="Observações sobre a consulta"
            />
          </div>

          <button type="submit" className="btn-bloco btn-bloco--full-width">
            📅 Confirmar Agendamento
          </button>
        </form>
      </section>

      <section className="my-schedules" aria-label="Meus agendamentos">
        <h2>Meus Agendamentos</h2>
        {meus.length === 0 ? (
          <p className="schedules-empty">Você ainda não possui agendamentos.</p>
        ) : (
          meus.map(appt => {
            const quando = new Date(`${appt.data}T${appt.horario}:00`)
            const horasAte = (quando.getTime() - Date.now()) / 3600000
            const podeCancel = Number.isFinite(horasAte) && horasAte > 24
            return (
              <div className="appt-card" role="listitem" key={appt.id}>
                <div className="appt-info">
                  <strong>📅 {appt.data.split('-').reverse().join('/')} às {appt.horario}</strong>
                  <span>{UNIDADES_ROTULO[appt.unidade] || appt.unidade} – {ESPECIALIDADES[appt.especialidade] || appt.especialidade}</span>
                  <span>Paciente: {appt.paciente}</span>
                </div>
                {podeCancel ? (
                  <button onClick={() => cancelar(appt.id)} className="btn-cancel" aria-label="Cancelar agendamento">
                    ❌ Cancelar
                  </button>
                ) : (
                  <span className="no-cancel" title="Cancelamento disponível apenas até 24h antes">🔒 Não cancelável</span>
                )}
              </div>
            )
          })
        )}
      </section>
    </main>
  )
}
