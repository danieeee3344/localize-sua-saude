import React from 'react'

const diferenciaisProjeto = [
  {
    icone: '⚛️',
    titulo: 'Frontend em React 18',
    subtitulo: 'Interface Moderna & Reativa',
    descricao: 'Construído com React 18 e Vite. Componentes modulares, hooks reativos (useState, useEffect) e design utilitário com Tailwind CSS.'
  },
  {
    icone: '⚡',
    titulo: 'Backend em Node.js',
    subtitulo: 'API RESTful & Express',
    descricao: 'Rotas organizadas sob o padrão de arquitetura de controladores, middlewares de sanitização e proteção HTTP com Helmet.'
  },
  {
    icone: '🗄️',
    titulo: 'Banco SQLite Integrado',
    subtitulo: 'Persistência de Dados Local',
    descricao: 'Utilização do driver síncrono better-sqlite3 com consultas preparadas (Prepared Statements) para prevenir SQL Injection.'
  },
  {
    icone: '🛡️',
    titulo: 'Validação & Segurança',
    subtitulo: 'Sanitização Estrita de Entradas',
    descricao: 'Máscara interativa de telefone WhatsApp, validações avançadas de e-mail e tratamento semântico de erros de submissão.'
  }
]

export default function Beneficios() {
  return (
    <section id="tecnologias" className="py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
            Arquitetura Full Stack
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-3">
            Por que este Projeto Acadêmico se destaca?
          </h2>
          <p className="text-gray-600 mt-3">
            Conheça as tecnologias e boas práticas de desenvolvimento aplicadas nesta solução de ponta a ponta.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {diferenciaisProjeto.map((item, index) => (
            <div
              key={index}
              className="p-6 rounded-2xl bg-gradient-to-b from-gray-50 to-emerald-50/30 border border-gray-100 hover:border-emerald-200 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-white shadow-md flex items-center justify-center text-3xl mb-5 group-hover:scale-110 transition-transform">
                  {item.icone}
                </div>
                <span className="text-xs font-semibold text-emerald-600">{item.subtitulo}</span>
                <h3 className="text-xl font-bold text-gray-900 mt-1 mb-3">{item.titulo}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.descricao}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
