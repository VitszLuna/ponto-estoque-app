import React, { useState } from 'react';
import { Users, Clock, Calendar, PlusCircle, Edit3, CheckCircle2 } from 'lucide-react';
import { calculateDailyMetrics, minutesToHHMM } from '../utils/timeCalculations';

export default function Dashboard({
  employees,
  timeRecords,
  onOpenTimeModal,
  onOpenEmployeeModal,
  onNavigateToTimesheet
}) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const activeEmployees = employees.filter(e => e.status === 'active');
  const inactiveEmployeesCount = employees.filter(e => e.status === 'inactive').length;

  // Registros da data selecionada
  const dateRecords = timeRecords.filter(r => r.date === selectedDate);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* CABEÇALHO LEVE & APENAS QUANTIDADE DE FUNCIONÁRIOS ATIVOS */}
      <div className="clean-card" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            background: 'var(--accent-blue-subtle)',
            color: 'var(--accent-blue)',
            width: '48px',
            height: '48px',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Users size={26} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              EQUIPE ATIVA
            </span>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
              {activeEmployees.length} <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-muted)' }}>Funcionários Ativos</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => onOpenTimeModal('', selectedDate)}>
            <PlusCircle size={16} />
            Lançar / Editar Ponto da Data
          </button>
          <button className="btn btn-emerald" onClick={() => onOpenEmployeeModal()}>
            <Users size={16} />
            Cadastrar Funcionário
          </button>
        </div>
      </div>

      {/* CONTROLE DE DATA & TABELA DE PONTO */}
      <div className="clean-card">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.25rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid var(--border-color)'
        }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
              Ponto Diário da Equipe
            </h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              Selecione qualquer dia no calendário abaixo para consultar ou editar o ponto e abonar atestados.
            </p>
          </div>

          {/* SELETOR DE QUALQUER DIA */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <label className="form-label" style={{ marginBottom: 0 }}>Data de Consulta:</label>
            <input
              type="date"
              className="form-input"
              style={{ width: 'auto', padding: '0.45rem 0.75rem' }}
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
            />
          </div>
        </div>

        {/* TABELA DE REGISTROS */}
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Funcionário</th>
                <th>Cargo / Setor</th>
                <th>Entrada</th>
                <th>Almoço (Saída - Retorno)</th>
                <th>Saída</th>
                <th>Trabalhado</th>
                <th>Abono / Atestado</th>
                <th>Resultado</th>
                <th style={{ textAlign: 'right' }}>Ação</th>
              </tr>
            </thead>
            <tbody>
              {activeEmployees.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    Nenhum funcionário ativo cadastrado.
                  </td>
                </tr>
              ) : (
                activeEmployees.map(emp => {
                  const record = dateRecords.find(r => r.employee_id === emp.id);

                  const metrics = calculateDailyMetrics({
                    clock_in: record?.clock_in,
                    lunch_start: record?.lunch_start,
                    lunch_end: record?.lunch_end,
                    clock_out: record?.clock_out,
                    date: selectedDate,
                    standardDailyHours: emp.standard_daily_hours || 8.8,
                    workSaturdays: emp.work_saturdays,
                    abono_hours: record?.abono_hours || 0,
                    abono_reason: record?.abono_reason || ''
                  });

                  return (
                    <tr key={emp.id}>
                      <td style={{ fontWeight: 700 }}>
                        {emp.name}
                      </td>
                      <td>
                        <span style={{ fontSize: '0.85rem' }}>{emp.role}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>{emp.department}</span>
                      </td>
                      <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                        {record?.clock_in || '--:--'}
                      </td>
                      <td style={{ fontFamily: 'monospace' }}>
                        {record?.lunch_start ? `${record.lunch_start} - ${record.lunch_end || '--:--'}` : '--:--'}
                      </td>
                      <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                        {record?.clock_out || '--:--'}
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--accent-blue)' }}>
                        {minutesToHHMM(metrics.workedMinutes)}
                      </td>
                      <td>
                        {metrics.abonoHours > 0 ? (
                          <span className="badge badge-abono" title={metrics.abonoReason}>
                            +{metrics.abonoHours}h Abono ({metrics.abonoReason || 'Atestado'})
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>--</span>
                        )}
                      </td>
                      <td>
                        {metrics.overtimeMinutes > 0 ? (
                          <span className="badge badge-overtime">
                            +{minutesToHHMM(metrics.overtimeMinutes)} Extra
                          </span>
                        ) : metrics.delayMinutes > 0 ? (
                          <span className="badge badge-delay">
                            -{minutesToHHMM(metrics.delayMinutes)} Atraso
                          </span>
                        ) : (
                          <span style={{ color: 'var(--accent-emerald)', fontSize: '0.85rem', fontWeight: 600 }}>
                            OK (Dia Normal)
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => onOpenTimeModal(emp.id, selectedDate)}
                        >
                          <Edit3 size={14} />
                          Editar / Abonar
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
    </div>
  );
}
