'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState('');
  const [cepInput, setCepInput] = useState('');
  const [city, setCity] = useState('');
  const [type, setType] = useState('');
  const [atendimento, setAtendimento] = useState('');
  const [especialidade, setEspecialidade] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  const getLocation = () => {
    if (!navigator.geolocation) {
      setStatusMsg('Seu navegador não suporta geolocalização. Informe seu CEP.');
      return;
    }
    setStatusMsg('Obtendo sua localização...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(5);
        const lon = pos.coords.longitude.toFixed(5);
        setStatusMsg(`Localização obtida! Lat: ${lat}, Lon: ${lon}`);
        router.push(`/hospitais?lat=${lat}&lon=${lon}`);
      },
      () => {
        setStatusMsg('Não foi possível obter sua localização. Informe seu CEP abaixo.');
      }
    );
  };

  const searchByCep = async () => {
    const cep = cepInput.replace(/\D/g, '');
    if (cep.length !== 8) {
      setStatusMsg('Digite um CEP válido com 8 dígitos.');
      return;
    }
    setStatusMsg('Buscando endereço pelo CEP...');
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();
      if (data.erro) {
        setStatusMsg('CEP não encontrado.');
        return;
      }
      setStatusMsg(`Endereço: ${data.logradouro}, ${data.localidade} - ${data.uf}`);
      router.push(`/hospitais?cep=${cep}&cidade=${encodeURIComponent(data.localidade)}`);
    } catch {
      setStatusMsg('Erro ao consultar o CEP.');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams({
      q: searchInput,
      cidade: city,
      tipo: type,
      atendimento: atendimento,
      especialidade: especialidade,
    });
    router.push(`/hospitais?${params.toString()}`);
  };

  return (
    <main className="intro-section">
      <div className="logo-container">
        <Image
          src="/logomarca.png"
          alt="Logomarca Localize Sua Saúde"
          width={300}
          height={100}
          priority
          style={{ height: 'auto', margin: '0 auto' }}
        />
      </div>

      <div id="intro">
        <h1>Encontre hospitais, clínicas e laboratórios no Vale do Araguaia</h1>
        <p>
          Barra do Garças • Pontal do Araguaia • Aragarças — informações atualizadas, gratuitas e acessíveis para toda a população.
        </p>
      </div>

      <section className="search-section" aria-label="Busca de unidades de saúde">
        <form id="search-form" onSubmit={handleSearch}>
          <div className="search-bar-wrapper">
            <input
              type="search"
              id="search-input"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Buscar por nome, especialidade ou cidade..."
              aria-label="Buscar unidades de saúde"
              autoComplete="off"
            />
            <button
              type="button"
              id="btn-geoloc"
              onClick={getLocation}
              title="Usar minha localização"
              aria-label="Usar minha localização GPS"
            >
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
              value={cepInput}
              onChange={(e) => setCepInput(e.target.value)}
              placeholder="00000-000"
              maxLength={9}
              aria-label="Buscar por CEP"
            />
            <button type="button" onClick={searchByCep} className="btn-cep">
              Buscar por CEP
            </button>
          </div>

          <div className="filters-row" role="group" aria-label="Filtros de busca">
            <div className="filter-group">
              <label htmlFor="filter-city">Cidade</label>
              <select
                id="filter-city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                aria-label="Filtrar por cidade"
              >
                <option value="">Todas as cidades</option>
                <option value="barra">Barra do Garças</option>
                <option value="pontal">Pontal do Araguaia</option>
                <option value="aragarcas">Aragarças</option>
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="filter-type">Tipo</label>
              <select
                id="filter-type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                aria-label="Filtrar por tipo"
              >
                <option value="">Todos os tipos</option>
                <option value="hospital">Hospital</option>
                <option value="clinica">Clínica</option>
                <option value="laboratorio">Laboratório</option>
                <option value="ubs">UBS / UPA</option>
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="filter-atendimento">Atendimento</label>
              <select
                id="filter-atendimento"
                value={atendimento}
                onChange={(e) => setAtendimento(e.target.value)}
                aria-label="Filtrar por tipo de atendimento"
              >
                <option value="">Todos</option>
                <option value="sus">Público / SUS</option>
                <option value="particular">Particular</option>
                <option value="convenio">Convênio</option>
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="filter-especialidade">Especialidade</label>
              <select
                id="filter-especialidade"
                value={especialidade}
                onChange={(e) => setEspecialidade(e.target.value)}
                aria-label="Filtrar por especialidade"
              >
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

      {statusMsg && (
        <div id="location-status" className="location-status" aria-live="polite" role="status">
          {statusMsg}
        </div>
      )}

      <section className="quick-access" aria-label="Acesso rápido">
        <div className="container">
          <Link href="/hospitais" className="btn-bloco" id="btn-ver-unidades">
            Ver Hospitais e Clinicas
          </Link>
          <Link href="/medicamentos" className="btn-bloco btn-bloco--green" id="btn-medicamentos">
            Consultar Medicamentos
          </Link>
          <Link href="/agendamento" className="btn-bloco btn-bloco--teal" id="btn-agendar">
            Agendar Consulta
          </Link>
        </div>
      </section>

      <section className="about-strip" aria-label="Sobre a plataforma">
        <div className="about-strip__inner">
          <div className="about-chip">100% Gratuito para a população</div>
          <div className="about-chip">Georreferenciado</div>
          <div className="about-chip">Acessível (WCAG 2.1)</div>
          <div className="about-chip">Funciona no celular</div>
        </div>
      </section>
    </main>
  );
}
