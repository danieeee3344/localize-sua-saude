const banco = require('../config/conexaoBanco')

/**
 * Consulta de disponibilidade de medicamentos em unidades de saúde da região
 */
function listarMedicamentos(req, res) {
  try {
    const { q, cidade, apenasDisponiveis } = req.query

    let sqlMeds = 'SELECT * FROM medicamentos WHERE 1=1'
    const paramsMeds = []

    if (q && q.trim()) {
      sqlMeds += ' AND (nome LIKE ? OR categoria LIKE ? OR principio_ativo LIKE ?)'
      const termo = `%${q.trim()}%`
      paramsMeds.push(termo, termo, termo)
    }

    sqlMeds += ' ORDER BY nome ASC'
    const medicamentos = banco.prepare(sqlMeds).all(...paramsMeds)

    // Para cada medicamento, obter a disponibilidade por unidade
    const resultado = medicamentos.map((med) => {
      let sqlDisp = `
        SELECT d.id, d.disponivel, d.qtd, d.tipo, d.atualizado,
               u.id as unidade_id, u.nome as unidade_nome, u.cidade, u.phone, u.whatsapp, u.address
        FROM disponibilidade_medicamentos d
        JOIN unidades u ON d.unidade_id = u.id
        WHERE d.medicamento_id = ?
      `
      const paramsDisp = [med.id]

      if (cidade && cidade.trim()) {
        sqlDisp += ' AND u.cidade LIKE ?'
        paramsDisp.push(`%${cidade.trim()}%`)
      }

      if (apenasDisponiveis === 'true' || apenasDisponiveis === '1') {
        sqlDisp += ' AND d.disponivel = 1'
      }

      sqlDisp += ' ORDER BY d.disponivel DESC, u.nome ASC'
      const estoques = banco.prepare(sqlDisp).all(...paramsDisp)

      return {
        ...med,
        estoques,
      }
    })

    return res.json({
      ok: true,
      total: resultado.length,
      medicamentos: resultado,
    })
  } catch (erro) {
    console.error('Erro ao listar medicamentos:', erro.message)
    return res.status(500).json({ ok: false, erro: 'Erro interno ao consultar medicamentos.' })
  }
}

/**
 * Detalhes de um medicamento por ID
 */
function obterMedicamentoPorId(req, res) {
  try {
    const { id } = req.params

    const med = banco.prepare('SELECT * FROM medicamentos WHERE id = ?').get(id)
    if (!med) {
      return res.status(404).json({ ok: false, erro: 'Medicamento não encontrado.' })
    }

    const estoques = banco
      .prepare(`
        SELECT d.id, d.disponivel, d.qtd, d.tipo, d.atualizado,
               u.id as unidade_id, u.nome as unidade_nome, u.cidade, u.phone, u.whatsapp, u.address
        FROM disponibilidade_medicamentos d
        JOIN unidades u ON d.unidade_id = u.id
        WHERE d.medicamento_id = ?
        ORDER BY d.disponivel DESC, u.nome ASC
      `)
      .all(id)

    return res.json({
      ok: true,
      medicamento: {
        ...med,
        estoques,
      },
    })
  } catch (erro) {
    console.error('Erro ao consultar medicamento:', erro.message)
    return res.status(500).json({ ok: false, erro: 'Erro interno ao consultar medicamento.' })
  }
}

module.exports = { listarMedicamentos, obterMedicamentoPorId }
