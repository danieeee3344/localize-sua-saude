import { useState, useEffect } from 'react'
import AccessibilityBar from './components/AccessibilityBar'
import Header from './components/Header'
import Hero from './components/Hero'
import SearchSection from './components/SearchSection'
import QuickAccess from './components/QuickAccess'
import AboutStrip from './components/AboutStrip'
import UnidadesView from './components/UnidadesView'
import MedicamentosView from './components/MedicamentosView'
import AgendamentoView from './components/AgendamentoView'
import LoginView from './components/LoginView'
import CadastroView from './components/CadastroView'
import AdminView from './components/AdminView'
import LeadModal from './components/LeadModal'
import Footer from './components/Footer'

export default function App() {
  const [currentView, setCurrentView] = useState('home')
  const [searchFilters, setSearchFilters] = useState({})
  const [selectedUnitForSchedule, setSelectedUnitForSchedule] = useState(null)
  const [isContactModalOpen, setIsContactModalOpen] = useState(false)

  // Sincronizar com rota da URL se acessada diretamente (ex: /hospitais, /medicamentos)
  useEffect(() => {
    const path = window.location.pathname
    if (path.includes('hospitais') || path.includes('unidades')) {
      setCurrentView('unidades')
    } else if (path.includes('medicamentos')) {
      setCurrentView('medicamentos')
    } else if (path.includes('agendamento')) {
      setCurrentView('agendamentos')
    } else if (path.includes('login')) {
      setCurrentView('login')
    } else if (path.includes('cadastro')) {
      setCurrentView('cadastro')
    } else if (path.includes('admin')) {
      setCurrentView('admin')
    }

    const handlePopState = () => {
      const p = window.location.pathname
      if (p.includes('hospitais') || p.includes('unidades')) setCurrentView('unidades')
      else if (p.includes('medicamentos')) setCurrentView('medicamentos')
      else if (p.includes('agendamento')) setCurrentView('agendamentos')
      else if (p.includes('login')) setCurrentView('login')
      else if (p.includes('cadastro')) setCurrentView('cadastro')
      else if (p.includes('admin')) setCurrentView('admin')
      else setCurrentView('home')
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const navegarPara = (view) => {
    setCurrentView(view)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    const pathMap = {
      home: '/',
      unidades: '/hospitais',
      medicamentos: '/medicamentos',
      agendamentos: '/agendamento',
      login: '/login',
      cadastro: '/cadastro',
      admin: '/admin',
    }
    const targetPath = pathMap[view] || '/'
    if (window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath)
    }
  }

  const handleSearchFromHome = (filters) => {
    setSearchFilters(filters)
    navegarPara('unidades')
  }

  const handleScheduleUnit = (unit) => {
    setSelectedUnitForSchedule(unit)
    navegarPara('agendamentos')
  }

  return (
    <div id="grad1">
      <AccessibilityBar />
      <Header currentView={currentView} setView={navegarPara} />

      <main id="main-content" style={{ flex: 1 }}>
        {currentView === 'home' && (
          <>
            <Hero onExplore={() => navegarPara('unidades')} />
            <SearchSection onSearchSubmit={handleSearchFromHome} />
            <QuickAccess onNavigate={navegarPara} />
            <div className="home-preview-section">
              <div className="container" style={{ textAlign: 'center', margin: '20px auto 10px' }}>
                <h2 style={{ color: '#1a2a6c', fontSize: '1.5rem', marginBottom: '8px' }}>
                  Principais Estabelecimentos em Destaque
                </h2>
                <p style={{ color: '#4a5568', fontSize: '.95rem' }}>
                  Acesse informações detalhadas, telefones diretos e horários de funcionamento.
                </p>
              </div>
              <UnidadesView
                initialFilters={{}}
                onNavigateAgendamento={handleScheduleUnit}
              />
            </div>
            <AboutStrip />
          </>
        )}

        {currentView === 'unidades' && (
          <UnidadesView
            initialFilters={searchFilters}
            onNavigateAgendamento={handleScheduleUnit}
          />
        )}

        {currentView === 'medicamentos' && <MedicamentosView />}

        {currentView === 'agendamentos' && (
          <AgendamentoView
            preselectedUnit={selectedUnitForSchedule}
            onNavigateLogin={() => navegarPara('login')}
          />
        )}

        {currentView === 'login' && (
          <LoginView
            onLoginSuccess={() => navegarPara('home')}
            onNavigateCadastro={() => navegarPara('cadastro')}
          />
        )}

        {currentView === 'cadastro' && (
          <CadastroView
            onCadastroSuccess={() => navegarPara('login')}
            onNavigateLogin={() => navegarPara('login')}
          />
        )}

        {currentView === 'admin' && <AdminView />}
      </main>

      <Footer
        onOpenContact={() => setIsContactModalOpen(true)}
        onNavigateView={navegarPara}
      />

      <LeadModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
    </div>
  )
}
