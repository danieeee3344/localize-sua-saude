// ── Unidades de Saúde (hospitaisprox.html → React) ─────────────────────────
// Segurança aplicada:
//  - Parâmetros de URL: chaves whitelisted e valores numéricos validados
//    (lat/lon limitados ao intervalo válido) — evita injeção via querystring.
//  - Nenhum innerHTML/dangerouslySetInnerHTML: todo conteúdo dinâmico é
//    renderizado como texto (React escapa automaticamente).
//  - Links externos sempre com rel="noopener noreferrer".
//  - Avaliações exigem sessão ativa (RN02) e têm limite de caracteres.

import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useAutenticacao } from '../contextos/AutenticacaoContexto'

const CIDADES = { barra: 'Barra do Garças', pontal: 'Pontal do Araguaia', aragarcas: 'Aragarças' }
const ROTULO_ATEND = { sus: 'SUS / Público', particular: 'Particular', convenio: 'Particular / Convênio' }

const UNIDADES = [
  {
    id: 'medbarra',
    nome: 'Medbarra',
    tipoRotulo: 'Hospital / Clínica',
    cidade: 'barra',
    tipo: 'hospital',
    atendimento: 'particular',
    avaliacao: 4.3,
    avaliacoesQtd: 47,
    foto: '/IMG_3476-1024x819.webp',
    fotoAlt: 'Foto do Medbarra – Hospital e Centro de Saúde',
    mapsUrl: 'https://maps.app.goo.gl/s9R9YMNeahVURfL68',
    telefone: '+556634221500',
    telefoneExibicao: '(66) 3422-1500',
    whatsapp: '556634221500',
    lat: -15.8906,
    lon: -52.2566,
    info: [
      'Endereço: Av. Mato Grosso, 1200 – Barra do Garças, MT',
      'Horário: Seg–Sex: 07h–18h | Sáb: 07h–12h',
      'Convênios: Particular, Unimed, Bradesco Saúde',
      'Especialidades: Clínica Geral, Cardiologia, Ortopedia, Pediatria'
    ]
  },
  {
    id: 'upa',
    nome: 'UPA 24h',
    tipoRotulo: 'UPA – Urgência e Emergência',
    cidade: 'barra',
    tipo: 'ubs',
    atendimento: 'sus',
    avaliacao: 3.8,
    avaliacoesQtd: 112,
    foto: '/12782.jpeg',
    fotoAlt: 'Foto da UPA 24 horas – Barra do Garças',
    mapsUrl: 'https://maps.app.goo.gl/D6An35nCSWtYyJx9A',
    telefone: '+556634000000',
    telefoneExibicao: '(66) 3400-0000',
    whatsapp: '556634000000',
    lat: -15.8950,
    lon: -52.2600,
    info: [
      'Endereço: Rua das Acácias, s/n – Barra do Garças, MT',
      'Horário: 24 horas, todos os dias',
      'Convênios: 100% SUS – Atendimento Gratuito',
      'Especialidades: Urgência, Emergência, Clínica Geral'
    ]
  },
  {
    id: 'cristo',
    nome: 'Hospital Cristo Redentor',
    tipoRotulo: 'Hospital',
    cidade: 'barra',
    tipo: 'hospital',
    atendimento: 'convenio',
    avaliacao: 4.1,
    avaliacoesQtd: 89,
    foto: '/unnamed.jpg',
    fotoAlt: 'Foto do Hospital Cristo Redentor',
    mapsUrl: 'https://maps.app.goo.gl/2FoqoV4Ud8wNbwPs7',
    telefone: '+556634001234',
    telefoneExibicao: '(66) 3400-1234',
    whatsapp: '556634001234',
    lat: -15.8880,
    lon: -52.2540,
    info: [
      'Endereço: Rod. BR-070, Km 3 – Barra do Garças, MT',
      'Horário: Seg–Sex: 06h–20h | Sáb: 07h–14h',
      'Convênios: Particular, Sul América, Cassi, Geap',
      'Especialidades: Cirurgia, Neurologia, Ginecologia, Ortopedia'
    ]
  }
]

