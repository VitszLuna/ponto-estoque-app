import React, { useState, useEffect } from 'react';
import { Clock, Database, Sun, Moon, LogOut, User } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabaseClient';

export default function Navbar({ activeTab, setActiveTab, onOpenSupabaseModal, theme, toggleTheme, currentUser, onLogout }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const isConnected = isSupabaseConfigured();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDateStr = (date) => {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'short',
      day: '2-digit',
      month: 'short'
    });
  };

  const formatTimeStr = (date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <nav className="no-print" style={{
      background: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border-color)',
      padding: '0.85rem 1.5rem',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        {/* LOGO */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--accent-blue) 0%, #1d4ed8 100%)',
            width: '38px',
            height: '38px',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 4px 10px rgba(37, 99, 235, 0.25)'
          }}>
            <Clock size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
              PONTO <span style={{ color: 'var(--accent-blue)' }}>& ESTOQUE</span>
            </h1>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Controle de Frequência & Estoque
            </p>
          </div>
        </div>

        {/* NAVEGAÇÃO DE ABAS */}
        <div style={{
          display: 'flex',
          background: 'var(--bg-subtle)',
          padding: '0.25rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
          gap: '0.25rem'
        }}>
          <button
            className={`btn btn-sm ${activeTab === 'dashboard' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Painel Geral
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'employees' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('employees')}
          >
            Funcionários
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'timesheet' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('timesheet')}
          >
            Folha de Ponto
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'stock' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('stock')}
            style={{ fontWeight: 700 }}
          >
            Estoque
          </button>
        </div>

        {/* CONTROLES DA DIREITA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.85rem',
            fontWeight: 700,
            color: 'var(--text-secondary)',
            paddingRight: '0.5rem',
            borderRight: '1px solid var(--border-color)'
          }}>
            <span style={{ color: 'var(--accent-blue)', fontFamily: 'monospace' }}>{formatTimeStr(currentTime)}</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>{formatDateStr(currentTime)}</span>
          </div>

          <button
            onClick={toggleTheme}
            className="btn btn-sm btn-secondary"
            style={{ padding: '0.35rem 0.55rem' }}
            title="Alternar Tema (Claro / Escuro)"
          >
            {theme === 'dark' ? <Sun size={15} color="#f59e0b" /> : <Moon size={15} color="#8b5cf6" />}
          </button>

          {/* USUÁRIO & SAIR */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            paddingLeft: '0.5rem',
            borderLeft: '1px solid var(--border-color)'
          }}>

            <span style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: 'var(--bg-subtle)',
              padding: '0.25rem 0.55rem',
              borderRadius: 'var(--radius-full)'
            }}>
              <User size={13} color="var(--accent-blue)" />
              {currentUser?.name || 'SUPERVISOR'}
            </span>

            <button
              onClick={onLogout}
              className="btn btn-sm btn-rose"
              title="Sair da Conta"
              style={{ padding: '0.35rem 0.55rem' }}
            >
              <LogOut size={14} />
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
}
