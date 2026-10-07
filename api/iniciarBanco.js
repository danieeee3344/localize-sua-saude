const banco = require('./src/config/conexaoBanco')
const { hashearSenha } = require('./src/utilitarios/seguranca')

function inicializarBanco() {
  // Criação das Tabelas
  banco.exec(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      nome      TEXT    NOT NULL,
      email     TEXT    NOT NULL UNIQUE COLLATE NOCASE,
      senha     TEXT    NOT NULL,
      perfil    TEXT    NOT NULL DEFAULT 'cidadao' CHECK(perfil IN ('cidadao', 'atendente', 'gestor')),
      criado_em TEXT    DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS unidades (
      id                TEXT PRIMARY KEY,
      nome              TEXT NOT NULL,
      tipo              TEXT NOT NULL CHECK(tipo IN ('hospital', 'ubs', 'clinica', 'laboratorio')),
      cidade            TEXT NOT NULL,
      atend             TEXT NOT NULL CHECK(atend IN ('sus', 'particular', 'convenio')),
      rating            REAL DEFAULT 0.0,
      rating_count      INTEGER DEFAULT 0,
      image             TEXT,
      address           TEXT NOT NULL,
      hours             TEXT NOT NULL,
      convenios         TEXT,
      especialidades    TEXT NOT NULL,
      phone             TEXT NOT NULL,
      whatsapp          TEXT,
      maps_url          TEXT,
      latitude          REAL,
      longitude         REAL,
      aprovado          INTEGER DEFAULT 1,
      criado_em         TEXT DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS medicamentos (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      nome            TEXT NOT NULL UNIQUE COLLATE NOCASE,
      categoria       TEXT,
      principio_ativo TEXT,
      criado_em       TEXT DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS disponibilidade_medicamentos (
      id                INTEGER PRIMARY KEY AUTOINCREMENT,
      medicamento_id    INTEGER NOT NULL REFERENCES medicamentos(id) ON DELETE CASCADE,
      unidade_id        TEXT NOT NULL REFERENCES unidades(id) ON DELETE CASCADE,
      disponivel        INTEGER NOT NULL DEFAULT 1,
      qtd               TEXT NOT NULL DEFAULT 'Disponível',
      tipo              TEXT NOT NULL DEFAULT 'sus',
      atualizado        TEXT DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS agendamentos (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id    INTEGER NOT NULL REFERENCES usuarios(id),
      unidade       TEXT NOT NULL,
      especialidade TEXT NOT NULL,
      data          TEXT NOT NULL,
      horario       TEXT NOT NULL,
      paciente      TEXT NOT NULL,
      cpf           TEXT,
      telefone      TEXT,
      observacoes   TEXT,
      status        TEXT NOT NULL DEFAULT 'confirmado' CHECK(status IN ('confirmado', 'cancelado', 'atendido')),
      criado_em     TEXT DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS avaliacoes (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id  INTEGER NOT NULL REFERENCES usuarios(id),
      unidade_id  TEXT NOT NULL REFERENCES unidades(id),
      autor_nome  TEXT,
      nota        INTEGER NOT NULL CHECK(nota BETWEEN 1 AND 5),
      comentario  TEXT,
      status      TEXT NOT NULL DEFAULT 'aprovado' CHECK(status IN ('aprovado', 'pendente', 'rejeitado')),
      criado_em   TEXT DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS leads (
      id                  INTEGER PRIMARY KEY AUTOINCREMENT,
      nome_completo       TEXT NOT NULL,
      email               TEXT NOT NULL,
      telefone_whatsapp   TEXT NOT NULL,
      mensagem            TEXT DEFAULT NULL,
      data_cadastro       TEXT DEFAULT (datetime('now', 'localtime')),
      status_atendimento  TEXT DEFAULT 'novo' CHECK(status_atendimento IN ('novo', 'contatado', 'convertido', 'perdido'))
    );

    CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
    CREATE INDEX IF NOT EXISTS idx_unidades_cidade ON unidades(cidade);
    CREATE INDEX IF NOT EXISTS idx_unidades_tipo ON unidades(tipo);
    CREATE INDEX IF NOT EXISTS idx_agendamentos_user ON agendamentos(usuario_id);
    CREATE INDEX IF NOT EXISTS idx_avaliacoes_unidade ON avaliacoes(unidade_id);
    CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
  `)

  // Inserir Usuários Iniciais se vazio
  const countUsuarios = banco.prepare('SELECT COUNT(*) as total FROM usuarios').get().total
  if (countUsuarios === 0) {
    const insertUser = banco.prepare(`
      INSERT INTO usuarios (nome, email, senha, perfil) VALUES (?, ?, ?, ?)
    `)
    insertUser.run('Maria Silva', 'cidadao@teste.com', hashearSenha('123456'), 'cidadao')
    insertUser.run('Ana Atendente', 'atendente@teste.com', hashearSenha('123456'), 'atendente')
    insertUser.run('Dr. Carlos Gestor', 'gestor@teste.com', hashearSenha('123456'), 'gestor')
  }

  // Atualizar / Inserir Unidades de Saúde com Coordenadas Geográficas Reais e Precisas
  const insertOrReplaceUnidade = banco.prepare(`
    INSERT OR REPLACE INTO unidades (
      id, nome, tipo, cidade, atend, rating, rating_count, image, address, hours, convenios,
      especialidades, phone, whatsapp, maps_url, latitude, longitude, aprovado
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
  `)

  const unidades = [
    [
      'medbarra',
      'Hospital e Maternidade Medbarra',
      'hospital',
      'Barra do Garças',
      'particular',
      4.6,
      52,
      '/medbarra.webp',
      'Av. Mato Grosso, 1200 – Centro, Barra do Garças - MT',
      'Seg–Sex: 07h–18h | Sáb: 07h–12h',
      'Particular, Unimed, Bradesco Saúde, Cassi, Postal Saúde',
      'Clínica Geral, Cardiologia, Ortopedia, Pediatria, Ginecologia, Cirurgia Geral',
      '+556634221500',
      '556634221500',
      'https://maps.google.com/?q=-15.8926,-52.2619',
      -15.8926,
      -52.2619
    ],
    [
      'upa',
      'UPA 24h Barra do Garças',
      'ubs',
      'Barra do Garças',
      'sus',
      3.9,
      128,
      '/upa.jpeg',
      'Rua das Acácias, s/n – Jardim Amazônia, Barra do Garças - MT',
      'Atendimento 24 horas todos os dias',
      'SUS – Atendimento Público Gratuito',
      'Urgência e Emergência, Clínica Geral, Traumatologia, Pediatria de Plantão',
      '+556634017000',
      '556634017000',
      'https://maps.google.com/?q=-15.8752,-52.2478',
      -15.8752,
      -52.2478
    ],
    [
      'cristo',
      'Hospital Cristo Redentor',
      'hospital',
      'Barra do Garças',
      'particular',
      4.3,
      94,
      '/cristo.jpg',
      'Rod. BR-070, Km 3 – Vila Maria, Barra do Garças - MT',
      'Seg–Sex: 06h–20h | Sáb: 07h–14h | Emergência 24h',
      'Particular, SUS, Sul América, Cassi, Geap, São Camilo',
      'Cirurgia Geral, Neurologia, Ginecologia, Ortopedia, Oftalmologia, UTI Adulto',
      '+556634011234',
      '556634011234',
      'https://maps.google.com/?q=-15.8715,-52.2853',
      -15.8715,
      -52.2853
    ],
    [
      'ubs-pontal',
      'UBS Dr. José Pontal',
      'ubs',
      'Pontal do Araguaia',
      'sus',
      4.5,
      38,
      '/logomarca.png',
      'Av. Universitária, 450 – Centro, Pontal do Araguaia - MT',
      'Seg–Sex: 07h–17h',
      'SUS – Atendimento Público Gratuito',
      'Clínica Geral, Vacinação, Pré-natal, Enfermagem, Odontologia Básica',
      '+556634019010',
      '556634019010',
      'https://maps.google.com/?q=-15.9085,-52.2425',
      -15.9085,
      -52.2425
    ],
    [
      'clinica-sao-lucas',
      'Clínica Médica São Lucas',
      'clinica',
      'Aragarças',
      'convenio',
      4.7,
      41,
      '/logomarca.png',
      'Rua Araguaia, 310 – Centro, Aragarças - GO',
      'Seg–Sex: 08h–18h | Sáb: 08h–12h',
      'Particular, Ipasgo, Unimed, Cassi, Bradesco Saúde',
      'Cardiologia, Dermatologia, Ginecologia, Ultrassonografia, Pediatria',
      '+556436381122',
      '556436381122',
      'https://maps.google.com/?q=-15.8988,-52.2492',
      -15.8988,
      -52.2492
    ],
    [
      'lab-araguaia',
      'Laboratório de Análises Araguaia',
      'laboratorio',
      'Barra do Garças',
      'convenio',
      4.8,
      67,
      '/logomarca.png',
      'Rua Carajás, 560 – Centro, Barra do Garças - MT',
      'Seg–Sex: 06h30–17h | Sáb: 06h30–11h30',
      'Particular, SUS, Unimed, Ipasgo, Amil, Sul América',
      'Exames de Sangue, Bioquímica, Imunologia, Testes Genéticos, Toxicológico',
      '+556634013344',
      '556634013344',
      'https://maps.google.com/?q=-15.8942,-52.2598',
      -15.8942,
      -52.2598
    ]
  ]

  unidades.forEach(u => insertOrReplaceUnidade.run(...u))

  // Inserir Medicamentos e Disponibilidade se vazio
  const countMeds = banco.prepare('SELECT COUNT(*) as total FROM medicamentos').get().total
  if (countMeds === 0) {
    const insertMed = banco.prepare('INSERT INTO medicamentos (nome, categoria, principio_ativo) VALUES (?, ?, ?)')
    const insertDisp = banco.prepare(`
      INSERT INTO disponibilidade_medicamentos (medicamento_id, unidade_id, disponivel, qtd, tipo, atualizado)
      VALUES (?, ?, ?, ?, ?, datetime('now', 'localtime'))
    `)

    const listaMeds = [
      { nome: 'Dipirona 500mg', cat: 'Analgésico e Antipirético', princ: 'Dipirona Sódica' },
      { nome: 'Amoxicilina 500mg', cat: 'Antibiótico', princ: 'Amoxicilina Tri-hidratada' },
      { nome: 'Losartana Potássica 50mg', cat: 'Anti-hipertensivo', princ: 'Losartana Potássica' },
      { nome: 'Metformina 850mg', cat: 'Antidiabético', princ: 'Cloridrato de Metformina' },
      { nome: 'Omeprazol 20mg', cat: 'Protetor Gástrico', princ: 'Omeprazol' },
      { nome: 'Paracetamol 750mg', cat: 'Analgésico', princ: 'Paracetamol' },
      { nome: 'Ibuprofeno 600mg', cat: 'Anti-inflamatório', princ: 'Ibuprofeno' },
      { nome: 'Azitromicina 500mg', cat: 'Antibiótico', princ: 'Azitromicina Di-hidratada' },
    ]

    listaMeds.forEach((m, idx) => {
      insertMed.run(m.nome, m.cat, m.princ)
      const medId = idx + 1

      if (m.nome.includes('Dipirona')) {
        insertDisp.run(medId, 'upa', 1, 'Disponível', 'sus')
        insertDisp.run(medId, 'medbarra', 1, 'Disponível', 'particular')
        insertDisp.run(medId, 'cristo', 0, 'Sem estoque', 'particular')
        insertDisp.run(medId, 'ubs-pontal', 1, 'Disponível', 'sus')
      } else if (m.nome.includes('Amoxicilina')) {
        insertDisp.run(medId, 'upa', 1, 'Disponível', 'sus')
        insertDisp.run(medId, 'medbarra', 0, 'Sem estoque', 'particular')
        insertDisp.run(medId, 'cristo', 1, 'Disponível', 'particular')
        insertDisp.run(medId, 'ubs-pontal', 1, 'Baixo estoque', 'sus')
      } else if (m.nome.includes('Losartana')) {
        insertDisp.run(medId, 'upa', 1, 'Disponível', 'sus')
        insertDisp.run(medId, 'medbarra', 1, 'Disponível', 'particular')
        insertDisp.run(medId, 'cristo', 1, 'Disponível', 'particular')
        insertDisp.run(medId, 'ubs-pontal', 1, 'Disponível', 'sus')
      } else if (m.nome.includes('Metformina')) {
        insertDisp.run(medId, 'upa', 0, 'Sem estoque', 'sus')
        insertDisp.run(medId, 'medbarra', 1, 'Disponível', 'particular')
        insertDisp.run(medId, 'cristo', 1, 'Disponível', 'particular')
        insertDisp.run(medId, 'ubs-pontal', 1, 'Disponível', 'sus')
      } else if (m.nome.includes('Omeprazol')) {
        insertDisp.run(medId, 'upa', 1, 'Disponível', 'sus')
        insertDisp.run(medId, 'medbarra', 1, 'Disponível', 'particular')
        insertDisp.run(medId, 'cristo', 0, 'Sem estoque', 'particular')
        insertDisp.run(medId, 'ubs-pontal', 1, 'Disponível', 'sus')
      } else {
        insertDisp.run(medId, 'upa', 1, 'Disponível', 'sus')
        insertDisp.run(medId, 'medbarra', 1, 'Disponível', 'particular')
        insertDisp.run(medId, 'cristo', 1, 'Disponível', 'particular')
        insertDisp.run(medId, 'ubs-pontal', 1, 'Disponível', 'sus')
      }
    })
  }

  // Avaliações Iniciais se vazio
  const countAvaliacoes = banco.prepare('SELECT COUNT(*) as total FROM avaliacoes').get().total
  if (countAvaliacoes === 0) {
    const insertAvaliacao = banco.prepare(`
      INSERT INTO avaliacoes (usuario_id, unidade_id, autor_nome, nota, comentario, status)
      VALUES (?, ?, ?, ?, ?, 'aprovado')
    `)
    insertAvaliacao.run(1, 'medbarra', 'Maria Silva', 5, 'Excelente atendimento e profissionais capacitados.')
    insertAvaliacao.run(1, 'upa', 'Maria Silva', 4, 'Atendimento ágil na triagem.')
    insertAvaliacao.run(2, 'cristo', 'Ana Paula', 5, 'Hospital bem estruturado com equipe atenciosa.')
    insertAvaliacao.run(3, 'ubs-pontal', 'João Paulo', 5, 'Atendimento humanizado no posto do Pontal.')
  }
}

inicializarBanco()

module.exports = inicializarBanco
