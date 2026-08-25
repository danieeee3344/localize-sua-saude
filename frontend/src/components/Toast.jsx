import React, { useEffect } from 'react'

export default function Toast({ mensagem, tipo, visivel, aoFechar }) {
  useEffect(() => {
    if (visivel) {
      const temporizador = setTimeout(() => {
        if (aoFechar) aoFechar()
      }, 4000)
      return () => clearTimeout(temporizador)
    }
  }, [visivel, aoFechar])

  if (!visivel) return null

  const corFundo = tipo === 'sucesso' ? 'bg-green-600' : 'bg-red-600'

  return (
    <div
      className={`fixed bottom-6 right-6 px-6 py-3 rounded-lg shadow-lg text-white font-semibold transition-all duration-300 z-50 ${corFundo}`}
    >
      {mensagem}
    </div>
  )
}
