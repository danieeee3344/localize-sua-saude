const banco = require('../config/conexaoBanco')
const { validarLead } = require('../utilitarios/validadores')

// Cadastra um novo lead no banco de dados
function cadastrarLead(req, res) {
  const { valido, erros, dados } = validarLead(req.body)
  if (!valido) return res.status(422).json({ sucesso: false, mensagem: 'Dados inválidos.', erros })

  try {
    const inserir = banco.prepare(
      'INSERT INTO leads (nome_completo, email, telefone_whatsapp, mensagem) VALUES (?, ?, ?, ?)'
    )
    inserir.run(dados.nome_completo, dados.email, dados.telefone_whatsapp, dados.mensagem)
    res.status(201).json({ sucesso: true, mensagem: 'Os dados do formulário foram enviados com sucesso!' })
  } catch (erro) {
    console.error('Erro ao cadastrar lead:', erro.message)
    res.status(500).json({ sucesso: false, mensagem: 'Erro interno ao salvar os dados.' })
  }
}

// Lista leads cadastrados com paginação (limites seguros)
function listarLeads(req, res) {
  const pagina = Math.max(1, parseInt(req.query.pagina) || 1)
  // Limite máximo de 100 registros por página
  const limite = Math.min(100, Math.max(1, parseInt(req.query.limite) || 20))
  const offset = (pagina - 1) * limite

  try {
    const total = banco.prepare('SELECT COUNT(*) AS total FROM leads').get()
    const leads = banco.prepare('SELECT * FROM leads ORDER BY data_cadastro DESC LIMIT ? OFFSET ?').all(limite, offset)
    res.json({ sucesso: true, dados: leads, total: total.total, pagina, limite })
  } catch (erro) {
    console.error('Erro ao listar leads:', erro.message)
    res.status(500).json({ sucesso: false, mensagem: 'Erro interno ao consultar os dados.' })
  }
}

module.exports = { cadastrarLead, listarLeads }
