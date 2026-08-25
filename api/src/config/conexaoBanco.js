const Database = require('better-sqlite3')
const path = require('path')
const fs = require('fs')

// Restringe permissões de TODOS os arquivos criados por este processo (A4)
process.umask(0o077)

const pastaDb = path.resolve(__dirname, '../../db')
if (!fs.existsSync(pastaDb)) fs.mkdirSync(pastaDb, { recursive: true })

// Restringe permissões da pasta do banco: apenas dono (rwx------)
try {
  fs.chmodSync(pastaDb, 0o700)
} catch { /* em alguns sistemas de arquivos pode falhar silenciosamente */ }

const caminhoBanco = path.join(pastaDb, 'landing.db')

const banco = new Database(caminhoBanco)

// Restringe permissões do banco E dos arquivos WAL/SHM (contêm os mesmos dados)
for (const sufixo of ['', '-wal', '-shm']) {
  try {
    const arquivo = caminhoBanco + sufixo
    if (fs.existsSync(arquivo)) fs.chmodSync(arquivo, 0o600)
  } catch { /* idem */ }
}

banco.pragma('journal_mode = WAL')
banco.pragma('foreign_keys = ON')

// Fecha a conexão com segurança no encerramento
function fecharBanco() {
  try {
    banco.close()
  } catch (erro) {
    console.error('Erro ao fechar banco:', erro.message)
  }
}

module.exports = banco
module.exports.fecharBanco = fecharBanco