const CHAVE_PENDENTES = 'lss_unidades_pendentes'
const CHAVE_AVALIACOES = 'lss_avaliacoes'

function lerLista(chave) {
  try {
    const lista = JSON.parse(localStorage.getItem(chave))
    return Array.isArray(lista) ? lista : []
  } catch {
    return []
  }
}

// Lê número da querystring de forma segura (intervalo obrigatório)
function numeroSeguro(valor, min, max) {
  const n = Number.parseFloat(valor)
  if (!Number.isFinite(n) || n < min || n > max) return null
  return n
}

function iconePin(cor) {
  return L.divIcon({
    className: 'lss-pin',
    html: `<svg width="30" height="42" viewBox="0 0 30 42" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M15 0C6.7 0 0 6.7 0 15c0 10.5 15 27 15 27s15-16.5 15-27C30 6.7 23.3 0 15 0z" fill="${cor}"/><circle cx="15" cy="14" r="6" fill="#fff"/></svg>`,
    iconSize: [30, 42],
    iconAnchor: [15, 42],
    popupAnchor: [0, -40]
  })
}

export default function UnidadesSaude() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { usuario } = useAutenticacao()
  const mapRef = useRef(null)
  const mapaRef = useRef(null)
  const marcadoresRef = useRef([])

  // Filtros vindos da URL (chaves whitelisted)
  const [busca, setBusca] = useState(() => String(params.get('q') || '').slice(0, 80))
  const [cidade, setCidade] = useState(() => (params.get('cidade') in CIDADES ? params.get('cidade') : ''))
  const [tipo, setTipo] = useState(() => ['hospital', 'clinica', 'laboratorio', 'ubs'].includes(params.get('tipo')) ? params.get('tipo') : '')
  const [atendimento, setAtendimento] = useState(() => ['sus', 'particular', 'convenio'].includes(params.get('atendimento')) ? params.get('atendimento') : '')
  const [ordenacao, setOrdenacao] = useState('name')
  const [modalAberto, setModalAberto] = useState(false)

  const [notas, setNotas] = useState({})
  const [comentarios, setComentarios] = useState({})
  const [avisoAvaliacao, setAvisoAvaliacao] = useState('')
  const [avisoUnidade, setAvisoUnidade] = useState('')
  const [erroFormUnidade, setErroFormUnidade] = useState('')
  const [formUnidade, setFormUnidade] = useState({
    nome: '', tipo: '', cidade: '', atendimento: '', endereco: '',
    telefone: '', whatsapp: '', horario: '', convenios: '',
    especialidades: '', responsavel: '', email: ''
  })

  const filtradas = useMemo(() => {
    const q = busca.trim().toLowerCase().slice(0, 80)
    const lista = UNIDADES.filter(u => {
      const correspondeQ = !q || u.nome.toLowerCase().includes(q) || u.tipoRotulo.toLowerCase().includes(q)
      const correspondeCidade = !cidade || u.cidade === cidade
      const correspondeTipo = !tipo || u.tipo === tipo
      const correspondeAtend = !atendimento || u.atendimento === atendimento
      return correspondeQ && correspondeCidade && correspondeTipo && correspondeAtend
    })
    if (ordenacao === 'rating') lista.sort((a, b) => b.avaliacao - a.avaliacao)
    else lista.sort((a, b) => a.nome.localeCompare(b.nome))
    return lista
  }, [busca, cidade, tipo, atendimento, ordenacao])

  // Mapa Leaflet (RF02) — criado uma única vez; marcadores seguem os filtros
  useEffect(() => {
    if (mapaRef.current || !mapRef.current) return
    const mapa = L.map(mapRef.current, { scrollWheelZoom: false }).setView([-15.8906, -52.2566], 13)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19
    }).addTo(mapa)

    // Localização do usuário vinda da URL — validada com limites físicos
    const lat = numeroSeguro(params.get('lat'), -90, 90)
    const lon = numeroSeguro(params.get('lon'), -180, 180)
    if (lat !== null && lon !== null) {
      L.marker([lat, lon], { icon: iconePin('#00bb38') }).addTo(mapa).bindPopup('Você está aqui')
      mapa.setView([lat, lon], 14)
    }
    mapa.on('focus click', () => mapa.scrollWheelZoom.enable())
    mapaRef.current = mapa
    return () => { mapa.remove(); mapaRef.current = null; marcadoresRef.current = [] }
  }, [params])

  // Marcadores das unidades visíveis — popups via textContent (sem HTML injetado)
  useEffect(() => {
    const mapa = mapaRef.current
    if (!mapa) return
    marcadoresRef.current.forEach(m => mapa.removeLayer(m))
    marcadoresRef.current = filtradas.map(u => {
      const popup = document.createElement('div')
      const titulo = document.createElement('strong')
      titulo.textContent = u.nome
      const detalhe = document.createElement('div')
      detalhe.textContent = u.tipoRotulo
      popup.append(titulo, detalhe)
      return L.marker([u.lat, u.lon], { icon: iconePin('#0051bb') })
        .addTo(mapa)
        .bindPopup(popup)
    })
  }, [filtradas])

  const selecionarNota = (id, nota) => setNotas(a => ({ ...a, [id]: nota }))

  const enviarAvaliacao = (unidade) => {
    setAvisoAvaliacao('')
    // RN02: apenas usuários autenticados avaliam
    if (!usuario) {
      setAvisoAvaliacao('Faça login para avaliar.')
      navigate('/login', { state: { de: '/hospitais' } })
      return
    }
    const nota = Number(notas[unidade.id]) || 0
    if (nota < 1 || nota > 5) {
      setAvisoAvaliacao('Selecione uma nota de 1 a 5 estrelas.')
      return
    }
    const comentario = String(comentarios[unidade.id] || '').trim().slice(0, 300)
    const avaliacoes = lerLista(CHAVE_AVALIACOES)
    avaliacoes.push({
      unidade: unidade.nome,
      nota,
      comentario,
      usuario: usuario.email,
      status: 'pendente',
      criadoEm: new Date().toISOString()
    })
    localStorage.setItem(CHAVE_AVALIACOES, JSON.stringify(avaliacoes))
    setNotas(a => ({ ...a, [unidade.id]: 0 }))
    setComentarios(a => ({ ...a, [unidade.id]: '' }))
    setAvisoAvaliacao('Avaliação enviada! Ela será moderada antes de ser publicada.')
  }

  const abrirModal = () => {
    setErroFormUnidade('')
    setModalAberto(true)
  }

  const fecharModal = () => {
    setModalAberto(false)
    setFormUnidade({
      nome: '', tipo: '', cidade: '', atendimento: '', endereco: '',
      telefone: '', whatsapp: '', horario: '', convenios: '',
      especialidades: '', responsavel: '', email: ''
    })
  }

  const atualizarCampo = (campo) => (e) => {
    let valor = e.target.value
    if (['nome', 'endereco', 'responsavel', 'convenios', 'especialidades', 'horario'].includes(campo)) valor = valor.slice(0, 120)
    if (['telefone', 'whatsapp'].includes(campo)) valor = valor.replace(/[^\d()+\-\s]/g, '').slice(0, 20)
    setFormUnidade(f => ({ ...f, [campo]: valor }))
  }

  const cadastrarUnidade = (e) => {
    e.preventDefault()
    setErroFormUnidade('')
    const f = formUnidade
    const obrigatoriosOk = f.nome.trim() && f.tipo && f.cidade && f.atendimento &&
      f.endereco.trim() && f.responsavel.trim() && f.email.trim()

    if (!obrigatoriosOk) {
      setErroFormUnidade('Preencha todos os campos obrigatórios (*).')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) {
      setErroFormUnidade('Informe um e-mail válido.')
      return
    }

    // RN01: unidade entra como "pendente" até aprovação do gestor.
    // Os campos são salvos como dados (não markup), então não há risco de XSS.
    const pendentes = lerLista(CHAVE_PENDENTES)
    pendentes.push({
      id: `u_${Date.now()}`,
      nome: f.nome.trim(),
      tipo: f.tipo,
      cidade: f.cidade,
      atendimento: f.atendimento,
      endereco: f.endereco.trim(),
      telefone: f.telefone.trim(),
      whatsapp: f.whatsapp.trim(),
      horario: f.horario.trim(),
      convenios: f.convenios.trim(),
      especialidades: f.especialidades.trim(),
      responsavel: f.responsavel.trim(),
      email: f.email.trim(),
      status: 'pendente',
      cadastradoEm: new Date().toISOString()
    })
    localStorage.setItem(CHAVE_PENDENTES, JSON.stringify(pendentes))
    fecharModal()
    setAvisoUnidade(`Cadastro enviado! A unidade "${f.nome.trim()}" aguarda aprovação do administrador (RN01).`)
  }

  useEffect(() => {
    const aoTeclar = (e) => { if (e.key === 'Escape') fecharModal() }
    document.addEventListener('keydown', aoTeclar)
    return () => document.removeEventListener('keydown', aoTeclar)
  }, [])

  return (
    <div className="main-container">
      <img src="/image-removebg-preview.png" width="180" alt="Logo Localize Sua Saúde" />
      <h1>Unidades de Saúde próximas</h1>

      <form
        className="filter-form"
        aria-label="Filtros de busca"
        onSubmit={(e) => e.preventDefault()}
      >
        <div className="filter-inline">
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value.slice(0, 80))}
            placeholder="Nome ou especialidade..."
            aria-label="Buscar unidade"
            maxLength={80}
          />
          <select value={cidade} onChange={(e) => setCidade(e.target.value)} aria-label="Cidade">
            <option value="">Todas as cidades</option>
            <option value="barra">Barra do Garças</option>
            <option value="pontal">Pontal do Araguaia</option>
            <option value="aragarcas">Aragarças</option>
          </select>
          <select value={tipo} onChange={(e) => setTipo(e.target.value)} aria-label="Tipo">
            <option value="">Todos os tipos</option>
            <option value="hospital">Hospital</option>
            <option value="clinica">Clínica</option>
            <option value="laboratorio">Laboratório</option>
            <option value="ubs">UBS / UPA</option>
          </select>
          <select value={atendimento} onChange={(e) => setAtendimento(e.target.value)} aria-label="Atendimento">
            <option value="">Todos</option>
            <option value="sus">Público / SUS</option>
            <option value="particular">Particular</option>
            <option value="convenio">Convênio</option>
          </select>
          <button type="submit" className="btn-filter">Filtrar</button>
        </div>
      </form>

      <div id="map" ref={mapRef} role="application" aria-label="Mapa de unidades de saúde" />
      <p className="map-hint">Clique nos marcadores do mapa para ver detalhes da unidade.</p>

      <div className="results-header">
        <span id="results-count" aria-live="polite">
          {filtradas.length} unidade{filtradas.length !== 1 ? 's' : ''} encontrada{filtradas.length !== 1 ? 's' : ''}
        </span>
        <div className="sort-group">
          <label htmlFor="sort-select">Ordenar por:</label>
          <select id="sort-select" value={ordenacao} onChange={(e) => setOrdenacao(e.target.value)} aria-label="Ordenar resultados">
            <option value="name">Nome (A-Z)</option>
            <option value="rating">Avaliação</option>
          </select>
          <button className="btn-add-unit" onClick={abrirModal}>+ Cadastrar Unidade</button>
        </div>
      </div>

      {avisoUnidade && (
        <div className="form-msg form-msg--sucesso" role="status">{avisoUnidade}</div>
      )}

      <div className="hospitals-grid" role="list" aria-label="Lista de unidades de saúde">
        {filtradas.map(u => (
          <article className="hospital-card" role="listitem" key={u.id}>
            <div className={`card-badge ${u.atendimento === 'sus' ? 'card-badge--public' : 'card-badge--private'}`}>
              {ROTULO_ATEND[u.atendimento]}
            </div>
            <a href={u.mapsUrl} target="_blank" rel="noopener noreferrer" aria-label={`Ver ${u.nome} no Google Maps`}>
              <img src={u.foto} alt={u.fotoAlt} loading="lazy" width="600" height="360" />
            </a>
            <div className="card-body">
              <h2 className="card-title">{u.nome}</h2>
              <p className="card-type">{u.tipoRotulo}</p>

              <div className="card-rating" aria-label={`Avaliação: ${String(u.avaliacao).replace('.', ',')} de 5 estrelas`}>
                <span className="stars" aria-hidden="true">★★★★☆</span>
                <span className="rating-value">{String(u.avaliacao).replace('.', ',')}</span>
                <span className="rating-count">({u.avaliacoesQtd} avaliações)</span>
              </div>

              <ul className="card-info" aria-label="Informações da unidade">
                {u.info.map((linha, i) => <li key={i}>{linha}</li>)}
              </ul>

              <div className="card-actions">
                <a href={`tel:${u.telefone}`} className="btn-action btn-call" aria-label={`Ligar para o ${u.nome}`}>
                  Ligar Agora
                </a>
                <a
                  href={`https://wa.me/${u.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-action btn-whatsapp"
                  aria-label={`WhatsApp do ${u.nome}`}
                >
                  WhatsApp
                </a>
                <a href={u.mapsUrl} target="_blank" rel="noopener noreferrer" className="btn-action btn-map" aria-label={`Ver rota para o ${u.nome}`}>
                  Ver Rota
                </a>
              </div>

              <details className="rating-section">
                <summary>Avaliar esta unidade</summary>
                <div className="rating-form">
                  {!usuario && (
                    <p className="rating-note">
                      Faça <Link to="/login">login</Link> para avaliar (RN02).
                    </p>
                  )}
                  {avisoAvaliacao && (
                    <p className="rating-note" role="status">{avisoAvaliacao}</p>
                  )}
                  <div className="star-picker" role="group" aria-label="Selecione uma nota de 1 a 5">
                    {[1, 2, 3, 4, 5].map(nota => (
                      <button
                        key={nota}
                        type="button"
                        className={notas[u.id] >= nota ? 'selected' : ''}
                        onClick={() => selecionarNota(u.id, nota)}
                        aria-label={`${nota} estrela${nota > 1 ? 's' : ''}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={comentarios[u.id] || ''}
                    onChange={(e) => setComentarios(c => ({ ...c, [u.id]: e.target.value.slice(0, 300) }))}
                    placeholder="Conte como foi seu atendimento..."
                    rows={3}
                    maxLength={300}
                    aria-label={`Comentário sobre o ${u.nome}`}
                  />
                  <button onClick={() => enviarAvaliacao(u)} className="btn-submit-rating">
                    Enviar avaliação
                  </button>
                </div>
              </details>
            </div>
          </article>
        ))}
      </div>

      {filtradas.length === 0 && (
        <div className="no-results" role="alert">
          <p>Nenhuma unidade encontrada com os filtros selecionados.</p>
          <button
            className="btn-reset"
            onClick={() => { setBusca(''); setCidade(''); setTipo(''); setAtendimento('') }}
          >
            Limpar filtros
          </button>
        </div>
      )}

      {modalAberto && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title" onClick={(e) => { if (e.target === e.currentTarget) fecharModal() }}>
          <div className="modal-box">
            <div className="modal-header">
              <h2 id="modal-title">Cadastrar Nova Unidade de Saúde</h2>
              <button className="modal-close" onClick={fecharModal} aria-label="Fechar">X</button>
            </div>
            <p className="modal-note">
              Após o cadastro, a unidade aguardará aprovação do administrador antes de ser publicada (RN01).
            </p>
            <form onSubmit={cadastrarUnidade} noValidate>
              <div className="modal-grid">
                <div className="form-group">
                  <label htmlFor="u-nome">Nome da Unidade *</label>
                  <input id="u-nome" value={formUnidade.nome} onChange={atualizarCampo('nome')} placeholder="Ex: Clínica Vida Saudável" maxLength={120} required />
                </div>
                <div className="form-group">
                  <label htmlFor="u-tipo">Tipo *</label>
                  <select id="u-tipo" value={formUnidade.tipo} onChange={atualizarCampo('tipo')} required>
                    <option value="">Selecione...</option>
                    <option value="hospital">Hospital</option>
                    <option value="clinica">Clínica</option>
                    <option value="laboratorio">Laboratório</option>
                    <option value="ubs">UBS / UPA</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="u-cidade">Cidade *</label>
                  <select id="u-cidade" value={formUnidade.cidade} onChange={atualizarCampo('cidade')} required>
                    <option value="">Selecione...</option>
                    <option value="barra">Barra do Garças</option>
                    <option value="pontal">Pontal do Araguaia</option>
                    <option value="aragarcas">Aragarças</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="u-atend">Tipo de Atendimento *</label>
                  <select id="u-atend" value={formUnidade.atendimento} onChange={atualizarCampo('atendimento')} required>
                    <option value="">Selecione...</option>
                    <option value="sus">Público / SUS</option>
                    <option value="particular">Particular</option>
                    <option value="convenio">Convênio</option>
                  </select>
                </div>
                <div className="form-group form-group--full">
                  <label htmlFor="u-endereco">Endereço Completo *</label>
                  <input id="u-endereco" value={formUnidade.endereco} onChange={atualizarCampo('endereco')} placeholder="Rua, número, bairro, cidade - UF" maxLength={120} required />
                </div>
                <div className="form-group">
                  <label htmlFor="u-telefone">Telefone</label>
                  <input id="u-telefone" type="tel" value={formUnidade.telefone} onChange={atualizarCampo('telefone')} placeholder="(66) 9 0000-0000" />
                </div>
                <div className="form-group">
                  <label htmlFor="u-whats">WhatsApp</label>
                  <input id="u-whats" type="tel" value={formUnidade.whatsapp} onChange={atualizarCampo('whatsapp')} placeholder="(66) 9 0000-0000" />
                </div>
                <div className="form-group">
                  <label htmlFor="u-horario">Horário de Funcionamento</label>
                  <input id="u-horario" value={formUnidade.horario} onChange={atualizarCampo('horario')} placeholder="Ex: Seg-Sex 08h-18h" maxLength={120} />
                </div>
                <div className="form-group">
                  <label htmlFor="u-convenios">Convênios Aceitos</label>
                  <input id="u-convenios" value={formUnidade.convenios} onChange={atualizarCampo('convenios')} placeholder="Ex: Unimed, Bradesco, SUS" maxLength={120} />
                </div>
                <div className="form-group form-group--full">
                  <label htmlFor="u-espec">Especialidades Oferecidas</label>
                  <input id="u-espec" value={formUnidade.especialidades} onChange={atualizarCampo('especialidades')} placeholder="Ex: Clínico Geral, Cardiologia, Pediatria" maxLength={120} />
                </div>
                <div className="form-group form-group--full">
                  <label htmlFor="u-responsavel">Nome do Responsável *</label>
                  <input id="u-responsavel" value={formUnidade.responsavel} onChange={atualizarCampo('responsavel')} placeholder="Nome completo do responsável" maxLength={120} required />
                </div>
                <div className="form-group">
                  <label htmlFor="u-email">E-mail de Contato *</label>
                  <input id="u-email" type="email" value={formUnidade.email} onChange={atualizarCampo('email')} placeholder="contato@unidade.com" maxLength={120} required />
                </div>
              </div>

              {erroFormUnidade && <div className="form-error" role="alert">{erroFormUnidade}</div>}

              <div className="modal-actions">
                <button type="button" className="btn-cancel-modal" onClick={fecharModal}>Cancelar</button>
                <button type="submit" className="btn-submit-unit">Enviar para Aprovação</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
