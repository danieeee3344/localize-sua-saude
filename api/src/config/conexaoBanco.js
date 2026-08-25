const Database = require('better-sqlite3')
const path = require('path')
const fs = require('fs')
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') })

const pastaDb = path.resolve(__dirname, '../../db')
if (!fs.existsSync(pastaDb)) fs.mkdirSync(pastaDb, { recursive: true })
const caminhoBanco = path.join(pastaDb, 'landing.db')

const banco = new Database(caminhoBanco)

banco.pragma('journal_mode = WAL')
banco.pragma('foreign_keys = ON')

module.exports = banco
