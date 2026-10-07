import { useState } from 'react'
import { enviarContatoLead } from '../servicos/apiCliente'

export default function LeadModal({ isOpen, onClose }) {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [telefone, setTelefone] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState(null)

  if (!isOpen) return null

  const handleTelefoneMask = (e) => {
    let v = e.target.value.replace(/\D/g, '')
    if (v.length > 11) v = v.slice(0, 11)
    if (v.length > 10) v = v.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3')
    else if (v.length > 6) v = v.replace(/^(\d{2})(\d{4})(\d{0,4})$/, '($1) $2-$3')
    else if (v.length > 2) v = v.replace(/^(\d{2})(\d{0,5})$/, '($1) $2')
    setTelefone(v)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMsg(null)

    if (!nome || !email || !telefone) {
      setMsg({ tipo: 'erro', texto: '⚠️ Preencha todos os campos obrigatórios.' })
      return
    }

    setLoading(true)

    const res = await enviarContatoLead({
      nome_completo: nome,
      email,
      telefone_whatsapp: telefone,
      mensagem,
    })

    if (res.ok || res.sucesso) {
      setMsg({
        tipo: 'sucesso',
        texto: '✅ Mensagem enviada com sucesso! Nossa equipe entrará em contato em breve.',
      })
      setTimeout(() => {
        setNome('')
        setEmail('')
        setTelefone('')
        setMensagem('')
        setMsg(null)
        onClose()
      }, 2500)
    } else {
      setMsg({
        tipo: 'erro',
        texto: `⚠️ ${res.erro || res.mensagem || 'Falha ao enviar mensagem.'}`,
      })
    }
    setLoading(false)
  }

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" style={{ maxWidth: '540px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3>Fale Conosco / Seja Parceiro</h3>
            <p className="modal-subtitle">Envie uma mensagem ou solicite o cadastro da sua clínica/hospital.</p>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose} aria-label="Fechar modal">
            ✕
          </button>
        </div>

        <div className="modal-body">
          {msg && (
            <div role="alert" className={`alert-box alert-box--${msg.tipo}`}>
              {msg.texto}
            </div>
          )}

          <form onSubmit={handleSubmit} className="lead-form">
            <div className="input-group">
              <label htmlFor="lead-nome">Nome Completo / Razão Social: <span className="req">*</span></label>
              <input
                type="text"
                id="lead-nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Seu nome ou nome da empresa"
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="lead-email">E-mail: <span className="req">*</span></label>
              <input
                type="email"
                id="lead-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="lead-tel">Telefone / WhatsApp: <span className="req">*</span></label>
              <input
                type="tel"
                id="lead-tel"
                value={telefone}
                onChange={handleTelefoneMask}
                placeholder="(66) 99999-0000"
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="lead-msg">Mensagem ou Proposta (opcional):</label>
              <textarea
                id="lead-msg"
                rows={3}
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                placeholder="Gostaria de cadastrar minha clínica, tirar dúvidas..."
              />
            </div>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar Mensagem'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
