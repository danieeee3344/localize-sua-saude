'use client';

import { useState } from 'react';
import Image from 'next/image';

type Hospital = {
  id: string;
  name: string;
  type: string;
  city: string;
  atend: string;
  rating: number;
  ratingCount: number;
  image: string;
  address: string;
  hours: string;
  convenios: string;
  especialidades: string;
  phone: string;
  whatsapp: string;
  mapsUrl: string;
};

const initialHospitals: Hospital[] = [
  {
    id: 'medbarra',
    name: 'Medbarra',
    type: 'hospital',
    city: 'barra',
    atend: 'particular',
    rating: 4.3,
    ratingCount: 47,
    image: '/medbarra.webp',
    address: 'Av. Mato Grosso, 1200 – Barra do Garças, MT',
    hours: 'Seg–Sex: 07h–18h | Sáb: 07h–12h',
    convenios: 'Particular, Unimed, Bradesco Saúde',
    especialidades: 'Clínica Geral, Cardiologia, Ortopedia, Pediatria',
    phone: '+556634221500',
    whatsapp: '556634221500',
    mapsUrl: 'https://maps.app.goo.gl/s9R9YMNeahVURfL68',
  },
  {
    id: 'upa',
    name: 'UPA 24h',
    type: 'ubs',
    city: 'barra',
    atend: 'sus',
    rating: 3.8,
    ratingCount: 112,
    image: '/upa.jpeg',
    address: 'Rua das Acácias, s/n – Barra do Garças, MT',
    hours: '24 horas, todos os dias',
    convenios: '100% SUS – Atendimento Gratuito',
    especialidades: 'Urgência, Emergência, Clínica Geral',
    phone: '+556634000000',
    whatsapp: '556634000000',
    mapsUrl: 'https://maps.app.goo.gl/D6An35nCSWtYyJx9A',
  },
  {
    id: 'cristo',
    name: 'Hospital Cristo Redentor',
    type: 'hospital',
    city: 'barra',
    atend: 'particular',
    rating: 4.1,
    ratingCount: 89,
    image: '/cristo.jpg',
    address: 'Rod. BR-070, Km 3 – Barra do Garças, MT',
    hours: 'Seg–Sex: 06h–20h | Sáb: 07h–14h',
    convenios: 'Particular, Sul América, Cassi, Geap',
    especialidades: 'Cirurgia, Neurologia, Ginecologia, Ortopedia',
    phone: '+556634001234',
    whatsapp: '556634001234',
    mapsUrl: 'https://maps.app.goo.gl/2FoqoV4Ud8wNbwPs7',
  },
];

