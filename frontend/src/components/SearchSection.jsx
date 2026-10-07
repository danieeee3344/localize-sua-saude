import { useState } from 'react'

export default function SearchSection({ onSearchSubmit }) {
  const [q, setQ] = useState('')
  const [cep, setCep] = useState('')
  const [cidade, setCidade] = useState('')
  const [tipo, setTipo] = useState('')
  const [atendimento, setAtendimento] = useState('')
  const [especialidade, setEspecialidade] = useState('')
  const [status, setStatus] = useState('')

  const handleCepMask = (e) => {
    let v = e.target.value.replace(/\D/g, '')
    if (v.length > 5) v = v.slice(0, 5) + '-' + v.slice(5, 8)
    setCep(v)
  }

  const getLocation = () => {
    if (!navigator.geolocation) {
      setStatus('Seu navegador não suporta geolocalização. Informe seu CEP abaixo.')
      return
    }
    setStatus('Obtendo sua localização geográfica...')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(5)
        const lon = pos.coords.longitude.toFixed(5)
        setStatus(`Localização obtida. Exibindo unidades próximas.`)
        if (onSearchSubmit) {
          onSearchSubmit({ q, cidade, tipo, atendimento, especialidade, lat, lon })
        }
      },
      () => {
        setStatus('Não foi possível obter sua localização automática. Selecione a cidade ou informe seu CEP.')
      }
    )
  }

  const searchByCep = async () => {
    const digits = cep.replace(/\D/g, '')
    if (digits.length !== 8) {
      setStatus('Digite um CEP válido com 8 dígitos.')
      return
    }
    setStatus('Consultando CEP...')
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`)
      const data = await res.json()
      if (data.erro) {
        setStatus('CEP não localizado.')
        return
      }

      setStatus(`Localidade: ${data.logradouro || 'Centro'}, ${data.localidade} - ${data.uf}`)

      let cidFiltro = ''
      const loc = data.localidade.toLowerCase()
      if (loc.includes('barra')) cidFiltro = 'Barra do Garças'
      else if (loc.includes('pontal')) cidFiltro = 'Pontal do Araguaia'
      else if (loc.includes('aragar')) cidFiltro = 'Aragarças'
      else cidFiltro = data.localidade

      setCidade(cidFiltro)

      if (onSearchSubmit) {
        onSearchSubmit({ q, cidade: cidFiltro, tipo, atendimento, especialidade, cep: digits })
      }
    } catch {
      setStatus('Falha ao consultar o CEP. Verifique sua conexão.')
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (onSearchSubmit) {
      onSearchSubmit({ q, cidade, tipo, atendimento, especialidade })
    }
  }

  const handleResetFilters = () => {
    setQ('')
    setCep('')
    setCidade('')
    setTipo('')
    setAtendimento('')
    setEspecialidade('')
    setStatus('')
    if (onSearchSubmit) {
      onSearchSubmit({})
    }
  }

  return (
    <section className="search-section" aria-label="Busca de unidades de saúde">
      <form id="search-form" onSubmit={handleSearch}>
        <div className="search-bar-wrapper">
          <input
            type="search"
            id="search-input"
            name="q"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nome da unidade, especialidade ou endereço..."
            aria-label="Buscar unidades de saúde"
            autoComplete="off"
          />
          <button
            type="button"
            id="btn-geoloc"
            onClick={getLocation}
            title="Usar minha localização GPS"
            aria-label="Usar minha localização GPS"
          >
            Usar GPS
          </button>
          <button type="submit" className="btn-search" aria-label="Buscar estabelecimentos">
            Buscar
          </button>
        </div>

        <div className="cep-row">
          <label htmlFor="cep-input">Consultar por CEP:</label>
          <input
            type="text"
            id="cep-input"
            name="cep"
            placeholder="78600-000"
            maxLength={9}
            aria-label="Buscar por CEP"
            value={cep}
            onChange={handleCepMask}
          />
          <button type="button" onClick={searchByCep} className="btn-cep">
            Consultar CEP
          </button>

          {(q || cidade || tipo || atendimento || especialidade || cep) && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="btn-limpar-filtros"
              title="Limpar filtros aplicados"
            >
              Limpar Filtros
            </button>
          )}
        </div>

        <div className="filters-row" role="group" aria-label="Filtros de busca">
          <div className="filter-group">
            <label htmlFor="filter-city">Cidade</label>
            <select
              id="filter-city"
              name="cidade"
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
              aria-label="Filtrar por cidade"
            >
              <option value="">Todas as cidades</option>
              <option value="Barra do Garças">Barra do Garças (MT)</option>
              <option value="Pontal do Araguaia">Pontal do Araguaia (MT)</option>
              <option value="Aragarças">Aragarças (GO)</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="filter-type">Tipo de Estabelecimento</label>
            <select
              id="filter-type"
              name="tipo"
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              aria-label="Filtrar por tipo"
            >
              <option value="">Todos os tipos</option>
              <option value="hospital">Hospital</option>
              <option value="ubs">UBS / UPA</option>
              <option value="clinica">Clínica Médica</option>
              <option value="laboratorio">Laboratório</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="filter-atendimento">Atendimento</label>
            <select
              id="filter-atendimento"
              name="atendimento"
              value={atendimento}
              onChange={(e) => setAtendimento(e.target.value)}
              aria-label="Filtrar por tipo de atendimento"
            >
              <option value="">Todos</option>
              <option value="sus">SUS (Público)</option>
              <option value="particular">Particular</option>
              <option value="convenio">Convênios</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="filter-especialidade">Especialidade</label>
            <select
              id="filter-especialidade"
              name="especialidade"
              value={especialidade}
              onChange={(e) => setEspecialidade(e.target.value)}
              aria-label="Filtrar por especialidade"
            >
              <option value="">Todas as especialidades</option>
              <option value="Clínica Geral">Clínica Geral</option>
              <option value="Cardiologia">Cardiologia</option>
              <option value="Ortopedia">Ortopedia</option>
              <option value="Pediatria">Pediatria</option>
              <option value="Ginecologia">Ginecologia</option>
              <option value="Neurologia">Neurologia</option>
              <option value="Urgência">Urgência e Emergência</option>
            </select>
          </div>
        </div>
      </form>

      {status && (
        <div id="location-status" className="location-status" aria-live="polite" role="status">
          {status}
        </div>
      )}
    </section>
  )
}
