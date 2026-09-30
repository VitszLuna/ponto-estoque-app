import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, Boxes } from 'lucide-react';

export default function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Por favor, informe o e-mail e a senha.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const userData = {
        name: email.split('@')[0].toUpperCase() || 'USUÁRIO',
        email: email.trim(),
        role: 'Administrador / Supervisor',
        loginTime: new Date().toISOString()
      };

      if (rememberMe) {
        localStorage.setItem('ponto_user_session', JSON.stringify(userData));
      }

      setIsLoading(false);
      onLoginSuccess(userData);
    }, 300);
  };

  return (
    <div className="login-wrapper" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at 50% 20%, var(--bg-card) 0%, var(--bg-primary) 100%)',
      padding: '1.5rem',
      position: 'relative',
      overflow: 'hidden'
    }}>

      {/* DECORAÇÃO DE FUNDO */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        left: '-5%',
        width: '350px',
        height: '350px',
        borderRadius: '50%',
        background: 'rgba(37, 99, 235, 0.08)',
        filter: 'blur(60px)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-10%',
        right: '-5%',
        width: '350px',
        height: '350px',
        borderRadius: '50%',
        background: 'rgba(16, 185, 129, 0.08)',
        filter: 'blur(60px)',
        pointerEvents: 'none'
      }} />

      {/* CARD DE LOGIN */}
      <div className="clean-card" style={{
        maxWidth: '420px',
        width: '100%',
        padding: '2.5rem 2rem',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--border-color)',
        background: 'var(--bg-secondary)',
        position: 'relative',
        zIndex: 10
      }}>

        {/* LOGO E TÍTULO */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, var(--accent-blue) 0%, #1d4ed8 100%)',
            color: '#ffffff',
            boxShadow: '0 8px 20px rgba(37, 99, 235, 0.3)',
            marginBottom: '1rem'
          }}>
            <Boxes size={32} />
          </div>

          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            PONTO <span style={{ color: 'var(--accent-blue)' }}>& ESTOQUE</span>
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Portal de Frequência & Gestão de Materiais
          </p>
        </div>

        {/* MENSAGEM DE ERRO */}
        {errorMsg && (
          <div style={{
            background: 'var(--accent-rose-subtle)',
            color: 'var(--accent-rose)',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            marginBottom: '1.25rem',
            fontWeight: 600,
            border: '1px solid rgba(239, 68, 68, 0.2)',
            textAlign: 'center'
          }}>
            {errorMsg}
          </div>
        )}

        {/* FORMULÁRIO DE LOGIN PADRÃO */}
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label">E-mail ou Usuário</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                placeholder="seu.email@empresa.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
                autoFocus
                required
              />
              <Mail size={18} style={{
                position: 'absolute',
                left: '0.85rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }} />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label">Senha</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
                required
              />
              <Lock size={18} style={{
                position: 'absolute',
                left: '0.85rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }} />
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.5rem',
            fontSize: '0.85rem'
          }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer', userSelect: 'none' }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                style={{ accentColor: 'var(--accent-blue)', width: '16px', height: '16px' }}
              />
              <span style={{ color: 'var(--text-secondary)' }}>Manter conectado</span>
            </label>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '0.75rem',
              fontSize: '0.95rem',
              fontWeight: 700,
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
            }}
          >
            {isLoading ? 'Autenticando...' : (
              <>
                Entrar no Sistema
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* RODAPÉ */}
        <div style={{
          marginTop: '2rem',
          paddingTop: '1rem',
          borderTop: '1px solid var(--border-color)',
          textAlign: 'center',
          fontSize: '0.75rem',
          color: 'var(--text-muted)'
        }}>
          🔒 Ambiente Seguro • PONTO & ESTOQUE
        </div>

      </div>
    </div>
  );
}
