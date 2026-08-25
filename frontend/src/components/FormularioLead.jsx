import React, { useState } from 'react'

export default function FormularioLead({ emSucesso, emErro }) {
  const [formData, setFormData] = useState({
    nome_completo: '',
    email: '',
    telefone_whatsapp: '',
    mensagem: ''
  })
  const [carregando, setCarregando] = useState(false)

  const tratarMascaraTelefone = (valor) => {
    let digitos = valor.replace(/\D/g, '').slice(0, 11)
    if (digitos.length > 2) digitos = `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`
    if (digitos.length > 10) digitos = `${digitos.slice(0, 10)}-${digitos.slice(10)}`
    return digitos
  }

  const aoMudarInput = (e) => {
    const { name, value } = e.target
    if (name === 'telefone_whatsapp') {
      setFormData(prev => ({ ...prev, [name]: tratarMascaraTelefone(value) }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const aoSubmeter = async (e) => {
    e.preventDefault()
    if (carregando) return

    setCarregando(true)

    try {
      const resposta = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome_completo: formData.nome_completo.trim(),
          email: formData.email.trim(),
          telefone_whatsapp: formData.telefone_whatsapp,
          mensagem: formData.mensagem.trim()
        })
      })

      const resultado = await resposta.json()

      if (resultado.sucesso) {
        emSucesso(resultado.mensagem || 'Cadastro realizado com sucesso na API!')
        setFormData({
          nome_completo: '',
          email: '',
          telefone_whatsapp: '',
          mensagem: ''
        })
      } else {
        const msg = resultado.erros ? resultado.erros.join(' ') : resultado.mensagem
        emErro(msg || 'Erro na validação da API. Tente novamente.')
      }
    } catch {
      emErro('Erro de conexão com o servidor.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <section id="formulario" className="py-20 px-4 bg-gradient-to-b from-gray-50 to-emerald-50/50">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest bg-emerald-100/80 px-3.5 py-1 rounded-full border border-emerald-200">
            Demonstração Interativa
          </span>
          <h2 className="text-3xl font-extrabold text-gray-900 mt-3">
            Teste o Sistema
          </h2>
          <p className="text-gray-600 mt-2">
            Envie seus dados no formulário <strong>React</strong> para processar a requisição no backend <strong>Node.js</strong> e salvar no <strong>SQLite</strong>.
          </p>
        </div>

        <form
          onSubmit={aoSubmeter}
          className="bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-emerald-100 space-y-6"
          noValidate
        >
          <div>
            <label
              htmlFor="nome_completo"
              className="block text-sm font-semibold text-gray-700 mb-1.5"
            >
              Nome Completo
            </label>
            <input
              type="text"
              id="nome_completo"
              name="nome_completo"
              required
              minLength={3}
              maxLength={150}
              placeholder="Ex: Maria Silva"
              value={formData.nome_completo}
              onChange={aoMudarInput}
              className="w-full border border-gray-300 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition text-gray-800 placeholder-gray-400"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-700 mb-1.5"
              >
                E-mail de Contato
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                placeholder="exemplo@dominio.com"
                value={formData.email}
                onChange={aoMudarInput}
                className="w-full border border-gray-300 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition text-gray-800 placeholder-gray-400"
              />
            </div>

            <div>
              <label
                htmlFor="telefone_whatsapp"
                className="block text-sm font-semibold text-gray-700 mb-1.5"
              >
                Telefone WhatsApp
              </label>
              <input
                type="tel"
                id="telefone_whatsapp"
                name="telefone_whatsapp"
                required
                maxLength={15}
                placeholder="(11) 99999-8888"
                value={formData.telefone_whatsapp}
                onChange={aoMudarInput}
                className="w-full border border-gray-300 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition text-gray-800 placeholder-gray-400"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="mensagem"
              className="block text-sm font-semibold text-gray-700 mb-1.5"
            >
              Mensagem ou Feedback (opcional)
            </label>
            <textarea
              id="mensagem"
              name="mensagem"
              rows={3}
              maxLength={500}
              placeholder="Escreva sua mensagem ou feedback..."
              value={formData.mensagem}
              onChange={aoMudarInput}
              className="w-full border border-gray-300 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition text-gray-800 placeholder-gray-400 resize-none"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold py-4 px-6 rounded-xl hover:opacity-95 transition shadow-lg shadow-emerald-200 hover:shadow-emerald-300 flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed text-base"
          >
            <span>{carregando ? 'Enviando...' : 'Enviar Cadastro'}</span>
            {carregando && (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            )}
          </button>
        </form>
      </div>
    </section>
  )
}
