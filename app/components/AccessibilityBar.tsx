'use client';

import { useState, useEffect } from 'react';

export default function AccessibilityBar() {
  const [elderlyMode, setElderlyMode] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [fontLevel, setFontLevel] = useState(0);

  useEffect(() => {
    if (localStorage.getItem('elderlyMode') === 'true') {
      setElderlyMode(true);
      document.body.classList.add('elderly-mode');
    }
    if (localStorage.getItem('highContrast') === 'true') {
      setHighContrast(true);
      document.body.classList.add('high-contrast');
    }
    const savedFont = parseInt(localStorage.getItem('fontLevel') || '0', 10);
    if (!isNaN(savedFont)) {
      setFontLevel(savedFont);
      document.documentElement.style.fontSize = `${16 + savedFont * 2}px`;
    }
  }, []);

  const toggleElderlyMode = () => {
    const next = !elderlyMode;
    setElderlyMode(next);
    document.body.classList.toggle('elderly-mode', next);
    localStorage.setItem('elderlyMode', String(next));
  };

  const toggleHighContrast = () => {
    const next = !highContrast;
    setHighContrast(next);
    document.body.classList.toggle('high-contrast', next);
    localStorage.setItem('highContrast', String(next));
  };

  const changeFontSize = (delta: number) => {
    const nextLevel = Math.max(-2, Math.min(4, fontLevel + delta));
    setFontLevel(nextLevel);
    document.documentElement.style.fontSize = `${16 + nextLevel * 2}px`;
    localStorage.setItem('fontLevel', String(nextLevel));
  };

  return (
    <div id="accessibility-bar" role="toolbar" aria-label="Barra de acessibilidade">
      <span>Acessibilidade:</span>
      <button
        id="btn-accessibility"
        onClick={toggleElderlyMode}
        title="Ativar modo de alta acessibilidade para idosos"
        aria-pressed={elderlyMode}
      >
        {elderlyMode ? 'Modo Normal' : 'Modo Idoso'}
      </button>
      <button
        id="btn-contrast"
        onClick={toggleHighContrast}
        title="Alternar alto contraste"
        aria-pressed={highContrast}
      >
        Alto Contraste
      </button>
      <button onClick={() => changeFontSize(1)} title="Aumentar fonte" aria-label="Aumentar fonte">
        A+
      </button>
      <button onClick={() => changeFontSize(-1)} title="Diminuir fonte" aria-label="Diminuir fonte">
        A-
      </button>
    </div>
  );
}
