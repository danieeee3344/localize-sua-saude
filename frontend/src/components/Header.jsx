import React from 'react'

export default function Header() {
  return (
    <>
      <header className="fixed top-0 left-0 w-full bg-white/90 backdrop-blur-md z-50 border-b border-emerald-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white font-extrabold text-lg shadow-md shadow-emerald-200">
              🏥
            </div>
            <div>
              <span className="text-xl font-extrabold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Localize Sua Saúde
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                Node.js + React
              </span>
            </div>
          </div>

          <a
            href="#formulario"
            className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:opacity-95 transition shadow-md shadow-emerald-200 hover:shadow-emerald-300"
          >
            Cadastrar Contato
          </a>
        </div>
      </header>

      <div className="h-16"></div>
    </>
  )
}
