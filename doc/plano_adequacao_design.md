# Plano de Adequação — Copiar Design Legado para React

> Objetivo: O frontend React deve parecer EXATAMENTE com `legado/localizesuasaude/index.html`

---

## Diagnóstico

O projeto atual (React) tem um design genérico de "Landing Page de Tech". O legado tem um design específico de **plataforma de saúde** com funcionalidades reais. A diferença é total.

### Legado tem → Atual NÃO tem

| # | Elemento Visual/Funcional | Legado | Atual |
|---|--------------------------|--------|-------|
| 1 | Barra de acessibilidade escura no topo | Barra fixed com A+/A-/Modo Idoso/Alto Contraste | Nada |
| 2 | Navbar azul `#0051bb` com links reais | Início, Unidades, Medicamentos, Agendamento, Login | Navbar branca genérica |
| 3 | Logo + título healthcare | logomarca.png + "Encontre hospitais..." | Emoji 🏥 + "Localize Sua Saúde" |
| 4 | Barra de busca com input + botão | Input busca + "Usar minha localização" + "Buscar" | Nada |
| 5 | Busca por CEP | Input CEP + ViaCEP API + máscara | Nada |
| 6 | 4 filtros dropdown | Cidade, Tipo, Atendimento, Especialidade | Nada |
| 7 | Botões de acesso rápido | 3 botões coloridos (Hospitais, Medicamentos, Agendamento) | Nada |
| 8 | Faixa "Sobre" com chips | 100% Gratuito, Georreferenciado, WCAG, Mobile | Nada |
| 9 | Footer 4 colunas azul | Plataforma, Saiba Mais, Legal | Footer genérico escuro |
| 10 | CSS design system com variáveis | Cores azul/verde, border-radius, shadows | Tailwind genérico |

---

## Plano de Execução (10 passos)

### Passo 1: `index.html` — Adicionar meta description e Google Fonts
- Adicionar `<meta name="description">`
- Adicionar link Google Fonts Inter

### Passo 2: `tailwind.config.js` — Cores do design system legado
- `primary: #0051bb`, `primary-dk: #003a8a`
- `accent: #00bb38`, `accent-dk: #007d24`
- `purple: #7d8aff`, `bg: #f0f4ff`
- Fonte: Inter

### Passo 3: `index.css` — CSS completo do legado
- Variáveis CSS do design system
- Classes `.elderly-mode` e `.high-contrast`
- Estilos da barra de acessibilidade
- Estilos da navbar, hero, search, filtros, quick-access, about-strip, footer
- Responsividade @media

### Passo 4: Criar `AccessibilityBar.jsx`
- Barra escura fixed no topo
- Botões: Modo Idoso, Alto Contraste, A+, A-
- Lógica com localStorage

### Passo 5: Reescrever `Header.jsx`
- Navbar azul `#0051bb` fixed abaixo da barra de acessibilidade
- Links: Início, Unidades de Saúde, Medicamentos, Agendamento
- Botão Login à direita

### Passo 6: Reescrever `Hero.jsx`
- Logo container (img logomarca.png)
- Título: "Encontre hospitais, clínicas e laboratórios no Vale do Araguaia"
- Subtítulo: "Barra do Garças • Pontal do Araguaia • Aragarças"

### Passo 7: Criar `SearchSection.jsx`
- Input busca + botão "Usar minha localização" + botão "Buscar"
- Row CEP: input + botão "Buscar por CEP" + máscara
- 4 filtros: Cidade, Tipo, Atendimento, Especialidade
- Status de geolocalização

### Passo 8: Criar `QuickAccess.jsx`
- 3 botões: Ver Hospitais e Clinicas, Consultar Medicamentos, Agendar Consulta
- Cores: azul, verde, teal

### Passo 9: Criar `AboutStrip.jsx`
- 4 chips: 100% Gratuito, Georreferenciado, Acessível (WCAG 2.1), Funciona no celular

### Passo 10: Reescrever `Footer.jsx`
- 4 colunas: Localize Sua Saúde, Plataforma, Saiba Mais, Legal
- Fundo azul `#0051bb`

### Passo 11: Reescrever `App.jsx`
- Ordem: AccessibilityBar → Header → Hero → SearchSection → QuickAccess → AboutStrip → Footer
- Remover: Beneficios, FormularioLead, Toast

### Passo 12: Remover componentes não utilizados
- `Beneficios.jsx`, `FormularioLead.jsx`, `Toast.jsx`

### Passo 13: Copiar `logomarca.png` para `frontend/public/`

### Passo 14: Build + Restart servidor

---

## Arquivos a Criar/Modificar

| Arquivo | Ação |
|---------|------|
| `frontend/index.html` | Modificar (meta + fonts) |
| `frontend/tailwind.config.js` | Modificar (cores) |
| `frontend/src/index.css` | Modificar (CSS completo legado) |
| `frontend/src/App.jsx` | Reescrever |
| `frontend/src/components/AccessibilityBar.jsx` | Criar |
| `frontend/src/components/Header.jsx` | Reescrever |
| `frontend/src/components/Hero.jsx` | Reescrever |
| `frontend/src/components/SearchSection.jsx` | Criar |
| `frontend/src/components/QuickAccess.jsx` | Criar |
| `frontend/src/components/AboutStrip.jsx` | Criar |
| `frontend/src/components/Footer.jsx` | Reescrever |
| `frontend/public/logomarca.png` | Copiar do legado |
| `frontend/src/components/Beneficios.jsx` | Remover |
| `frontend/src/components/FormularioLead.jsx` | Remover |
| `frontend/src/components/Toast.jsx` | Remover |
