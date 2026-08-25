# Plano de Migração — Design e Funções do Legado para React

> Baseado na análise de `legado/localizesuasaude/index.html` + `style.css`

---

## O que o Legado tem e o Atual NÃO tem

| # | Feature | Legado (HTML/JS) | Status Atual |
|---|---------|-------------------|--------------|
| 1 | Barra de Acessibilidade | Modo Idoso, Alto Contraste, A+/A- com localStorage | Ausente |
| 2 | Navbar funcional | Início, Unidades, Medicamentos, Agendamento, Login | Navbar genérica "Localize Sua Saúde" |
| 3 | Hero com logo | Logomarca + título + subtítulo | Hero com stack tecnológica |
| 4 | Busca por texto | Input com filtros (Cidade, Tipo, Atendimento, Especialidade) | Ausente |
| 5 | Busca por CEP | ViaCEP API + máscara | Ausente |
| 6 | Geolocalização | navigator.geolocation → redirect | Ausente |
| 7 | Acesso Rápido | 3 botões (Hospitais, Medicamentos, Agendamento) | Ausente |
| 8 | Faixa Sobre | 4 chips (Gratuito, Georreferenciado, WCAG, Mobile) | Ausente |
| 9 | Footer real | 4 colunas (Plataforma, Saiba Mais, Legal) | Footer genérico |

---

## Componentes a Criar/Reescrever no React

### 1. `AccessibilityBar.jsx` (NOVO)
- Botões: Modo Idoso, Alto Contraste, A+, A-
- Estado em localStorage (elderlyMode, highContrast, fontLevel)
- CSS classes: `elderly-mode`, `high-contrast` no `<body>`

### 2. `Header.jsx` (REESCREVER)
- Navbar azul (`#0051bb`) com links reais
- Links: Início, Unidades de Saúde, Medicamentos, Agendamento
- Botão Login à direita
- Posição: fixed abaixo da barra de acessibilidade

### 3. `Hero.jsx` (REESCREVER)
- Logo container (logomarca.png)
- Título: "Encontre hospitais, clínicas e laboratórios no Vale do Araguaia"
- Subtítulo: "Barra do Garças • Pontal do Araguaia • Aragarças"

### 4. `SearchSection.jsx` (NOVO)
- Input de busca por texto
- Botão "Usar minha localização" (geolocation)
- Busca por CEP com máscara e ViaCEP API
- 4 filtros: Cidade, Tipo, Atendimento, Especialidade
- Status de geolocalização

### 5. `QuickAccess.jsx` (NOVO)
- 3 botões: Ver Hospitais, Consultar Medicamentos, Agendar Consulta
- Cores: azul, verde, teal

### 6. `AboutStrip.jsx` (NOVO)
- 4 chips: 100% Gratuito, Georreferenciado, Acessível (WCAG 2.1), Funciona no celular

### 7. `Footer.jsx` (REESCREVER)
- 4 colunas: Localize Sua Saúde, Plataforma, Saiba Mais, Legal
- Fundo azul (`#0051bb`)

### 8. `App.jsx` (REESCREVER)
- Ordem: AccessibilityBar → Header → Hero → SearchSection → QuickAccess → AboutStrip → Footer
- Remover: Beneficios, FormularioLead, Toast

### 9. `index.css` (ADICIONAR)
- Variáveis CSS do design system legado
- Classes de acessibilidade (elderly-mode, high-contrast)
- Estilos do search, filtros, quick-access, about-strip

---

## Paleta de Cores (do CSS legado)

```css
--clr-primary:    #0051bb;
--clr-primary-dk: #003a8a;
--clr-accent:     #00bb38;
--clr-accent-dk:  #007d24;
--clr-purple:     #7d8aff;
--clr-bg:         #f0f4ff;
--clr-text:       #1a1d2c;
--clr-muted:      #4a5568;
--clr-border:     #d1d9e6;
```

---

## Ordem de Execução

| # | Ação | Arquivo |
|---|------|---------|
| 1 | Criar `AccessibilityBar.jsx` | frontend/src/components/ |
| 2 | Reescrever `Header.jsx` com navbar legada | frontend/src/components/ |
| 3 | Reescrever `Hero.jsx` com logo e texto legado | frontend/src/components/ |
| 4 | Criar `SearchSection.jsx` com busca/filtros/CEP | frontend/src/components/ |
| 5 | Criar `QuickAccess.jsx` | frontend/src/components/ |
| 6 | Criar `AboutStrip.jsx` | frontend/src/components/ |
| 7 | Reescrever `Footer.jsx` com 4 colunas | frontend/src/components/ |
| 8 | Reescrever `App.jsx` com nova ordem | frontend/src/ |
| 9 | Atualizar `index.css` com design system legado | frontend/src/ |
| 10 | Atualizar `tailwind.config.js` com novas cores | frontend/ |
| 11 | Rebuild e teste | frontend/ |
