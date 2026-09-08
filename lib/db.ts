/**
 * lib/db.ts — Camada de banco de dados SQLite para Localize Sua Saúde
 * Usa sql.js (SQLite via WebAssembly) com persistência em arquivo no servidor.
 * Roda APENAS no servidor (API Routes do Next.js).
 */

import initSqlJs, { Database } from 'sql.js';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const DB_PATH = path.join(process.cwd(), 'data', 'lss.db');

let _db: Database | null = null;

/** Garante que o diretório de dados exista */
function ensureDataDir() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

/** Persiste o banco no disco */
function persist(db: Database) {
  const data = db.export();
  ensureDataDir();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

/** Hash SHA-256 da senha */
export function hashSenha(senha: string): string {
  return crypto.createHash('sha256').update(senha).digest('hex');
}

/** Inicializa/carrega o banco SQLite */
export async function getDB(): Promise<Database> {
  if (_db) return _db;

  const SQL = await initSqlJs();

  ensureDataDir();

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    _db = new SQL.Database(fileBuffer);
  } else {
    _db = new SQL.Database();
  }

  // Schema
  _db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      nome      TEXT    NOT NULL,
      email     TEXT    NOT NULL UNIQUE COLLATE NOCASE,
      senha     TEXT    NOT NULL,
      perfil    TEXT    NOT NULL DEFAULT 'cidadao',
      criado_em TEXT    DEFAULT (datetime('now'))
    )
  `);

  _db.run(`
    CREATE TABLE IF NOT EXISTS agendamentos (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id  INTEGER NOT NULL REFERENCES usuarios(id),
      unidade     TEXT    NOT NULL,
      especialidade TEXT  NOT NULL,
      data        TEXT    NOT NULL,
      horario     TEXT    NOT NULL,
      paciente    TEXT    NOT NULL,
      cpf         TEXT,
      telefone    TEXT,
      observacoes TEXT,
      status      TEXT    NOT NULL DEFAULT 'confirmado',
      criado_em   TEXT    DEFAULT (datetime('now'))
    )
  `);

  _db.run(`
    CREATE TABLE IF NOT EXISTS avaliacoes (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id  INTEGER NOT NULL REFERENCES usuarios(id),
      unidade_id  TEXT    NOT NULL,
      nota        INTEGER NOT NULL CHECK (nota BETWEEN 1 AND 5),
      comentario  TEXT,
      criado_em   TEXT    DEFAULT (datetime('now'))
    )
  `);

  // Usuários padrão para testes
  const defaults = [
    { nome: 'Maria Silva',   email: 'cidadao@teste.com',   senha: '123456', perfil: 'cidadao'   },
    { nome: 'Ana Atendente', email: 'atendente@teste.com', senha: '123456', perfil: 'atendente' },
    { nome: 'Dr. Gestor',    email: 'gestor@teste.com',    senha: '123456', perfil: 'gestor'    },
  ];
  for (const u of defaults) {
    _db.run(
      `INSERT OR IGNORE INTO usuarios (nome, email, senha, perfil) VALUES (?, ?, ?, ?)`,
      [u.nome, u.email, hashSenha(u.senha), u.perfil]
    );
  }

  persist(_db);
  return _db;
}

// ── API de usuários ──────────────────────────────────────────────────────────

export type UsuarioRow = {
  id: number;
  nome: string;
  email: string;
  perfil: string;
  criado_em: string;
};

export async function cadastrar(
  nome: string,
  email: string,
  senha: string,
  perfil = 'cidadao'
): Promise<{ ok: boolean; erro?: string }> {
  const db = await getDB();

  if (!nome || !email || !senha)
    return { ok: false, erro: 'Preencha todos os campos obrigatórios.' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return { ok: false, erro: 'E-mail inválido.' };
  if (senha.length < 6)
    return { ok: false, erro: 'A senha deve ter pelo menos 6 caracteres.' };

  try {
    db.run(
      `INSERT INTO usuarios (nome, email, senha, perfil) VALUES (?, ?, ?, ?)`,
      [nome.trim(), email.trim().toLowerCase(), hashSenha(senha), perfil]
    );
    persist(db);
    return { ok: true };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '';
    if (msg.includes('UNIQUE'))
      return { ok: false, erro: 'Este e-mail já está cadastrado.' };
    return { ok: false, erro: 'Erro interno ao salvar os dados.' };
  }
}

export async function autenticar(
  email: string,
  senha: string
): Promise<{ ok: boolean; usuario?: UsuarioRow; erro?: string }> {
  const db = await getDB();

  if (!email || !senha)
    return { ok: false, erro: 'Informe e-mail e senha.' };

  const stmt = db.prepare(
    `SELECT id, nome, email, perfil, criado_em FROM usuarios
     WHERE email = ? COLLATE NOCASE AND senha = ?`
  );
  stmt.bind([email.trim().toLowerCase(), hashSenha(senha)]);

  if (stmt.step()) {
    const row = stmt.getAsObject() as unknown as UsuarioRow;
    stmt.free();
    return { ok: true, usuario: row };
  }
  stmt.free();
  return { ok: false, erro: 'E-mail ou senha incorretos.' };
}

// ── API de agendamentos ──────────────────────────────────────────────────────

export type AgendamentoRow = {
  id: number;
  usuario_id: number;
  unidade: string;
  especialidade: string;
  data: string;
  horario: string;
  paciente: string;
  cpf?: string;
  telefone?: string;
  observacoes?: string;
  status: string;
  criado_em: string;
};

export async function criarAgendamento(
  usuarioId: number,
  dados: Omit<AgendamentoRow, 'id' | 'usuario_id' | 'status' | 'criado_em'>
): Promise<{ ok: boolean; id?: number; erro?: string }> {
  const db = await getDB();
  try {
    db.run(
      `INSERT INTO agendamentos (usuario_id, unidade, especialidade, data, horario, paciente, cpf, telefone, observacoes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        usuarioId,
        dados.unidade,
        dados.especialidade,
        dados.data,
        dados.horario,
        dados.paciente,
        dados.cpf ?? null,
        dados.telefone ?? null,
        dados.observacoes ?? null,
      ]
    );
    persist(db);
    const result = db.exec('SELECT last_insert_rowid() as id');
    const id = result[0]?.values[0]?.[0] as number;
    return { ok: true, id };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '';
    return { ok: false, erro: msg || 'Erro ao criar agendamento.' };
  }
}

