'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      });
      const data = await res.json();

      if (data.ok && data.usuario && data.token) {
        localStorage.setItem('loggedIn', 'true');
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', String(data.usuario.id));
        localStorage.setItem('userPerfil', data.usuario.perfil);
        localStorage.setItem('userName', data.usuario.nome);
        router.push('/');
      } else {
        setError(`⚠️ ${data.erro || 'Erro ao autenticar.'}`);
      }
    } catch {
      setError('⚠️ Falha de conexão com o banco de dados.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper" style={{ paddingTop: '100px', minHeight: '80vh' }}>
      <div className="login-container">
        <Image
          src="/logomarca.png"
          alt="Logo Localize Sua Saúde"
          width={160}
          height={60}
          style={{ margin: '0 auto 16px', display: 'block' }}
        />
        <h1 style={{ fontSize: '1.4rem', marginBottom: '8px', color: '#1a2a6c', textAlign: 'center' }}>
          Localize Sua Saúde
        </h1>
        <p style={{ fontSize: '.85rem', color: '#4a5568', marginBottom: '20px', textAlign: 'center' }}>
          Faça login para agendar consultas e avaliar unidades
        </p>

        <form id="login-form" onSubmit={handleLogin} noValidate>
          <div className="input-group" style={{ marginBottom: '14px' }}>
            <label htmlFor="user" style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}>
              E-mail ou Usuário
            </label>
            <input
              type="text"
              id="user"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              autoComplete="username"
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1.5px solid #d1d9e6',
                borderRadius: '8px',
              }}
            />
          </div>

          <div className="input-group password-group" style={{ marginBottom: '14px' }}>
            <label htmlFor="pass" style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}>
              Senha
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              id="pass"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1.5px solid #d1d9e6',
                borderRadius: '8px',
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                marginTop: '6px',
                fontSize: '.8rem',
                background: 'none',
                border: 'none',
                color: '#0051bb',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              {showPassword ? '🙈 Ocultar senha' : '👁 Mostrar senha'}
            </button>
          </div>

          {error && (
            <div
              id="login-error"
              role="alert"
              style={{
                color: '#e53e3e',
                fontSize: '.85rem',
                marginBottom: '12px',
                padding: '10px',
                background: '#fff5f5',
                borderRadius: '6px',
                border: '1px solid #fed7d7',
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              background: '#0051bb',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {loading ? 'Verificando...' : 'ENTRAR'}
          </button>
        </form>

        <div
          style={{
            marginTop: '16px',
            padding: '12px',
            background: '#f0f4ff',
            borderRadius: '8px',
            fontSize: '.8rem',
            color: '#4a5568',
            textAlign: 'left',
          }}
        >
          <strong>Perfis disponíveis:</strong>
          <br />
          🧑 Cidadão · 👩‍⚕️ Atendente · 👔 Gestor
        </div>

        <Link
          href="/cadastro"
          className="signup-link"
          style={{ display: 'block', marginTop: '16px', textAlign: 'center', fontSize: '.9rem' }}
        >
          Não tem conta? Cadastre-se gratuitamente →
        </Link>
      </div>
    </div>
  );
}
