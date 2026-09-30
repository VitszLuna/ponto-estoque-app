import React, { useState } from 'react';
import { Calendar, Plus, Trash2, FileText, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function AllowancesManager({
  employees,
  allowances,
  onSaveAllowance,
  onDeleteAllowance
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    employee_id: employees[0]?.id || '',
    date: new Date().toISOString().split('T')[0],
    type: 'atestado',
    hours_credited: 8.0,
    reason: ''
  });

  const activeEmployees = employees.filter(e => e.status === 'active');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.employee_id) return alert('Selecione um funcionário.');

    onSaveAllowance({
      ...formData,
      hours_credited: parseFloat(formData.hours_credited) || 8.0
    });

    setIsModalOpen(false);
    setFormData({
      employee_id: activeEmployees[0]?.id || '',
      date: new Date().toISOString().split('T')[0],
      type: 'atestado',
      hours_credited: 8.0,
      reason: ''
    });
  };

  const getTypeName = (type) => {
    switch (type) {
      case 'atestado': return 'Atestado Médico';
      case 'folga': return 'Folga Compensatória';
      case 'abono_parcial': return 'Abono Parcial de Horas';
      case 'feriado': return 'Feriado / Licença';
      default: return 'Abono';
    }
  };

  const getTypeBadgeClass = (type) => {
    switch (type) {
      case 'atestado': return 'badge-abono';
      case 'folga': return 'badge-active';
      case 'abono_parcial': return 'badge-overtime';
      default: return 'badge-delay';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* CABEÇALHO */}
      <div className="glass-card" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Área de Abonos, Folgas e Atestados
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Cadastre faltas justificadas, consultas médicas e folgas para abonar os atrasos da folha de ponto.
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} />
          Registrar Novo Abono / Atestado
        </button>
      </div>

      {/* TABELA DE ABONOS REGISTRADOS */}
      <div className="glass-card">
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Funcionário</th>
                <th>Data</th>
                <th>Tipo de Abono</th>
                <th>Horas Abondadas</th>
                <th>Motivo / Descrição</th>
                <th style={{ textAlign: 'right' }}>Ação</th>
              </tr>
            </thead>
            <tbody>
              {allowances.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    Nenhum atestado ou folga cadastrada no sistema.
                  </td>
                </tr>
              ) : (
                allowances.map(item => {
                  const emp = employees.find(e => e.id === item.employee_id);
                  return (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 700 }}>
                        {emp ? emp.name : 'Funcionário não encontrado'}
                        {emp?.status === 'inactive' && (
                          <span style={{ fontSize: '0.7rem', color: 'var(--accent-rose)', display: 'block' }}>
                            Desligado
                          </span>
                        )}
                      </td>
                      <td style={{ fontFamily: 'monospace' }}>
                        {new Date(`${item.date}T12:00:00`).toLocaleDateString('pt-BR')}
                      </td>
                      <td>
                        <span className={`badge ${getTypeBadgeClass(item.type)}`}>
                          {getTypeName(item.type)}
                        </span>
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--accent-purple)' }}>
                        +{item.hours_credited || 8}h abonadas
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        {item.reason || 'Sem descrição informada'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn btn-sm btn-rose"
                          title="Excluir Abono"
                          onClick={() => {
                            if (confirm('Excluir este abono? O atraso correspondente voltará a ser computado.')) {
                              onDeleteAllowance(item.id);
                            }
                          }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE REGISTRO */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem' }}>
              Registrar Abono / Atestado / Folga
            </h3>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Funcionário</label>
                <select
                  className="form-select"
                  value={formData.employee_id}
                  onChange={e => setFormData({ ...formData, employee_id: e.target.value })}
                  required
                >
                  {activeEmployees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.department})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Data</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Tipo de Abono</label>
                  <select
                    className="form-select"
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="atestado">Atestado Médico</option>
                    <option value="folga">Folga Compensatória</option>
                    <option value="abono_parcial">Abono Parcial (Ex: Horas/Consulta)</option>
                    <option value="feriado">Feriado / Licença</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Horas a Abonar</label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="24"
                  className="form-input"
                  value={formData.hours_credited}
                  onChange={e => setFormData({ ...formData, hours_credited: parseFloat(e.target.value) || 8.0 })}
                  required
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Padrão para dia completo: 8.0h. Para poucas horas, digite o total (ex: 2.0).
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Motivo / Observações</label>
                <textarea
                  className="form-input"
                  rows="3"
                  placeholder="Informe detalhes como número do CRM, motivo médico ou autorização de folga..."
                  value={formData.reason}
                  onChange={e => setFormData({ ...formData, reason: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Confirmar e Salvar Abono
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
