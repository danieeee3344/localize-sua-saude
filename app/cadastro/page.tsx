'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CadastroPage() {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [perfil, setPerfil] = useState('cidadao');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [termos, setTermos] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: 'sucesso' | 'erro' } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);

    if (!termos) {
      setMsg({ text: '⚠️ Você precisa aceitar os termos e condições.', type: 'erro' });
      return;
    }

    if (senha !== confirmarSenha) {
      setMsg({ text: '⚠️ As senhas não conferem.', type: 'erro' });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/cadastro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, senha, perfil }),
      });
      const data = await res.json();

      if (data.ok) {
        setMsg({
          text: '✅ Conta criada com sucesso! Redirecionando para o login...',
          type: 'sucesso',
        });
        setTimeout(() => router.push('/login'), 2000);
      } else {
        setMsg({ text: `⚠️ ${data.erro}`, type: 'erro' });
      }
    } catch {
      setMsg({ text: '⚠️ Erro inesperado ao cadastrar. Tente novamente.', type: 'erro' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper" style={{ paddingTop: '100px', minHeight: '80vh' }}>
      <div className="login-container signup-container">
        <Image
          src="/logomarca.png"
          alt="Logo Localize Sua Saúde"
          width={140}
          height={50}
          style={{ margin: '0 auto 12px', display: 'block' }}
        />
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <h1 style={{ fontSize: '1.4rem', color: '#1a2a6c' }}>Crie sua conta</h1>
          <p style={{ fontSize: '.85rem', color: '#4a5568' }}>
            Preencha os campos abaixo para se cadastrar
          </p>
        </div>

        {msg && (
          <div
            role="alert"
            style={{
              fontSize: '.85rem',
              padding: '10px 14px',
              borderRadius: '8px',
              marginBottom: '14px',
              background: msg.type === 'sucesso' ? '#f0fff4' : '#fff5f5',
              border: `1px solid ${msg.type === 'sucesso' ? '#9ae6b4' : '#fed7d7'}`,
              color: msg.type === 'sucesso' ? '#276749' : '#c53030',
            }}
          >
            {msg.text}
          </div>
        )}

        <form onSubmit={handleCadastro} noValidate>
          <div className="input-group" style={{ marginBottom: '12px' }}>
            <label htmlFor="nome" style={{ display: 'block', fontWeight: 600, fontSize: '.9rem' }}>
              Nome Completo
            </label>
            <input
              type="text"
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Digite seu nome completo"
              required
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1.5px solid #d1d9e6',
                borderRadius: '8px',
              }}
            />
          </div>

          <div className="input-group" style={{ marginBottom: '12px' }}>
            <label htmlFor="email" style={{ display: 'block', fontWeight: 600, fontSize: '.9rem' }}>
              E-mail
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1.5px solid #d1d9e6',
                borderRadius: '8px',
              }}
            />
          </div>

          <div className="input-group" style={{ marginBottom: '12px' }}>
            <label htmlFor="perfil" style={{ display: 'block', fontWeight: 600, fontSize: '.9rem' }}>
              Perfil de acesso
            </label>
            <select
              id="perfil"
              value={perfil}
              onChange={(e) => setPerfil(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1.5px solid #d1d9e6',
                borderRadius: '8px',
                background: '#fff',
              }}
            >
              <option value="cidadao">🧑 Cidadão</option>
              <option value="atendente">👩‍⚕️ Atendente</option>
              <option value="gestor">👔 Gestor</option>
            </select>
          </div>

          <div className="input-group" style={{ marginBottom: '12px' }}>
            <label htmlFor="senha" style={{ display: 'block', fontWeight: 600, fontSize: '.9rem' }}>
              Senha <small style={{ color: '#718096' }}>(mín. 6 caracteres)</small>
            </label>
            <input
              type={showPasswords ? 'text' : 'password'}
              id="senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Crie uma senha segura"
              required
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1.5px solid #d1d9e6',
                borderRadius: '8px',
              }}
            />
          </div>

          <div className="input-group password-group" style={{ marginBottom: '12px' }}>
            <label
              htmlFor="confirmar_senha"
              style={{ display: 'block', fontWeight: 600, fontSize: '.9rem' }}
            >
              Confirmar Senha
            </label>
            <input
              type={showPasswords ? 'text' : 'password'}
              id="confirmar_senha"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              placeholder="Repita a senha"
              required
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1.5px solid #d1d9e6',
                borderRadius: '8px',
              }}
            />
            <button
              type="button"
              onClick={() => setShowPasswords(!showPasswords)}
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
              {showPasswords ? '🙈 Ocultar senhas' : '👁 Mostrar senhas'}
            </button>
          </div>

          <div style={{ margin: '12px 0', fontSize: '.85rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={termos}
                onChange={(e) => setTermos(e.target.checked)}
                required
              />
              <span>
                Eu aceito os{' '}
                <a href="#" style={{ color: '#0051bb' }}>
                  termos e condições
                </a>
                .
              </span>
            </label>
          </div>

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
            {loading ? 'Salvando...' : 'Finalizar Cadastro'}
          </button>
        </form>

        <div
          style={{
            marginTop: '16px',
            textAlign: 'center',
            fontSize: '.9rem',
            color: '#4a5568',
          }}
        >
          Já tem uma conta?{' '}
          <Link href="/login" style={{ color: '#0051bb', fontWeight: 600 }}>
            Faça login →
          </Link>
        </div>
      </div>
    </div>
  );
}
