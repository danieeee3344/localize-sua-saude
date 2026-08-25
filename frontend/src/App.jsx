import AccessibilityBar from './components/AccessibilityBar'
import Header from './components/Header'
import Hero from './components/Hero'
import SearchSection from './components/SearchSection'
import QuickAccess from './components/QuickAccess'
import AboutStrip from './components/AboutStrip'
import Footer from './components/Footer'

export default function App() {
  return (
    <div id="grad1">
      <AccessibilityBar />
      <Header />
      <Hero />
      <SearchSection />
      <QuickAccess />
      <AboutStrip />
      <Footer />
    </div>
  )
}