export async function listarAgendamentosUsuario(
  usuarioId: number
): Promise<AgendamentoRow[]> {
  const db = await getDB();
  const stmt = db.prepare(
    `SELECT * FROM agendamentos WHERE usuario_id = ? ORDER BY data DESC, horario DESC`
  );
  stmt.bind([usuarioId]);
  const rows: AgendamentoRow[] = [];
  while (stmt.step()) rows.push(stmt.getAsObject() as unknown as AgendamentoRow);
  stmt.free();
  return rows;
}

export async function cancelarAgendamento(
  id: number,
  usuarioId: number
): Promise<{ ok: boolean; erro?: string }> {
  const db = await getDB();
  db.run(
    `UPDATE agendamentos SET status = 'cancelado' WHERE id = ? AND usuario_id = ?`,
    [id, usuarioId]
  );
  persist(db);
  return { ok: true };
}

// ── API de avaliações ────────────────────────────────────────────────────────

export async function criarAvaliacao(
  usuarioId: number,
  unidadeId: string,
  nota: number,
  comentario?: string
): Promise<{ ok: boolean; erro?: string }> {
  const db = await getDB();
  try {
    db.run(
      `INSERT INTO avaliacoes (usuario_id, unidade_id, nota, comentario) VALUES (?, ?, ?, ?)`,
      [usuarioId, unidadeId, nota, comentario ?? null]
    );
    persist(db);
    return { ok: true };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '';
    return { ok: false, erro: msg };
  }
}
