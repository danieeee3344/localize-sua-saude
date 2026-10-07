/**
 * Cliente HTTP REST para comunicação exclusiva do Frontend com o Backend (API)
 * O frontend NÃO tem acesso direto ao banco de dados SQLite.
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

function obterHeaders(comAuth = true) {
  const headers = {
    'Content-Type': 'application/json',
  }
  if (comAuth) {
    const token = localStorage.getItem('token')
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
  }
  return headers
}

async function requisicao(endpoint, opcoes = {}) {
  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`
  const config = {
    ...opcoes,
    headers: {
      ...obterHeaders(opcoes.auth !== false),
      ...(opcoes.headers || {}),
    },
  }

  try {
    const res = await fetch(url, config)
    const dados = await res.json().catch(() => ({}))
    if (!res.ok) {
      return {
        ok: false,
        sucesso: false,
        status: res.status,
        erro: dados.erro || dados.mensagem || `Erro na requisição (${res.status})`,
      }
    }
    return { ok: true, sucesso: true, ...dados }
  } catch (erro) {
    console.error(`Falha ao conectar com a API em ${url}:`, erro)
    return {
      ok: false,
      sucesso: false,
      erro: 'Não foi possível conectar ao servidor. Verifique se o backend está em execução.',
    }
  }
}

// ── Unidades de Saúde / Hospitais ─────────────────────────────────

export async function buscarUnidades(filtros = {}) {
  const params = new URLSearchParams()
  if (filtros.q) params.append('q', filtros.q)
  if (filtros.cidade) params.append('cidade', filtros.cidade)
  if (filtros.tipo) params.append('tipo', filtros.tipo)
  if (filtros.atendimento) params.append('atendimento', filtros.atendimento)
  if (filtros.especialidade) params.append('especialidade', filtros.especialidade)
  if (filtros.ordenar) params.append('ordenar', filtros.ordenar)

  const queryStr = params.toString() ? `?${params.toString()}` : ''
  return requisicao(`/unidades${queryStr}`, { auth: false })
}

export async function obterUnidade(id) {
  return requisicao(`/unidades/${id}`, { auth: false })
}

export async function cadastrarNovaUnidade(dados) {
  return requisicao('/unidades', {
    method: 'POST',
    body: JSON.stringify(dados),
  })
}

// ── Medicamentos ──────────────────────────────────────────────────

export async function buscarMedicamentos(filtros = {}) {
  const params = new URLSearchParams()
  if (filtros.q) params.append('q', filtros.q)
  if (filtros.cidade) params.append('cidade', filtros.cidade)
  if (filtros.apenasDisponiveis) params.append('apenasDisponiveis', 'true')

  const queryStr = params.toString() ? `?${params.toString()}` : ''
  return requisicao(`/medicamentos${queryStr}`, { auth: false })
}

export async function obterMedicamento(id) {
  return requisicao(`/medicamentos/${id}`, { auth: false })
}

// ── Agendamentos ──────────────────────────────────────────────────

export async function listarAgendamentos(usuarioId) {
  const params = usuarioId ? `?usuarioId=${usuarioId}` : ''
  return requisicao(`/agendamentos${params}`)
}

export async function criarAgendamento(dados) {
  return requisicao('/agendamentos', {
    method: 'POST',
    body: JSON.stringify(dados),
  })
}

export async function cancelarAgendamento(id, usuarioId) {
  return requisicao(`/agendamentos/${id}`, {
    method: 'DELETE',
    body: JSON.stringify({ usuarioId }),
  })
}

// ── Avaliações ────────────────────────────────────────────────────

export async function listarAvaliacoes(unidadeId, status = 'aprovado') {
  const params = new URLSearchParams()
  if (unidadeId) params.append('unidadeId', unidadeId)
  if (status) params.append('status', status)
  const queryStr = params.toString() ? `?${params.toString()}` : ''
  return requisicao(`/avaliacoes${queryStr}`, { auth: false })
}

export async function enviarAvaliacao(dados) {
  return requisicao('/avaliacoes', {
    method: 'POST',
    body: JSON.stringify(dados),
  })
}

export async function moderarAvaliacao(id, status) {
  return requisicao(`/avaliacoes/${id}/moderar`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  })
}

// ── Autenticação ──────────────────────────────────────────────────

export async function autenticarUsuario(email, senha) {
  return requisicao('/auth/login', {
    method: 'POST',
    auth: false,
    body: JSON.stringify({ email, senha }),
  })
}

export async function cadastrarUsuario(dados) {
  return requisicao('/auth/cadastro', {
    method: 'POST',
    auth: false,
    body: JSON.stringify(dados),
  })
}

export async function obterUsuarioAtual() {
  return requisicao('/auth/me')
}

// ── Leads / Contato ───────────────────────────────────────────────

export async function enviarContatoLead(dados) {
  // A origem do frontend e listada como confiavel no .env ORIGENS_CONFIAVEIS
  // Nao e necessario enviar a API key — o backend autentica pela origem da requisicao
  return requisicao('/leads', {
    method: 'POST',
    body: JSON.stringify(dados),
    auth: false,
  })
}
