import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { AutenticacaoProvider } from './contextos/AutenticacaoContexto'
import AccessibilityBar from './components/AccessibilityBar'
import Header from './components/Header'
import Footer from './components/Footer'
import Inicio from './paginas/Inicio'
import UnidadesSaude from './paginas/UnidadesSaude'
import Medicamentos from './paginas/Medicamentos'
import Agendamento from './paginas/Agendamento'
import Login from './paginas/Login'
import Cadastro from './paginas/Cadastro'

function Layout() {
  return (
    <>
      <AccessibilityBar />
      <div id="grad1">
        <Header />
        <Outlet />
        <Footer />
      </div>
    </>
  )
}

export default function App() {
  return (
    <AutenticacaoProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Inicio />} />
            <Route path="/hospitais" element={<UnidadesSaude />} />
            <Route path="/medicamentos" element={<Medicamentos />} />
            {/* RN02: agendamento exige sessão (verificado dentro da página) */}
            <Route path="/agendamento" element={<Agendamento />} />
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Cadastro />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AutenticacaoProvider>
  )
}
