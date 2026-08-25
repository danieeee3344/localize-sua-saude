import React from 'react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12 px-4 border-t border-gray-800">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        <div>
          <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
            <span className="text-xl">🏥</span>
            <span className="text-lg font-bold text-white">Localize Sua Saúde</span>
          </div>
          <p className="text-sm text-gray-400">
            Projeto acadêmico para localização de unidades de saúde com arquitetura Node.js + React + SQLite.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
          <span className="px-3 py-1.5 rounded-full bg-gray-800 text-gray-300 border border-gray-700">
            Backend: Node.js / Express
          </span>
          <span className="px-3 py-1.5 rounded-full bg-gray-800 text-gray-300 border border-gray-700">
            Frontend: React 18 / Vite
          </span>
          <span className="px-3 py-1.5 rounded-full bg-gray-800 text-gray-300 border border-gray-700">
            Banco: SQLite
          </span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto border-t border-gray-800/80 mt-8 pt-6 text-center text-xs text-gray-500">
        &copy; 2026 Localize Sua Saúde. Desenvolvido para fins acadêmicos e educacionais.
      </div>
    </footer>
  )
}
