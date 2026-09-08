'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

type Agendamento = {
  id: number;
  unidade: string;
  especialidade: string;
  data: string;
  horario: string;
  paciente: string;
};

const slotsData: Record<string, string[]> = {
  medbarra: ['08:00', '08:30', '09:00', '10:00', '10:30', '14:00', '14:30', '15:00', '16:00'],
  upa: [],
  cristo: ['07:00', '07:30', '08:00', '09:00', '11:00', '13:30', '14:00', '15:30', '16:30'],
};

const bookedSlots: Record<string, string[]> = {
  medbarra: ['09:00', '14:30'],
  cristo: ['08:00', '15:30'],
};

export default function AgendamentoPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const [unidade, setUnidade] = useState('');
  const [especialidade, setEspecialidade] = useState('');
  const [data, setData] = useState('');
  const [paciente, setPaciente] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [horario, setHorario] = useState('');
  const [observacoes, setObservacoes] = useState('');

  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAgendamentos = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/agendamentos', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = await res.json();
      if (d.ok) setAgendamentos(d.agendamentos);
    } catch {
      // Ignore
    }
  }, []);

  useEffect(() => {
    const logged = localStorage.getItem('loggedIn') === 'true';
    const uid = localStorage.getItem('userId');
    setIsLoggedIn(logged);
    setUserId(uid);
    if (logged && uid) {
      fetchAgendamentos();
    }
  }, [fetchAgendamentos]);

  useEffect(() => {
    if (unidade === 'upa') {
      setAvailableSlots([]);
      return;
    }
    if (!unidade || !data) {
      setAvailableSlots([]);
      return;
    }
    const today = new Date().toISOString().split('T')[0];
    if (data < today) {
      setAvailableSlots([]);
      return;
    }
    const available = (slotsData[unidade] || []).filter(
      (s) => !(bookedSlots[unidade] || []).includes(s)
    );
    setAvailableSlots(available);
  }, [unidade, data]);

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn || !userId) {
      alert('Para agendar uma consulta você precisa estar logado.');
      return;
    }
    if (!unidade || !especialidade || !data || !horario || !paciente) {
      alert('⚠️ Preencha todos os campos e selecione um horário disponível.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/agendamentos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          unidade,
          especialidade,
          data,
          horario,
          paciente,
          cpf,
          telefone,
          observacoes,
        }),
      });
      const resData = await res.json();
      if (resData.ok) {
        alert(
          `✅ Consulta agendada com sucesso!\n\nUnidade: ${unidade}\nEspecialidade: ${especialidade}\nData: ${data} às ${horario}\nPaciente: ${paciente}`
        );
        setUnidade('');
        setEspecialidade('');
        setData('');
        setPaciente('');
        setCpf('');
        setTelefone('');
        setHorario('');
        setObservacoes('');
        fetchAgendamentos();
      } else {
        alert(`Erro: ${resData.erro}`);
      }
    } catch {
      alert('Falha ao agendar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: number) => {
    if (!confirm('Deseja realmente cancelar este agendamento?')) return;
    try {
      const res = await fetch(`/api/agendamentos/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const d = await res.json();
      if (d.ok) {
        alert('✅ Agendamento cancelado.');
        fetchAgendamentos();
      }
    } catch {
      alert('Erros ao cancelar.');
    }
  };

  return (
    <main className="intro-section">
      <div id="intro">
        <h1>Agendamento de Consulta</h1>
        <p>Escolha a unidade, especialidade e horário disponível para agendar sua consulta.</p>
      </div>

      {!isLoggedIn && (
        <div id="login-notice" className="login-notice" role="alert" aria-live="polite">
          ⚠️ <strong>Atenção:</strong> Para agendar consultas você precisa estar cadastrado e logado.
          <Link href="/login" className="btn-action btn-call" style={{ marginLeft: '12px' }}>
            Fazer Login
          </Link>
          <Link href="/cadastro" className="btn-action btn-whatsapp" style={{ marginLeft: '6px' }}>
            Cadastrar-se
          </Link>
        </div>
      )}

      <section className="sched-section" aria-label="Formulário de agendamento">
        <form id="sched-form" className="sched-form" onSubmit={handleSchedule} noValidate>
          <div className="sched-grid">
            <div className="form-group">
              <label htmlFor="sched-unit">Unidade de Saúde</label>
              <select
                id="sched-unit"
                value={unidade}
                onChange={(e) => setUnidade(e.target.value)}
                required
              >
                <option value="">Selecione a unidade...</option>
                <option value="medbarra">Medbarra</option>
                <option value="upa">UPA 24h (Urgência – sem agendamento)</option>
                <option value="cristo">Hospital Cristo Redentor</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="sched-spec">Especialidade</label>
              <select
                id="sched-spec"
                value={especialidade}
                onChange={(e) => setEspecialidade(e.target.value)}
                required
              >
                <option value="">Selecione a especialidade...</option>
                <option value="clinico">Clínico Geral</option>
                <option value="cardiologia">Cardiologia</option>
                <option value="ortopedia">Ortopedia</option>
                <option value="pediatria">Pediatria</option>
                <option value="ginecologia">Ginecologia</option>
                <option value="neurologia">Neurologia</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="sched-date">Data da Consulta</label>
              <input
                type="date"
                id="sched-date"
                value={data}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setData(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="sched-patient">Nome do Paciente</label>
              <input
                type="text"
                id="sched-patient"
                value={paciente}
                onChange={(e) => setPaciente(e.target.value)}
                placeholder="Nome completo"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="sched-cpf">CPF</label>
              <input
                type="text"
                id="sched-cpf"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                placeholder="000.000.000-00"
                maxLength={14}
              />
            </div>

            <div className="form-group">
              <label htmlFor="sched-phone">Telefone / WhatsApp</label>
              <input
                type="tel"
                id="sched-phone"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="(66) 9 0000-0000"
              />
            </div>
          </div>

          <div className="slots-section" aria-label="Horários disponíveis">
            <h2>Horários disponíveis</h2>
            <div className="slots-grid" role="group">
              {unidade === 'upa' && (
                <p className="slots-placeholder">
                  ⚠️ A UPA 24h atende por demanda espontânea — não é necessário agendamento.
                </p>
              )}
              {unidade !== 'upa' && (!unidade || !data) && (
                <p className="slots-placeholder">Selecione a unidade e a data para ver os horários.</p>
              )}
              {unidade !== 'upa' && unidade && data && availableSlots.length === 0 && (
                <p className="slots-placeholder">😔 Nenhum horário disponível para essa data.</p>
              )}
              {unidade !== 'upa' &&
                availableSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    className={`slot-btn ${horario === slot ? 'selected' : ''}`}
                    onClick={() => setHorario(slot)}
                  >
                    {slot}
                  </button>
                ))}
            </div>
          </div>

          <div className="form-group form-group--full" style={{ marginTop: '16px' }}>
            <label htmlFor="sched-notes">Observações (opcional)</label>
            <textarea
              id="sched-notes"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Informe sintomas ou outras observações..."
              rows={3}
            />
          </div>

          <button
            type="submit"
            className="btn-bloco"
            disabled={loading}
            style={{ marginTop: '20px', width: '100%', maxWidth: '100%' }}
          >
            {loading ? 'Salvando...' : '📅 Confirmar Agendamento'}
          </button>
        </form>
      </section>

      <section className="my-schedules" aria-label="Meus agendamentos">
        <h2>Meus Agendamentos (Persistidos no SQLite)</h2>
        <div className="my-schedules-list">
          {!isLoggedIn && (
            <p className="schedules-empty">
              Nenhum agendamento encontrado. <Link href="/login">Faça login</Link> para ver seus agendamentos.
            </p>
          )}
          {isLoggedIn && agendamentos.length === 0 && (
            <p className="schedules-empty">Nenhum agendamento cadastrado no banco de dados.</p>
          )}
          {isLoggedIn &&
            agendamentos.map((appt) => (
              <div key={appt.id} className="appt-card" style={{ marginBottom: '12px' }}>
                <div className="appt-info">
                  <strong>
                    📅 {appt.data} às {appt.horario}
                  </strong>
                  <span>
                    {appt.unidade} – {appt.especialidade}
                  </span>
                  <span>Paciente: {appt.paciente}</span>
                </div>
                <button onClick={() => handleCancel(appt.id)} className="btn-cancel">
                  ❌ Cancelar
                </button>
              </div>
            ))}
        </div>
      </section>
    </main>
  );
}
