import { useState, useEffect } from 'react'

export default function AccessibilityBar() {
  const [fontLevel, setFontLevel] = useState(0)
  const [elderlyMode, setElderlyMode] = useState(false)
  const [highContrast, setHighContrast] = useState(false)

  useEffect(() => {
    const savedElderly = localStorage.getItem('elderlyMode') === 'true'
    const savedContrast = localStorage.getItem('highContrast') === 'true'
    const savedFont = parseInt(localStorage.getItem('fontLevel'))
    if (savedElderly) {
      setElderlyMode(true)
      document.body.classList.add('elderly-mode')
    }
    if (savedContrast) {
      setHighContrast(true)
      document.body.classList.add('high-contrast')
    }
    if (!isNaN(savedFont)) {
      setFontLevel(savedFont)
      document.documentElement.style.fontSize = (16 + savedFont * 2) + 'px'
    }
  }, [])

  const toggleElderly = () => {
    const next = !elderlyMode
    setElderlyMode(next)
    document.body.classList.toggle('elderly-mode', next)
    localStorage.setItem('elderlyMode', next)
  }

  const toggleContrast = () => {
    const next = !highContrast
    setHighContrast(next)
    document.body.classList.toggle('high-contrast', next)
    localStorage.setItem('highContrast', next)
  }

  const changeFontSize = (delta) => {
    const next = Math.max(-2, Math.min(4, fontLevel + delta))
    setFontLevel(next)
    document.documentElement.style.fontSize = (16 + next * 2) + 'px'
    localStorage.setItem('fontLevel', next)
  }

  return (
    <div id="accessibility-bar" role="toolbar" aria-label="Barra de acessibilidade">
      <span>Acessibilidade:</span>
      <button
        onClick={toggleElderly}
        title="Ativar modo de alta acessibilidade para idosos"
        aria-pressed={elderlyMode}
      >
        {elderlyMode ? 'Modo Normal' : 'Modo Idoso'}
      </button>
      <button
        onClick={toggleContrast}
        title="Alternar alto contraste"
        aria-pressed={highContrast}
      >
        Alto Contraste
      </button>
      <button
        onClick={() => changeFontSize(1)}
        title="Aumentar tamanho da fonte"
        aria-label="Aumentar fonte"
      >
        A+
      </button>
      <button
        onClick={() => changeFontSize(-1)}
        title="Diminuir tamanho da fonte"
        aria-label="Diminuir fonte"
      >
        A-
      </button>
    </div>
  )
}
