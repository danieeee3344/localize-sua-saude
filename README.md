# Localize Sua Saúde

Plataforma full stack para localização de unidades de saúde na região do Vale do Araguaia, desenvolvida como projeto acadêmico para a matéria de Projeto e Desenvolvimento de Sistemas.

**Matéria / Turma:** 3º Ano A - Informática (Profº David)  
**Região Alvo:** Barra do Garças (MT), Pontal do Araguaia (MT) e Aragarças (GO)  
**Versão:** 2.0  

---

## Visão Geral

O sistema **Localize Sua Saúde** resolve a descentralização e a falta de visibilidade digital dos serviços de saúde na região do Vale do Araguaia. A plataforma reunirá hospitais, clínicas e laboratórios em um único ambiente digital, oferecendo busca interativa, localização georreferenciada, consulta de medicamentos, agendamento de consultas e avaliações comunitárias — com atenção especial à acessibilidade para idosos.

---

## Funcionalidades Implementadas

### Acessibilidade (RF06 / RNF01)
- **Modo Idoso:** Amplia fontes e elementos interativos para facilitar o uso por idosos
- **Alto Contraste:** Alterna esquema de cores para melhorar legibilidade
- **Controle de Fonte (A+ / A-):** Ajusta o tamanho da fonte em 6 níveis
- **Persistência:** Preferências salvas no `localStorage` e restauradas automaticamente

### Busca e Filtragem (RF01)
- **Busca por texto:** Pesquisa por nome, especialidade ou cidade
- **Busca por CEP:** Integração com ViaCEP API para buscar endereço e redirecionar
- **Máscara de CEP:** Formatação automática do campo CEP (00000-000)
- **4 Filtros:** Cidade, Tipo (Hospital/Clínica/Laboratório/UBS), Atendimento (SUS/Particular/Convênio), Especialidade

### Geolocalização (RF02 / US01)
- **GPS:** Botão "Usar minha localização" captura coordenadas via `navigator.geolocation`
- **Status:** Feedback visual do estado da geolocalização

### Acesso Rápido (US01–US05)
- **Ver Hospitais e Clínicas:** Acesso direto à listagem de unidades
- **Consultar Medicamentos:** Busca de disponibilidade por unidade
- **Agendar Consulta:** Sistema de agendamento online

### Navegação
- **Navbar funcional:** Links reais para Início, Unidades de Saúde, Medicamentos, Agendamento
- **Botão Login:** Acesso ao sistema de autenticação

### Informações da Plataforma
- **Faixa informativa:** 100% Gratuito, Georreferenciado, Acessível (WCAG 2.1), Funciona no celular
- **Footer 4 colunas:** Informações da plataforma, Links úteis, Política de Privacidade (LGPD), Termos de Uso

---

## Stack Tecnológica

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Frontend | React + Vite + CSS Customizado | React 18, Vite 5 |
| Backend | Node.js + Express | Express 4 |
| Banco de Dados | SQLite (better-sqlite3) | better-sqlite3 11 |
| Segurança | Helmet + CORS + validator | Helmet 8, validator 13 |
| API Externa | ViaCEP (consulta de CEP) | - |
| Fonte | Google Fonts (Inter) | - |

---

## Estrutura do Projeto

```
localizesaude/
├── api/                              # Backend Node.js
│   ├── .env                          # Variáveis de ambiente (PORT, ORIGEM_PERMITIDA)
│   ├── package.json                  # Dependências e scripts
│   ├── iniciarBanco.js               # Script DDL de criação da tabela leads
│   ├── db/                           # Diretório do banco SQLite (runtime)
│   │   └── landing.db                # Arquivo do banco de dados
│   └── src/
│       ├── server.js                 # Ponto de entrada - inicialização do servidor HTTP
│       ├── app.js                    # Configuração do Express, CORS, Helmet, estáticos
│       ├── config/
│       │   └── conexaoBanco.js       # Conexão SQLite (better-sqlite3, WAL mode)
│       ├── controladores/
│       │   └── leadControlador.js    # Regras de negócio (cadastrar, listar leads)
│       ├── rotas/
│       │   └── leadRotas.js          # Rotas da API (POST/GET /api/leads)
│       └── utilitarios/
│           └── validadores.js        # Sanitização e validação de inputs
│
├── frontend/                         # Frontend React
│   ├── package.json                  # Dependências React
│   ├── vite.config.js                # Configuração Vite + proxy API
│   ├── tailwind.config.js            # Configuração Tailwind CSS + cores do design system
│   ├── postcss.config.js             # PostCSS (Tailwind + Autoprefixer)
│   ├── index.html                    # HTML base com meta description e Google Fonts
│   ├── public/
│   │   └── logomarca.png             # Logo do projeto
│   ├── dist/                         # Build de produção
│   └── src/
│       ├── main.jsx                  # Ponto de entrada React (createRoot)
│       ├── App.jsx                   # Componente raiz orquestrador
│       ├── index.css                 # Design system completo (CSS customizado)
│       └── components/
│           ├── AccessibilityBar.jsx  # Barra de acessibilidade (Modo Idoso, Contraste, A+/A-)
│           ├── Header.jsx            # Navbar azul com links funcionais
│           ├── Hero.jsx              # Logo + título + subtítulo das cidades
│           ├── SearchSection.jsx     # Busca por texto, CEP (ViaCEP), GPS e 4 filtros
│           ├── QuickAccess.jsx       # Botões de acesso rápido (Hospitais, Medicamentos, Agendamento)
│           ├── AboutStrip.jsx        # Faixa informativa (Gratuito, Georreferenciado, WCAG, Mobile)
│           └── Footer.jsx            # Rodapé 4 colunas
│
├── doc/                              # Documentação do projeto
│   ├── plano_landingpage_nodejs.md   # Plano de arquitetura do sistema
│   ├── plano_correcao.md             # Plano de correção de erros
│   ├── plano_adequacao_design.md     # Plano de migração do design legado
│   ├── requisitos-software.md        # Especificação de requisitos de software (SRS)
│   └── requisitos-usuario.md         # Requisitos de usuário e histórias de uso
│
├── package.json                      # Scripts de conveniência (raiz)
├── .gitignore                        # Arquivos ignorados pelo Git
└── README.md                         # Este arquivo
```

