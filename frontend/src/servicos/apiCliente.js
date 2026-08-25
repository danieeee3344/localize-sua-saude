// Cliente de API centralizado
// Segurança: nenhuma chave é embutida no bundle do navegador.
// O POST /api/leads é autorizado pela origem da requisição
// (ORIGENS_CONFIAVEIS no .env do backend).

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

async function requisitar(caminho, opcoes = {}) {
  const resposta = await fetch(`${BASE_URL}${caminho}`, {
    ...opcoes,
    headers: {
      'Content-Type': 'application/json',
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