export default function HospitaisPage() {
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [type, setType] = useState('');
  const [atend, setAtend] = useState('');
  const [sort, setSort] = useState('name');
  const [selectedRatings, setSelectedRatings] = useState<Record<string, number>>({});
  const [comments, setComments] = useState<Record<string, string>>({});

  const filteredHospitals = initialHospitals
    .filter((h) => {
      const matchQ =
        !search ||
        h.name.toLowerCase().includes(search.toLowerCase()) ||
        h.especialidades.toLowerCase().includes(search.toLowerCase());
      const matchCity = !city || h.city === city;
      const matchType = !type || h.type === type;
      const matchAtend = !atend || h.atend === atend;
      return matchQ && matchCity && matchType && matchAtend;
    })
    .sort((a, b) => {
      if (sort === 'rating') return b.rating - a.rating;
      return a.name.localeCompare(b.name);
    });

  const submitRating = async (unidadeId: string) => {
    const loggedIn = localStorage.getItem('loggedIn') === 'true';
    const userId = localStorage.getItem('userId');

    if (!loggedIn || !userId) {
      alert('Para avaliar, você precisa fazer login primeiro.');
      return;
    }

    const nota = selectedRatings[unidadeId] || 0;
    const comentario = comments[unidadeId] || '';

    if (!nota) {
      alert('Por favor, selecione uma nota de 1 a 5 estrelas.');
      return;
    }

    try {
      const res = await fetch('/api/avaliacoes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ unidadeId, nota, comentario }),
      });
      const data = await res.json();
      if (data.ok) {
        alert(`Avaliação registrada no SQLite!\nNota: ${nota} estrelas\nComentário: "${comentario}"`);
      } else {
        alert(`Erro: ${data.erro}`);
      }
    } catch {
      alert('Falha ao enviar avaliação.');
    }
  };

  return (
    <div className="main-container" style={{ paddingTop: '100px', maxWidth: '1000px', margin: '0 auto', padding: '100px 16px 40px' }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <Image
          src="/logomarca.png"
          width={180}
          height={60}
          alt="Logo Localize Sua Saúde"
          style={{ margin: '0 auto 12px' }}
        />
        <h1>Unidades de Saúde próximas</h1>
      </div>

      <form className="filter-form" onSubmit={(e) => e.preventDefault()}>
        <div className="filter-inline">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Nome ou especialidade..."
          />
          <select value={city} onChange={(e) => setCity(e.target.value)}>
            <option value="">Todas as cidades</option>
            <option value="barra">Barra do Garças</option>
            <option value="pontal">Pontal do Araguaia</option>
            <option value="aragarcas">Aragarças</option>
          </select>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">Todos os tipos</option>
            <option value="hospital">Hospital</option>
            <option value="clinica">Clínica</option>
            <option value="laboratorio">Laboratório</option>
            <option value="ubs">UBS / UPA</option>
          </select>
          <select value={atend} onChange={(e) => setAtend(e.target.value)}>
            <option value="">Todos</option>
            <option value="sus">Público / SUS</option>
            <option value="particular">Particular</option>
            <option value="convenio">Convênio</option>
          </select>
        </div>
      </form>

      <div className="results-header" style={{ display: 'flex', justifyContent: 'space-between', margin: '20px 0' }}>
        <span>{filteredHospitals.length} unidades encontradas</span>
        <div>
          <label htmlFor="sort-select">Ordenar por: </label>
          <select id="sort-select" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="name">Nome (A-Z)</option>
            <option value="rating">Avaliação</option>
          </select>
        </div>
      </div>

      <div className="hospitals-grid" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {filteredHospitals.map((h) => (
          <article key={h.id} className="hospital-card" style={{ background: '#fff', padding: '20px', borderRadius: '12px' }}>
            <div className={`card-badge ${h.atend === 'sus' ? 'card-badge--public' : 'card-badge--private'}`}>
              {h.atend === 'sus' ? 'SUS / Público' : 'Particular / Convênio'}
            </div>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '10px' }}>
              <Image
                src={h.image}
                alt={h.name}
                width={200}
                height={140}
                style={{ borderRadius: '8px', objectFit: 'cover' }}
              />
              <div className="card-body" style={{ flex: 1 }}>
                <h2 className="card-title">{h.name}</h2>
                <div className="card-rating">
                  <span className="stars">★★★★☆</span>
                  <span className="rating-value"> {h.rating}</span>
                  <span className="rating-count"> ({h.ratingCount} avaliações)</span>
                </div>
                <ul className="card-info" style={{ listStyle: 'none', padding: 0, margin: '10px 0' }}>
                  <li><strong>Endereço:</strong> {h.address}</li>
                  <li><strong>Horário:</strong> {h.hours}</li>
                  <li><strong>Convênios:</strong> {h.convenios}</li>
                  <li><strong>Especialidades:</strong> {h.especialidades}</li>
                </ul>
                <div className="card-actions" style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <a href={`tel:${h.phone}`} className="btn-action btn-call">
                    Ligar Agora
                  </a>
                  <a
                    href={`https://wa.me/${h.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-action btn-whatsapp"
                  >
                    WhatsApp
                  </a>
                  <a href={h.mapsUrl} target="_blank" rel="noopener noreferrer" className="btn-action btn-map">
                    Ver Rota
                  </a>
                </div>

                <details className="rating-section" style={{ marginTop: '16px' }}>
                  <summary style={{ cursor: 'pointer', fontWeight: 600, color: '#0051bb' }}>
                    Avaliar esta unidade (Salva no SQLite)
                  </summary>
                  <div style={{ padding: '10px', background: '#f9fa0015', marginTop: '8px', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setSelectedRatings((prev) => ({ ...prev, [h.id]: star }))}
                          style={{
                            fontSize: '1.2rem',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: star <= (selectedRatings[h.id] || 0) ? '#ffb400' : '#ccc',
                          }}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                    <textarea
                      rows={2}
                      value={comments[h.id] || ''}
                      onChange={(e) => setComments((prev) => ({ ...prev, [h.id]: e.target.value }))}
                      placeholder="Deixe seu comentário sobre a unidade..."
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
                    />
                    <button
                      onClick={() => submitRating(h.id)}
                      className="btn-submit-rating"
                      style={{
                        marginTop: '6px',
                        padding: '6px 12px',
                        background: '#0051bb',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                      }}
                    >
                      Enviar avaliação
                    </button>
                  </div>
                </details>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