---

## Requisitos do Sistema

### Atores

| Ator | Descrição |
|------|-----------|
| Paciente / Cidadão | Busca atendimento médico, consulta horários, contatos e localizações |
| Estabelecimento de Saúde | Gerencia perfil, atualiza horários, contatos e especialidades |
| Administrador | Modera conteúdo, valida cadastros e gerencia a plataforma |

### Requisitos Funcionais

| ID | Requisito | Status |
|----|-----------|--------|
| RF01 | Busca e Filtragem de Estabelecimentos por nome, cidade, especialidade, tipo e atendimento | Implementado |
| RF02 | Visualização em Mapa e Geolocalização | Implementado (GPS via navigator.geolocation) |
| RF03 | Perfil Detalhado da Unidade de Saúde | Em desenvolvimento |
| RF04 | Sistema de Avaliação e Feedbacks (1-5 estrelas) | Em desenvolvimento |
| RF05 | Atalho para Contato Direto (Ligar Agora, WhatsApp) | Em desenvolvimento |
| RF06 | Modo de Alta Acessibilidade para Idosos | Implementado |
| RF07 | Moderação de Avaliações (painel administrativo) | Em desenvolvimento |

### Requisitos Não Funcionais

| ID | Categoria | Descrição | Prioridade |
|----|-----------|-----------|------------|
| RNF01 | Acessibilidade | WCAG 2.1 nível AA, suporte a leitores de tela | Alta |
| RNF02 | Responsividade | Funcional em smartphones, tablets e desktop | Alta |
| RNF03 | Desempenho | Carregamento < 3 segundos (3G/4G) | Média |
| RNF04 | Segurança | Conformidade com LGPD, criptografia de dados | Alta |
| RNF05 | Disponibilidade | Uptime mínimo de 99% (24/7) | Média |
| RNF06 | Escalabilidade | Expansão para outras cidades sem perda de performance | Baixa |

### Regras de Negócio

- **RN01:** Novos estabelecimentos só ficam visíveis após aprovação do Administrador
- **RN02:** Avaliações requerem cadastro e login prévio
- **RN03:** Consulta de estabelecimentos é 100% gratuita para pacientes

### Histórias de Usuário

| Código | Descrição | Status |
|--------|-----------|--------|
| US01 | Localizar unidades de saúde (busca, GPS, CEP) | Implementado |
| US02 | Filtrar unidades por serviços | Implementado |
| US03 | Consultar medicamentos | Em desenvolvimento |
| US04 | Atualizar estoque (Atendente) | Em desenvolvimento |
| US05 | Agendar consultas | Em desenvolvimento |

---

## Instalação e Configuração

### Pré-requisitos

