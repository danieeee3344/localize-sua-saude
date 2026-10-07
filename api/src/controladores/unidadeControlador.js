const banco = require('../config/conexaoBanco')

/**
 * Listagem e busca de unidades de saúde com múltiplos filtros (RF01, RF02)
 */
function listarUnidades(req, res) {
  try {
    const { q, cidade, tipo, atendimento, especialidade, ordenar } = req.query

    let sql = 'SELECT * FROM unidades WHERE aprovado = 1'
    const params = []

    if (q && q.trim()) {
      const termo = `%${q.trim()}%`
      sql += ' AND (nome LIKE ? OR especialidades LIKE ? OR address LIKE ? OR convenios LIKE ?)'
      params.push(termo, termo, termo, termo)
    }

    if (cidade && cidade.trim()) {
      const cid = cidade.trim().toLowerCase()
      if (cid.includes('barra')) {
        sql += ' AND cidade LIKE ?'
        params.push('%Barra%')
      } else if (cid.includes('pontal')) {
        sql += ' AND cidade LIKE ?'
        params.push('%Pontal%')
      } else if (cid.includes('aragar')) {
        sql += ' AND cidade LIKE ?'
        params.push('%Aragar%')
      } else {
        sql += ' AND cidade LIKE ?'
        params.push(`%${cidade.trim()}%`)
      }
    }

    if (tipo && tipo.trim()) {
      sql += ' AND tipo = ?'
      params.push(tipo.trim().toLowerCase())
    }

    if (atendimento && atendimento.trim()) {
      sql += ' AND atend = ?'
      params.push(atendimento.trim().toLowerCase())
    }

    if (especialidade && especialidade.trim()) {
      sql += ' AND especialidades LIKE ?'
      params.push(`%${especialidade.trim()}%`)
    }

    if (ordenar === 'rating') {
      sql += ' ORDER BY rating DESC, rating_count DESC'
    } else {
      sql += ' ORDER BY nome ASC'
    }

    const unidades = banco.prepare(sql).all(...params)

    return res.json({
      ok: true,
      total: unidades.length,
      unidades,
    })
  } catch (erro) {
    console.error('Erro ao listar unidades:', erro.message)
    return res.status(500).json({ ok: false, erro: 'Erro interno ao consultar unidades.' })
  }
}

/**
 * Obter perfil detalhado de uma unidade de saúde (RF03)
 */
function obterUnidadePorId(req, res) {
  try {
    const { id } = req.params

    const unidade = banco.prepare('SELECT * FROM unidades WHERE id = ?').get(id)
    if (!unidade) {
      return res.status(404).json({ ok: false, erro: 'Unidade de saúde não encontrada.' })
    }

    // Buscar avaliações aprovadas
    const avaliacoes = banco
      .prepare(`
        SELECT a.id, a.usuario_id, a.autor_nome, a.nota, a.comentario, a.criado_em, u.nome as usuario_nome
        FROM avaliacoes a
        LEFT JOIN usuarios u ON a.usuario_id = u.id
        WHERE a.unidade_id = ? AND a.status = 'aprovado'
        ORDER BY a.criado_em DESC
      `)
      .all(id)

    return res.json({
      ok: true,
      unidade: {
        ...unidade,
        avaliacoes,
      },
    })
  } catch (erro) {
    console.error('Erro ao buscar unidade:', erro.message)
    return res.status(500).json({ ok: false, erro: 'Erro interno ao consultar dados da unidade.' })
  }
}

/**
 * Cadastrar nova unidade de saúde (Parceiro / Admin - RN01)
 */
function cadastrarUnidade(req, res) {
  try {
    const {
      id,
      nome,
      tipo,
      cidade,
      atend,
      address,
      hours,
      convenios,
      especialidades,
      phone,
      whatsapp,
      maps_url,
      latitude,
      longitude,
      image,
    } = req.body

    if (!nome || !tipo || !cidade || !atend || !address || !phone || !especialidades) {
      return res.status(400).json({ ok: false, erro: 'Preencha todos os campos obrigatórios da unidade.' })
    }

    const idGerado =
      id ||
      nome
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')

    banco
      .prepare(`
        INSERT OR REPLACE INTO unidades (
          id, nome, tipo, cidade, atend, rating, rating_count, image, address, hours, convenios,
          especialidades, phone, whatsapp, maps_url, latitude, longitude, aprovado
        ) VALUES (?, ?, ?, ?, ?, 5.0, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
      `)
      .run(
        idGerado,
        nome.trim(),
        tipo.trim().toLowerCase(),
        cidade.trim(),
        atend.trim().toLowerCase(),
        image || '/logomarca.png',
        address.trim(),
        hours || 'Seg–Sex: 08h–18h',
        convenios || '',
        especialidades.trim(),
        phone.trim(),
        whatsapp ? whatsapp.trim() : phone.trim().replace(/\D/g, ''),
        maps_url || `https://maps.google.com/?q=${encodeURIComponent(nome + ' ' + cidade)}`,
        latitude ? Number(latitude) : -15.892,
        longitude ? Number(longitude) : -52.261
      )

    return res.status(201).json({
      ok: true,
      mensagem: 'Unidade cadastrada com sucesso!',
      id: idGerado,
    })
  } catch (erro) {
    console.error('Erro ao cadastrar unidade:', erro.message)
    return res.status(500).json({ ok: false, erro: 'Erro interno ao salvar unidade de saúde.' })
  }
}

module.exports = { listarUnidades, obterUnidadePorId, cadastrarUnidade }
