import React, { useState } from 'react';
import { X, Database, CheckCircle2, AlertCircle, Copy, Check, ExternalLink } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabaseClient';

export default function SupabaseConfigModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const isConnected = isSupabaseConfigured();
  const [url, setUrl] = useState(localStorage.getItem('PONTO_SUPABASE_URL') || import.meta.env.VITE_SUPABASE_URL || '');
  const [key, setKey] = useState(localStorage.getItem('PONTO_SUPABASE_KEY') || import.meta.env.VITE_SUPABASE_ANON_KEY || '');
  const [copiedSql, setCopiedSql] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('PONTO_SUPABASE_URL', url.trim());
    localStorage.setItem('PONTO_SUPABASE_KEY', key.trim());
    alert('Configurações salvas! A página será recarregada para aplicar a conexão.');
    window.location.reload();
  };

  const handleClear = () => {
    localStorage.removeItem('PONTO_SUPABASE_URL');
    localStorage.removeItem('PONTO_SUPABASE_KEY');
    alert('Configurações removidas. Voltando ao modo de banco local.');
    window.location.reload();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '650px' }}>
        
        {/* Cabeçalho */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ background: 'rgba(59, 130, 246, 0.15)', color: 'var(--accent-blue)', padding: '0.6rem', borderRadius: 'var(--radius-md)' }}>
              <Database size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Conexão com Banco Supabase</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sincronização em nuvem e persistência oficial</p>
            </div>
          </div>
          <button className="btn btn-sm btn-secondary" onClick={onClose} style={{ borderRadius: '50%', padding: '0.4rem' }}>
            <X size={18} />
          </button>
        </div>

        {/* Banner de Status Atual */}
        <div style={{
          padding: '1rem',
          borderRadius: 'var(--radius-md)',
          background: isConnected ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
          border: `1px solid ${isConnected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
          display: 'flex',
          alignItems: 'center',
          gap: '0.85rem',
          marginBottom: '1.25rem'
        }}>
          {isConnected ? (
            <CheckCircle2 size={24} color="#34d399" />
          ) : (
            <AlertCircle size={24} color="#fbbf24" />
          )}
          <div>
            <div style={{ fontWeight: 700, color: isConnected ? '#34d399' : '#fbbf24', fontSize: '0.95rem' }}>
              {isConnected ? 'Supabase Conectado e Ativo' : 'Modo Banco Local (Demonstrativo)'}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {isConnected
                ? 'Os dados do sistema estão sincronizados com seu projeto Supabase.'
                : 'O sistema está rodando localmente com dados de demonstração. Preencha abaixo para conectar à sua conta Supabase.'}
            </div>
          </div>
        </div>

        {/* Formulário de Configuração */}
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Supabase Project URL</label>
            <input
              type="text"
              className="form-input"
              placeholder="https://seu-projeto.supabase.co"
              value={url}
              onChange={e => setUrl(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Supabase Anon Public Key</label>
            <input
              type="password"
              className="form-input"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={key}
              onChange={e => setKey(e.target.value)}
            />
          </div>

          <div style={{
            background: 'rgba(0,0,0,0.2)',
            padding: '0.85rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            marginBottom: '1.25rem'
          }}>
            O script de tabelas SQL para o Supabase já está salvo na raiz da pasta em <code>supabase_schema.sql</code>.
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            {isConnected && (
              <button type="button" className="btn btn-rose" onClick={handleClear}>
                Desconectar / Limpar
              </button>
            )}
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Fechar
            </button>
            <button type="submit" className="btn btn-primary">
              Salvar Conexão
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