- [Node.js](https://nodejs.org/) (v18 ou superior)
- npm (v9 ou superior)

### 1. Clonar o repositório

```bash
git clone https://github.com/danieeee3344/localize-sua-saude.git
cd localize-sua-saude
```

### 2. Instalar dependências

```bash
# Instalar dependências da API
cd api
npm install

# Instalar dependências do Frontend
cd ../frontend
npm install
```

Ou use o script da raiz:

```bash
npm run install:all
```

### 3. Configurar variáveis de ambiente

O arquivo `api/.env` já vem configurado:

```env
PORT=3000
ORIGEM_PERMITIDA=*
```

---

## Execução

### Modo Desenvolvimento (dois terminais)

**Terminal 1 — API Node.js (porta 3000):**
```bash
cd api
npm run dev
```

**Terminal 2 — Frontend React via Vite (porta 5173):**
```bash
cd frontend
npm run dev
```

**Acessos:**
- Frontend React: `http://localhost:5173`
- API RESTful: `http://localhost:3000/api/leads`
- Health Check: `http://localhost:3000/api/health`

### Modo Produção (via Express)

```bash
# 1. Compilar o frontend
cd frontend
npm run build

# 2. Iniciar o servidor
cd ../api
npm start
```

Acesse: `http://localhost:3000`

---

## API RESTful

### Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/health` | Health check da API |
| `POST` | `/api/leads` | Cadastrar um novo lead |
| `GET` | `/api/leads` | Listar leads com paginação |

### Exemplo: Cadastrar Lead

```bash
curl -X POST http://localhost:3000/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "nome_completo": "Maria Silva",
    "email": "maria@exemplo.com",
    "telefone_whatsapp": "(66) 99999-0000",
    "mensagem": "Gostaria de saber mais"
  }'
```

**Resposta (201):**
```json
{
  "sucesso": true,
  "mensagem": "Os dados do formulário foram enviados com sucesso!"
}
```

### Exemplo: Listar Leads

```bash
curl http://localhost:3000/api/leads?pagina=1&limite=10
```

**Resposta (200):**
```json
{
  "sucesso": true,
  "dados": [...],
  "total": 8,
  "pagina": 1,
  "limite": 10
}
```

### Validações

| Campo | Regra |
|-------|-------|
| `nome_completo` | Obrigatório, 3-150 caracteres |
| `email` | Obrigatório, formato válido |
| `telefone_whatsapp` | Obrigatório, 10-15 dígitos |
| `mensagem` | Opcional, máx. 500 caracteres |

---

## Banco de Dados

SQLite com `better-sqlite3` (modo WAL habilitado).

### Tabela `leads`

```sql
CREATE TABLE IF NOT EXISTS leads (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    nome_completo       TEXT    NOT NULL,
    email               TEXT    NOT NULL,
    telefone_whatsapp   TEXT    NOT NULL,
    mensagem            TEXT    DEFAULT NULL,
    data_cadastro       TEXT    DEFAULT (datetime('now','localtime')),
    status_atendimento  TEXT    DEFAULT 'novo'
                        CHECK(status_atendimento IN ('novo','contatado','convertido','perdido'))
);

CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status_atendimento);
```

O banco é criado automaticamente ao iniciar o servidor.

---

## Design System

O projeto utiliza um design system customizado inspirado no protótipo legado:

### Cores

| Variável | Hex | Uso |
|----------|-----|-----|
| `--clr-primary` | `#0051bb` | Cor principal (azul) |
| `--clr-primary-dk` | `#003a8a` | Azul escuro (hover) |
| `--clr-accent` | `#00bb38` | Cor de destaque (verde) |
| `--clr-accent-dk` | `#007d24` | Verde escuro (hover) |
| `--clr-purple` | `#7d8aff` | Roxo (mapas) |
| `--clr-bg` | `#f0f4ff` | Fundo da aplicação |
| `--clr-text` | `#1a1d2c` | Texto principal |
| `--clr-muted` | `#4a5568` | Texto secundário |
| `--clr-border` | `#d1d9e6` | Bordas |

### Componentes Visuais

- **Barra de Acessibilidade:** Fundo `#1a1d2c`, fixa no topo, z-index 2000
- **Navbar:** Fundo `#0051bb`, fixa abaixo da barra de acessibilidade
- **Cards:** Border-radius 12px, sombras azuis sutis
- **Botões:** Border-radius 12px, transições suaves
- **Chips:** Border-radius 999px (pill shape)

---

## Segurança

- **Helmet:** Proteção de cabeçalhos HTTP (CSP desabilitado para desenvolvimento)
- **CORS:** Configurável via `ORIGEM_PERMITIDA` no `.env`
- **Sanitização:** Inputs validados e escapados com `validator` (trim, escape, isEmail)
- **Prepared Statements:** Queries parametrizadas para prevenir SQL Injection
- **Body Parser:** Limitado a 10KB para prevenir payloads excessivos

---

## Histórico do Projeto

| Fase | Descrição | Tecnologia |
|------|-----------|-----------|
| **Fase 1** | Levantamento de requisitos | Documentação (req-system, req-user) |
| **Fase 2** | Protótipo funcional | HTML/CSS/JS estático + sql.js (WASM) |
| **Fase 3** | Sistema full stack atual | React 18 + Node.js + Express + SQLite |

Os protótipos anteriores foram removidos após a migração completa das funcionalidades para o React.

---

## Desenvolvimento

### Padrões de Código

- 100% do código, variáveis, funções e comentários em **português brasileiro**
- Arquitetura em camadas: Rotas → Controladores → Configuração → Utilitários
- Componentes React funcionais com hooks (useState, useEffect)
- Design system customizado com CSS variables

### Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run dev:api` | Inicia a API em modo desenvolvimento (com --watch) |
| `npm run dev:frontend` | Inicia o Vite em modo desenvolvimento |
| `npm run build` | Compila o frontend para produção |
| `npm run start` | Inicia o servidor Express (produção) |
| `npm run install:all` | Instala dependências de API e Frontend |

---

## Contato e Repositório

- **Repositório:** [github.com/danieeee3344/localize-sua-saude](https://github.com/danieeee3344/localize-sua-saude)
- **Região atendida:** Barra do Garças (MT), Pontal do Araguaia (MT), Aragarças (GO)

---

## Licença

Desenvolvido para fins acadêmicos e educacionais.
