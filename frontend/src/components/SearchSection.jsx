import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function SearchSection() {
  const [cep, setCep] = useState('')
  const [status, setStatus] = useState('')
  const navigate = useNavigate()

  const handleCepMask = (e) => {
    let v = e.target.value.replace(/\D/g, '')
    if (v.length > 5) v = v.slice(0, 5) + '-' + v.slice(5, 8)
    setCep(v)
  }

  const getLocation = () => {
    if (!navigator.geolocation) {
      setStatus('Seu navegador não suporta geolocalização. Informe seu CEP.')
      return
    }
    setStatus('Obtendo sua localização...')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(5)
        const lon = pos.coords.longitude.toFixed(5)
        setStatus(`Localização obtida! Lat: ${lat}, Lon: ${lon}`)
      },
      () => {
        setStatus('Não foi possível obter sua localização. Informe seu CEP abaixo.')
      }
    )
  }

  const searchByCep = () => {
    const digits = cep.replace(/\D/g, '')
    if (digits.length !== 8) {
      setStatus('Digite um CEP válido com 8 dígitos.')
      return
    }
    setStatus('Buscando endereço pelo CEP...')
    fetch(`https://viacep.com.br/ws/${digits}/json/`)
      .then(r => r.json())
      .then(data => {
        if (data.erro) { setStatus('CEP não encontrado.'); return }
        setStatus(`Endereço: ${data.logradouro}, ${data.localidade} - ${data.uf}`)
      })
      .catch(() => { setStatus('Erro ao consultar o CEP.') })
  }

  const handleSearch = (e) => {
    e.preventDefault()
    // Valores trafegam como URLSearchParams (codificados); a página de
    // destino revalida cada parâmetro antes de usar.
    const dados = new FormData(e.currentTarget)
    const params = new URLSearchParams()
    const q = String(dados.get('q') || '').trim().slice(0, 80)
    if (q) params.set('q', q)
    for (const chave of ['cidade', 'tipo', 'atendimento', 'especialidade']) {
      const valor = String(dados.get(chave) || '')
      if (valor) params.set(chave, valor)
    }
    navigate(`/hospitais?${params.toString()}`)
  }

  return (
    <>
      <section className="search-section" aria-label="Busca de unidades de saúde">
        <form id="search-form" onSubmit={handleSearch}>
          <div className="search-bar-wrapper">
            <input
              type="search"
              id="search-input"
              name="q"
              placeholder="Buscar por nome, especialidade ou cidade..."
              aria-label="Buscar unidades de saúde"
              autoComplete="off"
            />
            <button type="button" id="btn-geoloc" onClick={getLocation} title="Usar minha localização" aria-label="Usar minha localização GPS">
              Usar minha localização
            </button>
            <button type="submit" className="btn-search" aria-label="Buscar">
              Buscar
            </button>
          </div>

          <div className="cep-row">
            <label htmlFor="cep-input">Ou informe seu CEP:</label>
            <input
              type="text"
              id="cep-input"
              name="cep"
              placeholder="00000-000"
              maxLength={9}
              aria-label="Buscar por CEP"
              value={cep}
              onChange={handleCepMask}
            />
            <button type="button" onClick={searchByCep} className="btn-cep">
              Buscar por CEP
            </button>
          </div>

          <div className="filters-row" role="group" aria-label="Filtros de busca">
            <div className="filter-group">
              <label htmlFor="filter-city">Cidade</label>
              <select id="filter-city" name="cidade" aria-label="Filtrar por cidade">
                <option value="">Todas as cidades</option>
                <option value="barra">Barra do Garças</option>
                <option value="pontal">Pontal do Araguaia</option>
                <option value="aragarcas">Aragarças</option>
              </select>
            </div>
            <div className="filter-group">
              <label htmlFor="filter-type">Tipo</label>
              <select id="filter-type" name="tipo" aria-label="Filtrar por tipo">
                <option value="">Todos os tipos</option>
                <option value="hospital">Hospital</option>
                <option value="clinica">Clínica</option>
                <option value="laboratorio">Laboratório</option>
                <option value="ubs">UBS / UPA</option>
              </select>
            </div>
            <div className="filter-group">
              <label htmlFor="filter-atendimento">Atendimento</label>
              <select id="filter-atendimento" name="atendimento" aria-label="Filtrar por tipo de atendimento">
                <option value="">Todos</option>
                <option value="sus">Público / SUS</option>
                <option value="particular">Particular</option>
                <option value="convenio">Convênio</option>
              </select>
            </div>
            <div className="filter-group">
              <label htmlFor="filter-especialidade">Especialidade</label>
              <select id="filter-especialidade" name="especialidade" aria-label="Filtrar por especialidade">
                <option value="">Todas</option>
                <option value="clinico">Clínico Geral</option>
                <option value="cardiologia">Cardiologia</option>
                <option value="ortopedia">Ortopedia</option>
                <option value="pediatria">Pediatria</option>
                <option value="ginecologia">Ginecologia</option>
                <option value="neurologia">Neurologia</option>
                <option value="urgencia">Urgência / Emergência</option>
              </select>
            </div>
          </div>
        </form>
      </section>

      <div id="location-status" className="location-status" aria-live="polite" role="status">
        {status}
      </div>
    </>
  )
}
