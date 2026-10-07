const banco = require('../config/conexaoBanco')

/**
 * Listar agendamentos do usuário autenticado (RSF-003)
 */
function listarAgendamentos(req, res) {
  try {
    const usuarioId = req.usuario?.id || req.query.usuarioId

    if (!usuarioId) {
      return res.status(400).json({ ok: false, erro: 'ID do usuário não informado.' })
    }

    const agendamentos = banco
      .prepare(`
        SELECT * FROM agendamentos
        WHERE usuario_id = ?
        ORDER BY data DESC, horario DESC
      `)
      .all(Number(usuarioId))

    return res.json({
      ok: true,
      total: agendamentos.length,
      agendamentos,
    })
  } catch (erro) {
    console.error('Erro ao listar agendamentos:', erro.message)
    return res.status(500).json({ ok: false, erro: 'Erro interno ao consultar agendamentos.' })
  }
}

/**
 * Criar novo agendamento de consulta (RSF-004)
 */
function criarAgendamento(req, res) {
  try {
    const usuarioId = req.usuario?.id || req.body.usuarioId
    const { unidade, especialidade, data, horario, paciente, cpf, telefone, observacoes } = req.body

    if (!usuarioId) {
      return res.status(401).json({ ok: false, erro: 'É necessário estar autenticado para agendar consultas.' })
    }

    if (!unidade || !especialidade || !data || !horario || !paciente) {
      return res.status(400).json({
        ok: false,
        erro: 'Preencha todos os campos obrigatórios: unidade, especialidade, data, horário e nome do paciente.',
      })
    }

    const resultado = banco
      .prepare(`
        INSERT INTO agendamentos (
          usuario_id, unidade, especialidade, data, horario, paciente, cpf, telefone, observacoes, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmado')
      `)
      .run(
        Number(usuarioId),
        unidade.trim(),
        especialidade.trim(),
        data.trim(),
        horario.trim(),
        paciente.trim(),
        cpf ? cpf.trim() : null,
        telefone ? telefone.trim() : null,
        observacoes ? observacoes.trim() : null
      )

    return res.status(201).json({
      ok: true,
      mensagem: 'Agendamento confirmado com sucesso!',
      id: resultado.lastInsertRowid,
      agendamento: {
        id: resultado.lastInsertRowid,
        usuario_id: Number(usuarioId),
        unidade,
        especialidade,
        data,
        horario,
        paciente,
        status: 'confirmado',
      },
    })
  } catch (erro) {
    console.error('Erro ao criar agendamento:', erro.message)
    return res.status(500).json({ ok: false, erro: 'Erro interno ao processar agendamento.' })
  }
}

/**
 * Cancelar agendamento (RSF-005 - Soft Delete)
 */
function cancelarAgendamento(req, res) {
  try {
    const { id } = req.params
    const usuarioId = req.usuario?.id || req.body.usuarioId

    if (!usuarioId) {
      return res.status(401).json({ ok: false, erro: 'Acesso negado. Usuário não identificado.' })
    }

    const agendamento = banco.prepare('SELECT * FROM agendamentos WHERE id = ?').get(id)
    if (!agendamento) {
      return res.status(404).json({ ok: false, erro: 'Agendamento não encontrado.' })
    }

    // Permitir cancelamento se for o próprio usuário ou gestor
    const isOwner = Number(agendamento.usuario_id) === Number(usuarioId)
    const isGestor = req.usuario?.perfil === 'gestor' || req.usuario?.perfil === 'atendente'

    if (!isOwner && !isGestor) {
      return res.status(403).json({ ok: false, erro: 'Você não tem permissão para cancelar este agendamento.' })
    }

    banco.prepare("UPDATE agendamentos SET status = 'cancelado' WHERE id = ?").run(id)

    return res.json({
      ok: true,
      mensagem: 'Agendamento cancelado com sucesso.',
      id: Number(id),
    })
  } catch (erro) {
    console.error('Erro ao cancelar agendamento:', erro.message)
    return res.status(500).json({ ok: false, erro: 'Erro interno ao cancelar agendamento.' })
  }
}

module.exports = { listarAgendamentos, criarAgendamento, cancelarAgendamento }
