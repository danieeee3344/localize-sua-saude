// Cliente de API centralizado — injeta a chave pública em todas as requisições

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
const CHAVE_PUBLICA = import.meta.env.VITE_API_KEY_PUBLICA

async function requisitar(caminho, opcoes = {}) {
  const resposta = await fetch(`${BASE_URL}${caminho}`, {
    ...opcoes,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': CHAVE_PUBLICA,
      ...opcoes.headers
    }
  })
  return resposta.json()
}

export function cadastrarLead(dados) {
  return requisitar('/leads', {
    method: 'POST',
    body: JSON.stringify(dados)
  })
}
