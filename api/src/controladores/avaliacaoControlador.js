const banco = require('../config/conexaoBanco')

/**
 * Listar avaliações (por unidade ou todas para moderação)
 */
function listarAvaliacoes(req, res) {
  try {
    const { unidadeId, status = 'aprovado' } = req.query

    let sql = `
      SELECT a.*, u.nome as usuario_nome, un.nome as unidade_nome
      FROM avaliacoes a
      LEFT JOIN usuarios u ON a.usuario_id = u.id
      LEFT JOIN unidades un ON a.unidade_id = un.id
      WHERE 1=1
    `
    const params = []

    if (unidadeId) {
      sql += ' AND a.unidade_id = ?'
      params.push(unidadeId)
    }

    if (status && status !== 'todos') {
      sql += ' AND a.status = ?'
      params.push(status)
    }

    sql += ' ORDER BY a.criado_em DESC'

    const avaliacoes = banco.prepare(sql).all(...params)

    return res.json({
      ok: true,
      total: avaliacoes.length,
      avaliacoes,
    })
  } catch (erro) {
    console.error('Erro ao listar avaliações:', erro.message)
    return res.status(500).json({ ok: false, erro: 'Erro interno ao consultar avaliações.' })
  }
}

/**
 * Cadastrar nova avaliação (RF04, RSF-006, RN02)
 */
function criarAvaliacao(req, res) {
  try {
    const usuarioId = req.usuario?.id || req.body.usuarioId
    const { unidadeId, nota, comentario } = req.body

    if (!usuarioId) {
      return res.status(401).json({ ok: false, erro: 'É necessário estar autenticado para registrar uma avaliação.' })
    }

    if (!unidadeId) {
      return res.status(400).json({ ok: false, erro: 'ID da unidade de saúde é obrigatório.' })
    }

    const notaNum = Number(nota)
    if (!notaNum || notaNum < 1 || notaNum > 5) {
      return res.status(400).json({ ok: false, erro: 'A nota da avaliação deve ser um número entre 1 e 5 estrelas.' })
    }

    // Obter nome do usuário
    const usuario = banco.prepare('SELECT nome FROM usuarios WHERE id = ?').get(usuarioId)
    const autorNome = usuario ? usuario.nome : req.usuario?.nome || 'Usuário Anônimo'

    const resultado = banco
      .prepare(`
        INSERT INTO avaliacoes (usuario_id, unidade_id, autor_nome, nota, comentario, status)
        VALUES (?, ?, ?, ?, ?, 'aprovado')
      `)
      .run(Number(usuarioId), String(unidadeId).trim(), autorNome, notaNum, comentario ? String(comentario).trim() : null)

    // Recalcular média e contagem da unidade
    const stats = banco
      .prepare(`
        SELECT AVG(nota) as media, COUNT(*) as total
        FROM avaliacoes
        WHERE unidade_id = ? AND status = 'aprovado'
      `)
      .get(String(unidadeId).trim())

    if (stats && stats.total > 0) {
      banco
        .prepare(`
          UPDATE unidades
          SET rating = ROUND(?, 1), rating_count = ?
          WHERE id = ?
        `)
        .run(stats.media, stats.total, String(unidadeId).trim())
    }

    return res.status(201).json({
      ok: true,
      mensagem: 'Avaliação registrada com sucesso!',
      id: resultado.lastInsertRowid,
      avaliacao: {
        id: resultado.lastInsertRowid,
        usuario_id: Number(usuarioId),
        unidade_id: String(unidadeId).trim(),
        autor_nome: autorNome,
        nota: notaNum,
        comentario,
      },
    })
  } catch (erro) {
    console.error('Erro ao criar avaliação:', erro.message)
    return res.status(500).json({ ok: false, erro: 'Erro interno ao salvar avaliação.' })
  }
}

/**
 * Moderação de Avaliações (RF07)
 */
function moderarAvaliacao(req, res) {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!['aprovado', 'rejeitado', 'pendente'].includes(status)) {
      return res.status(400).json({ ok: false, erro: "Status inválido. Use 'aprovado', 'rejeitado' ou 'pendente'." })
    }

    const avaliacao = banco.prepare('SELECT unidade_id FROM avaliacoes WHERE id = ?').get(id)
    if (!avaliacao) {
      return res.status(404).json({ ok: false, erro: 'Avaliação não encontrada.' })
    }

    banco.prepare('UPDATE avaliacoes SET status = ? WHERE id = ?').run(status, id)

    // Recalcular médias da unidade
    const stats = banco
      .prepare(`
        SELECT AVG(nota) as media, COUNT(*) as total
        FROM avaliacoes
        WHERE unidade_id = ? AND status = 'aprovado'
      `)
      .get(avaliacao.unidade_id)

    banco
      .prepare('UPDATE unidades SET rating = ROUND(COALESCE(?, 5.0), 1), rating_count = ? WHERE id = ?')
      .run(stats ? stats.media : 5.0, stats ? stats.total : 0, avaliacao.unidade_id)

    return res.json({
      ok: true,
      mensagem: `Avaliação atualizada para status '${status}'.`,
    })
  } catch (erro) {
    console.error('Erro na moderação de avaliação:', erro.message)
    return res.status(500).json({ ok: false, erro: 'Erro interno ao moderar avaliação.' })
  }
}

module.exports = { listarAvaliacoes, criarAvaliacao, moderarAvaliacao }
