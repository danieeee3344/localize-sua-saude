# Plano de Arquitetura — Sistema Acadêmico em React 18 + Node.js

> **Idioma obrigatório:** 100% do código (variáveis, funções, tabelas, colunas, chaves JSON, rotas **e comentários**) em **português brasileiro**. Comentários devem descrever a lógica em PT-BR em toda função e bloco relevante.

---

## 1. Visão Geral da Arquitetura

O projeto consiste em um **Sistema Acadêmico Full Stack** composto por duas camadas bem definidas:

1. **Frontend (React 18 + Vite + Tailwind CSS)**: Interface moderna baseada em componentes reativos, responsável pelo gerenciamento de estado da interface, validação visual e envio de dados via `fetch` assíncrono.
2. **Backend (Node.js + Express + SQLite)**: API RESTful encarregada do roteamento, sanitização de inputs contra scripts maliciosos, tratamento de cabeçalhos de segurança (Helmet/CORS) e persistência síncrona com banco de dados SQLite via `better-sqlite3`.

---

## 2. Estrutura Completa de Diretórios

```text
testereact/
├── api/                          # Backend Node.js
│   ├── .env                      # Variáveis de ambiente (porta, banco)
│   ├── package.json              # Dependências e scripts do servidor Node.js
│   ├── src/
│   │   ├── app.js                # Configuração do Express, CORS, Helmet e estáticos
│   │   ├── server.js             # Inicialização do servidor HTTP (Porta 3000)
│   │   ├── config/
│   │   │   └── conexaoBanco.js   # Conexão SQLite (better-sqlite3)
│   │   ├── controladores/
│   │   │   └── leadControlador.js# Regras de negócio da API
│   │   ├── rotas/
│   │   │   └── leadRotas.js      # Rotas da API (/api/leads)
│   │   └── utilitarios/
│   │       └── validadores.js    # Sanitização e validação dos inputs
│   │
│   ├── db/                       # Diretório do banco SQLite (runtime)
│   │   └── landing.db            # Arquivo da base de dados local
│   └── iniciarBanco.js           # Script DDL de criação da tabela de leads
│
├── frontend/                     # Frontend Reativo (React 18 + Vite)
│   ├── package.json              # Dependências do React (dev, build, preview)
│   ├── vite.config.js            # Configuração do Vite e proxy da API (/api -> 3000)
│   ├── tailwind.config.js        # Configuração das rotas de scan do Tailwind CSS
│   ├── postcss.config.js         # Configuração do PostCSS
│   ├── index.html                # HTML Base com div #root
│   └── src/
│       ├── main.jsx              # Ponto de entrada do React (ReactDOM.createRoot)
│       ├── App.jsx               # Componente raiz unificador da interface
│       ├── index.css             # Estilos globais e importações do Tailwind CSS
│       └── components/
│           ├── Header.jsx        # Navbar fixa com marca Localize Sua Saúde
│           ├── Hero.jsx          # Seção Hero com destaque para a stack
│           ├── Beneficios.jsx    # Cards da arquitetura (React, Node, SQLite)
│           ├── FormularioLead.jsx# Formulário reativo com máscara e validação
│           ├── Toast.jsx         # Componente de notificação flutuante
│           └── Footer.jsx        # Rodapé institucional
│
├── doc/
│   └── plano_landingpage_nodejs.md   # ← Este documento
│
├── .gitignore                    # Especificação de arquivos ignorados pelo Git
└── README.md                     # Guia de instalação e documentação oficial
```

---

## 3. Instruções de Ativação e Execução do Servidor React e Backend

### 3.1 Instalação das Dependências

Instalar pacotes do servidor backend:
```bash
cd api
npm install
```

Instalar pacotes da aplicação React frontend:
```bash
cd ../frontend
npm install
```

---

### 3.2 Ativação do Servidor em Desenvolvimento (React + Node.js)

1. **Terminal 1 — Iniciar a API Node.js (Porta 3000):**
   ```bash
   cd api
   npm run dev
   ```

2. **Terminal 2 — Iniciar o Servidor React no Vite (Porta 5173):**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Acesso no Navegador:**
   - Interface do Usuário em React: **`http://localhost:5173`**
   - Endpoints da API RESTful: **`http://localhost:3000/api/leads`**

---

### 3.3 Geração do Build de Produção

Para compilar o frontend React em pacotes JS/CSS otimizados e disponibilizá-los diretamente via Express:

1. Executar a compilação:
   ```bash
   cd frontend
   npm run build
   ```
2. Executar o servidor Express:
   ```bash
   cd ../api
   npm start
   ```
3. Acessar a aplicação completa em **`http://localhost:3000`**.

---

## 4. Modelagem do Banco de Dados (SQLite)

O banco de dados SQLite (`api/db/landing.db`) é instanciado automaticamente.

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

---

## 5. Repositório e Controle de Versão (Git / GitHub)

O controle de versão é mantido no repositório GitHub:
🔗 `https://github.com/danieeee3344/localize-sua-saude.git`

Para atualizar o repositório após edições:
```bash
git add .
git commit -m "docs: atualiza instrucoes do servidor React e especificacoes do sistema"
git push -u origin main
```
