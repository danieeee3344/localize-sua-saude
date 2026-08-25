import React, { useState } from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import Beneficios from './components/Beneficios'
import FormularioLead from './components/FormularioLead'
import Toast from './components/Toast'
import Footer from './components/Footer'

export default function App() {
  const [toastState, setToastState] = useState({
    mensagem: '',
    tipo: 'sucesso',
    visivel: false
  })

  const exibirToastSucesso = (mensagem) => {
    setToastState({ mensagem, tipo: 'sucesso', visivel: true })
  }

  const exibirToastErro = (mensagem) => {
    setToastState({ mensagem, tipo: 'erro', visivel: true })
  }

  const fecharToast = () => {
    setToastState(prev => ({ ...prev, visivel: false }))
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1">
        <Hero />
        <Beneficios />
        <FormularioLead
          emSucesso={exibirToastSucesso}
          emErro={exibirToastErro}
        />
      </main>
      <Footer />
      <Toast
        mensagem={toastState.mensagem}
        tipo={toastState.tipo}
        visivel={toastState.visivel}
        aoFechar={fecharToast}
      />
    </div>
  )
}
