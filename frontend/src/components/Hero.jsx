import React from 'react'

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-teal-50 py-20 px-4">
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-emerald-200/40 to-teal-200/40 rounded-full blur-3xl -z-10 pointer-events-none"></div>

      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-6 border border-emerald-200 shadow-sm">
            <span>🏥 Projeto Acadêmico Full Stack</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-gray-900">
            Localize Sua Saúde com{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Node.js
            </span>{' '}
            &{' '}
            <span className="bg-gradient-to-r from-sky-500 to-emerald-600 bg-clip-text text-transparent">
              React
            </span>
          </h1>

          <p className="mt-4 text-lg text-gray-600 max-w-xl leading-relaxed">
            Plataforma moderna para localização de unidades de saúde, desenvolvida para demonstrar na prática a integração de uma <strong>API RESTful de alta performance</strong> em Node.js (Express + SQLite) com um <strong>Frontend Reativo</strong> construído em React 18 e Tailwind CSS.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center md:justify-start gap-4">
            <a
              href="#formulario"
              className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-3.5 rounded-full font-bold text-lg hover:opacity-95 transition shadow-lg shadow-emerald-200 hover:shadow-emerald-300"
            >
              Cadastrar Contato
            </a>
            <a
              href="#tecnologias"
              className="bg-white text-gray-700 px-6 py-3.5 rounded-full font-semibold text-base border border-gray-200 hover:border-emerald-300 hover:text-emerald-600 transition shadow-sm"
            >
              Ver Arquitetura
            </a>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center md:justify-start gap-3">
            <span className="px-3 py-1 rounded-lg bg-sky-100 text-sky-800 text-xs font-semibold flex items-center gap-1.5">
              ⚛️ React 18 + Vite
            </span>
            <span className="px-3 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center gap-1.5">
              🟢 Node.js & Express
            </span>
            <span className="px-3 py-1 rounded-lg bg-blue-100 text-blue-800 text-xs font-semibold flex items-center gap-1.5">
              🗄️ SQLite (better-sqlite3)
            </span>
            <span className="px-3 py-1 rounded-lg bg-teal-100 text-teal-800 text-xs font-semibold flex items-center gap-1.5">
              🎨 Tailwind CSS
            </span>
          </div>
        </div>

        <div className="flex-1 w-full max-w-md">
          <div className="relative bg-white p-6 rounded-3xl shadow-2xl border border-emerald-100 backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              <span className="text-xs font-mono text-gray-400">localize-sua-saude.local</span>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-sky-50/80 border border-sky-100 flex items-center justify-between">
                <div>
                  <span className="text-xs text-sky-600 font-semibold block uppercase">Frontend Reativo</span>
                  <span className="text-sm font-bold text-gray-800">React 18 + Hooks + Tailwind</span>
                </div>
                <span className="text-2xl">⚛️</span>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-100 flex items-center justify-between">
                <div>
                  <span className="text-xs text-emerald-600 font-semibold block uppercase">API RESTful Backend</span>
                  <span className="text-sm font-bold text-gray-800">Node.js + Express + Helmet</span>
                </div>
                <span className="text-2xl">⚡</span>
              </div>

              <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-100 flex items-center justify-between">
                <div>
                  <span className="text-xs text-blue-600 font-semibold block uppercase">Banco de Dados Síncrono</span>
                  <span className="text-sm font-bold text-gray-800">SQLite + Prepared Statements</span>
                </div>
                <span className="text-2xl">🗄️</span>
              </div>
            </div>

            <div className="mt-5 p-3 rounded-xl bg-gray-900 text-gray-200 text-xs font-mono">
              <span className="text-emerald-400">GET /api/health</span> ➔ HTTP 200 OK (API Ativa)
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
