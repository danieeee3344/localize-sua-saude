# Localize Sua Saúde

Plataforma full stack para localização de unidades de saúde, desenvolvida como projeto acadêmico para a matéria de Projeto e Desenvolvimento de Sistemas.

**Matéria / Turma:** 3º Ano A - Informática (Profº David)  
**Região Alvo:** Barra do Garças (MT), Pontal do Araguaia (MT) e Aragarças (GO)  
**Versão:** 1.0  

---

## Visão Geral

O sistema **Localize Sua Saúde** resolve a descentralização e a falta de visibilidade digital dos serviços de saúde na região do Vale do Araguaia. A plataforma reunirá hospitais, clínicas e laboratórios em um único ambiente digital, oferecendo busca interativa, localização georreferenciada e avaliações comunitárias.

---

## Stack Tecnológica

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Frontend | React + Vite + Tailwind CSS | React 18, Vite 5, Tailwind 3 |
| Backend | Node.js + Express | Express 4 |
| Banco de Dados | SQLite (better-sqlite3) | better-sqlite3 11 |
| Segurança | Helmet + CORS + validator | Helmet 8, validator 13 |
| Estilo | Tailwind CSS via PostCSS + Autoprefixer | - |

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
│   ├── tailwind.config.js            # Configuração Tailwind CSS
│   ├── postcss.config.js             # PostCSS (Tailwind + Autoprefixer)
│   ├── index.html                    # HTML base com div #root
│   ├── dist/                         # Build de produção (gerado por npm run build)
│   └── src/
│       ├── main.jsx                  # Ponto de entrada React (createRoot)
│       ├── App.jsx                   # Componente raiz orquestrador
│       ├── index.css                 # Diretivas Tailwind + estilos globais
│       └── components/
│           ├── Header.jsx            # Navbar fixa com marca do projeto
│           ├── Hero.jsx              # Seção principal com apresentação
│           ├── Beneficios.jsx        # Cards de diferenciais da arquitetura
│           ├── FormularioLead.jsx    # Formulário reativo com máscara e validação
│           ├── Toast.jsx             # Componente de notificação flutuante
│           └── Footer.jsx            # Rodapé institucional
│
├── doc/                              # Documentação do projeto
│   ├── plano_landingpage_nodejs.md   # Plano de arquitetura do sistema
│   ├── requisitos-software.md        # Especificação de requisitos de software (SRS)
│   └── requisitos-usuario.md         # Requisitos de usuário e histórias de uso
│
├── legado/                           # Protótipos anteriores (referência)
│   ├── localize-sua-saude/           # Repositório de requisitos (fase 1)
│   └── localizesuasaude/             # Protótipo HTML/CSS/JS estático (fase 2)
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

| ID | Requisito | Prioridade |
|----|-----------|------------|
| RF01 | Busca e Filtragem de Estabelecimentos por nome, cidade, especialidade, tipo e atendimento | Alta |
| RF02 | Visualização em Mapa e Geolocalização com Leaflet.js | Alta |
| RF03 | Perfil Detalhado da Unidade de Saúde (endereço, telefone, horários, especialidades) | Alta |
| RF04 | Sistema de Avaliação e Feedbacks (1-5 estrelas) | Média |
| RF05 | Atalho para Contato Direto (Ligar Agora, WhatsApp) | Alta |
| RF06 | Modo de Alta Acessibilidade para Idosos | Alta |
| RF07 | Moderação de Avaliações (painel administrativo) | Baixa |

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

---

## Instalação e Configuração

### Pré-requisitos

- [Node.js](https://nodejs.org/) (v18 ou superior)
- npm (v9 ou superior)

### 1. Clonar o repositório

```bash
git clone https://github.com/carlosdavidr-eng/testereact.git
cd localizesaude
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

Os protótipos anteriores estão preservados na pasta `legado/` para referência.

---

## Funcionalidades do Protótipo Legado

O protótipo em `legado/localizesuasaude/` continha:

- **Busca de unidades de saúde** com filtros por cidade, tipo e especialidade
- **Mapa interativo** com Leaflet.js e OpenStreetMap
- **Cadastro de estabelecimentos** com moderação administrativa
- **Consulta de medicamentos** por unidade de saúde
- **Agendamento de consultas** com seleção de horários
- **Sistema de login/cadastro** com perfis (Cidadão, Atendente, Gestor)
- **Modo acessibilidade** com alto contraste e fontes ampliadas
- **Avaliações e reviews** com sistema de estrelas

---

## Desenvolvimento

### Padrões de Código

- 100% do código, variáveis, funções e comentários em **português brasileiro**
- Arquitetura em camadas: Rotas → Controladores → Configuração → Utilitários
- Componentes React funcionais com hooks (useState, useEffect)
- Design system utilitário com Tailwind CSS

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

- **Repositório:** [github.com/carlosdavidr-eng/testereact](https://github.com/carlosdavidr-eng/testereact)
- **Região atendida:** Barra do Garças (MT), Pontal do Araguaia (MT), Aragarças (GO)

---

## Licença

Desenvolvido para fins acadêmicos e educacionais.
