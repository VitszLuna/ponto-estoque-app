import React, { useState, useEffect } from 'react';
import { X, Clock, Calculator, Save, FileText } from 'lucide-react';
import { calculateDailyMetrics, minutesToHHMM } from '../utils/timeCalculations';

export default function TimeClockModal({
  isOpen,
  onClose,
  employees,
  timeRecords,
  initialEmployeeId = '',
  initialDate = '',
  onSave
}) {
  if (!isOpen) return null;

  const todayStr = new Date().toISOString().split('T')[0];
  
  const [employeeId, setEmployeeId] = useState(initialEmployeeId || (employees[0]?.id || ''));
  const [date, setDate] = useState(initialDate || todayStr);
  const [clockIn, setClockIn] = useState('');
  const [lunchStart, setLunchStart] = useState('');
  const [lunchEnd, setLunchEnd] = useState('');
  const [clockOut, setClockOut] = useState('');
  const [abonoHours, setAbonoHours] = useState('');
  const [abonoReason, setAbonoReason] = useState('');
  const [notes, setNotes] = useState('');

  // Carregar dados existentes para a combinação de funcionário e data
  useEffect(() => {
    if (!employeeId) return;
    const rec = timeRecords.find(r => r.employee_id === employeeId && r.date === date);
    if (rec) {
      setClockIn(rec.clock_in || '');
      setLunchStart(rec.lunch_start || '');
      setLunchEnd(rec.lunch_end || '');
      setClockOut(rec.clock_out || '');
      setAbonoHours(rec.abono_hours ? String(rec.abono_hours) : '');
      setAbonoReason(rec.abono_reason || '');
      setNotes(rec.notes || '');
    } else {
      setClockIn('');
      setLunchStart('');
      setLunchEnd('');
      setClockOut('');
      setAbonoHours('');
      setAbonoReason('');
      setNotes('');
    }
  }, [employeeId, date, timeRecords]);

  const selectedEmployee = employees.find(e => e.id === employeeId);

  // Cálculo ao vivo
  const metrics = calculateDailyMetrics({
    clock_in: clockIn,
    lunch_start: lunchStart,
    lunch_end: lunchEnd,
    clock_out: clockOut,
    date,
    standardDailyHours: selectedEmployee?.standard_daily_hours || 8.8,
    workSaturdays: selectedEmployee?.work_saturdays,
    abono_hours: parseFloat(abonoHours) || 0,
    abono_reason: abonoReason
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!employeeId) return alert('Selecione um funcionário.');

    onSave({
      employee_id: employeeId,
      date,
      clock_in: clockIn || null,
      lunch_start: lunchStart || null,
      lunch_end: lunchEnd || null,
      clock_out: clockOut || null,
      abono_hours: parseFloat(abonoHours) || 0,
      abono_reason: abonoReason || '',
      notes: notes || ''
    });

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        
        {/* CABEÇALHO */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ background: 'var(--accent-blue-subtle)', color: 'var(--accent-blue)', padding: '0.5rem', borderRadius: 'var(--radius-md)' }}>
              <Clock size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Lançar / Editar Ponto do Dia</h3>
              <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>Edite os horários ou abone horas por atestado para qualquer data</p>
            </div>
          </div>
          <button className="btn btn-sm btn-secondary" onClick={onClose} style={{ borderRadius: '50%', padding: '0.35rem' }}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          
          {/* FUNCIONÁRIO E DATA */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Funcionário</label>
              <select
                className="form-select"
                value={employeeId}
                onChange={e => setEmployeeId(e.target.value)}
                required
              >
                {employees.filter(e => e.status === 'active').map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.department})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Data do Ponto</label>
              <input
                type="date"
                className="form-input"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          {/* HORÁRIOS */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.85rem',
            margin: '0.85rem 0',
            background: 'var(--bg-subtle)',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)'
          }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">1. Entrada</label>
              <input
                type="time"
                className="form-input"
                value={clockIn}
                onChange={e => setClockIn(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">2. Saída Almoço</label>
              <input
                type="time"
                className="form-input"
                value={lunchStart}
                onChange={e => setLunchStart(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">3. Retorno Almoço</label>
              <input
                type="time"
                className="form-input"
                value={lunchEnd}
                onChange={e => setLunchEnd(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">4. Saída do Serviço</label>
              <input
                type="time"
                className="form-input"
                value={clockOut}
                onChange={e => setClockOut(e.target.value)}
              />
            </div>
          </div>

          {/* SEÇÃO DE ABONO DE HORAS / ATESTADO */}
          <div style={{
            background: 'var(--accent-purple-subtle)',
            border: '1px solid rgba(139, 92, 246, 0.2)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            marginBottom: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem', color: 'var(--accent-purple)', fontWeight: 700, fontSize: '0.85rem' }}>
              <FileText size={16} />
              Abonar Horas / Atestado Médico (Opcional)
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.75rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Horas Abonadas (ex: 3.0)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="12"
                  className="form-input"
                  placeholder="Ex: 3.0"
                  value={abonoHours}
                  onChange={e => setAbonoHours(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Motivo (ex: Atestado médico)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ex: Atestado médico / Consulta"
                  value={abonoReason}
                  onChange={e => setAbonoReason(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* PREVIA DE CALCULOS */}
          <div style={{
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem',
            marginBottom: '1.25rem',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '0.5rem',
            textAlign: 'center'
          }}>
            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Trabalhado</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {minutesToHHMM(metrics.workedMinutes)}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--accent-blue)', textTransform: 'uppercase' }}>Hora Extra (+)</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-blue)' }}>
                +{minutesToHHMM(metrics.overtimeMinutes)}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--accent-amber)', textTransform: 'uppercase' }}>Atraso (-)</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-amber)' }}>
                -{minutesToHHMM(metrics.delayMinutes)}
              </div>
            </div>
          </div>

          {/* BOTÕES */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              <Save size={16} />
              Salvar Ponto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
