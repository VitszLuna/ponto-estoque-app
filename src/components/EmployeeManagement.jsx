import React, { useState } from 'react';
import { Users, UserCheck, UserX, UserPlus, Search, Edit3, FileText, RotateCcw, IdCard } from 'lucide-react';

export default function EmployeeManagement({
  employees,
  onSaveEmployee,
  onToggleStatus,
  onSelectForTimesheet
}) {
  const [activeTab, setActiveTab] = useState('active'); // 'active' ou 'inactive'
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    matricula: '',
    role: '',
    department: '',
    standard_daily_hours: 8.8,
    work_saturdays: false,
    admission_date: new Date().toISOString().split('T')[0]
  });

  const filteredEmployees = employees.filter(emp => {
    const matchStatus = emp.status === activeTab;
    const matchSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (emp.matricula && emp.matricula.toLowerCase().includes(searchQuery.toLowerCase())) ||
                        (emp.department && emp.department.toLowerCase().includes(searchQuery.toLowerCase())) ||
                        (emp.role && emp.role.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchStatus && matchSearch;
  });

  const openAddModal = () => {
    setEditingEmployee(null);
    setFormData({
      name: '',
      matricula: '',
      role: 'Operador',
      department: 'Geral',
      standard_daily_hours: 8.8,
      work_saturdays: false,
      admission_date: new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  const openEditModal = (emp) => {
    setEditingEmployee(emp);
    setFormData({
      name: emp.name,
      matricula: emp.matricula || emp.cpf || '',
      role: emp.role || '',
      department: emp.department || '',
      standard_daily_hours: 8.8,
      work_saturdays: false,
      admission_date: emp.admission_date || new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveEmployee({
      ...(editingEmployee ? { id: editingEmployee.id } : {}),
      ...formData,
      standard_daily_hours: 8.8,
      work_saturdays: false
    });
    setIsModalOpen(false);
  };

  const handleDismiss = (emp) => {
    const dismissalDate = prompt(`Informe a data de desligamento de ${emp.name} (YYYY-MM-DD):`, new Date().toISOString().split('T')[0]);
    if (dismissalDate) {
      onToggleStatus(emp.id, 'inactive', dismissalDate);
    }
  };

  const handleRehire = (emp) => {
    if (confirm(`Deseja reativar o funcionário ${emp.name}?`)) {
      onToggleStatus(emp.id, 'active', null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* CABEÇALHO */}
      <div className="clean-card" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Gestão de Funcionários
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Cadastro da equipe • Jornada fixa CLT de <strong>8h 48min (Segunda a Sexta)</strong>.
          </p>
        </div>

        <button className="btn btn-emerald" onClick={openAddModal}>
          <UserPlus size={16} />
          Cadastrar Funcionário
        </button>
      </div>

      {/* FILTROS E ABAS DE ATIVOS E DESLIGADOS */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{
          display: 'flex',
          background: 'var(--bg-subtle)',
          padding: '0.25rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
          gap: '0.25rem'
        }}>
          <button
            className={`btn btn-sm ${activeTab === 'active' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('active')}
          >
            <UserCheck size={15} />
            Funcionários Ativos ({employees.filter(e => e.status === 'active').length})
          </button>
          
          <button
            className={`btn btn-sm ${activeTab === 'inactive' ? 'btn-rose' : 'btn-secondary'}`}
            onClick={() => setActiveTab('inactive')}
          >
            <UserX size={15} />
            Funcionários Desligados ({employees.filter(e => e.status === 'inactive').length})
          </button>
        </div>

        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Buscar por nome, matrícula, cargo..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '2.2rem' }}
          />
        </div>
      </div>

      {/* TABELA DE FUNCIONÁRIOS */}
      <div className="clean-card">
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Nome / Nº Matrícula</th>
                <th>Cargo</th>
                <th>Setor</th>
                <th>Jornada Diária</th>
                <th>Sábados / Domingos</th>
                <th>Admissão</th>
                {activeTab === 'inactive' && <th>Desligamento</th>}
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={activeTab === 'inactive' ? 8 : 7} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    {activeTab === 'active'
                      ? 'Nenhum funcionário ativo cadastrado.'
                      : 'Nenhum funcionário desligado no histórico.'}
                  </td>
                </tr>
              ) : (
                filteredEmployees.map(emp => (
                  <tr key={emp.id}>
                    <td style={{ fontWeight: 700 }}>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{emp.name}</div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--accent-blue)', fontFamily: 'monospace', fontWeight: 600 }}>
                        Matrícula: {emp.matricula || emp.cpf || 'Sem Nº'}
                      </span>
                    </td>
                    <td>{emp.role}</td>
                    <td>
                      <span className="badge" style={{ background: 'var(--bg-subtle)', color: 'var(--text-secondary)' }}>
                        {emp.department}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--accent-blue)' }}>
                      8h 48min (Seg a Sex)
                    </td>
                    <td>
                      <span className="badge badge-overtime" title="Qualquer trabalho no final de semana é 100% hora extra">
                        100% Extra
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>
                      {emp.admission_date ? new Date(`${emp.admission_date}T12:00:00`).toLocaleDateString('pt-BR') : '--'}
                    </td>
                    {activeTab === 'inactive' && (
                      <td style={{ fontSize: '0.85rem', color: 'var(--accent-rose)', fontWeight: 600 }}>
                        {emp.dismissal_date ? new Date(`${emp.dismissal_date}T12:00:00`).toLocaleDateString('pt-BR') : '--'}
                      </td>
                    )}
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                        <button
                          className="btn btn-sm btn-secondary"
                          title="Ver Folha de Ponto"
                          onClick={() => onSelectForTimesheet(emp.id)}
                        >
                          <FileText size={14} />
                          Folha
                        </button>

                        <button
                          className="btn btn-sm btn-secondary"
                          title="Editar"
                          onClick={() => openEditModal(emp)}
                        >
                          <Edit3 size={14} />
                        </button>

                        {emp.status === 'active' ? (
                          <button
                            className="btn btn-sm btn-rose"
                            title="Desligar Funcionário"
                            onClick={() => handleDismiss(emp)}
                          >
                            <UserX size={14} />
                            Desligar
                          </button>
                        ) : (
                          <button
                            className="btn btn-sm btn-emerald"
                            title="Reativar Funcionário"
                            onClick={() => handleRehire(emp)}
                          >
                            <RotateCcw size={14} />
                            Reativar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL CADASTRO / EDIÇÃO */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1rem' }}>
              {editingEmployee ? 'Editar Funcionário' : 'Cadastrar Funcionário'}
            </h3>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Nome Completo</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ex: Leandro Silva"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div className="form-group">
                  <label className="form-label">Nº de Matrícula</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex: MAT-00123"
                    value={formData.matricula}
                    onChange={e => setFormData({ ...formData, matricula: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Data de Admissão</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.admission_date}
                    onChange={e => setFormData({ ...formData, admission_date: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div className="form-group">
                  <label className="form-label">Cargo</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex: Encarregado"
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Setor</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex: Manutenção / Limpeza"
                    value={formData.department}
                    onChange={e => setFormData({ ...formData, department: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-emerald">
                  Salvar Cadastro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
