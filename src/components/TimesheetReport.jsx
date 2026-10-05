import React, { useState } from 'react';
import { Printer, Download, Edit3, FileText, ArrowRightLeft } from 'lucide-react';
import {
  getDayOfWeek,
  calculateDailyMetrics,
  calculateMonthlyTotals,
  calculatePreviousMonthsBalance,
  minutesToHHMM
} from '../utils/timeCalculations';

export default function TimesheetReport({
  employees,
  timeRecords,
  selectedEmployeeId = '',
  onSelectEmployee,
  onOpenTimeModal
}) {
  const currentDate = new Date();
  const [employeeId, setEmployeeId] = useState(selectedEmployeeId || (employees[0]?.id || ''));
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const currentEmployee = employees.find(e => e.id === (employeeId || selectedEmployeeId));

  // Gerar dias do mês
  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const dailyRows = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const dayPad = String(day).padStart(2, '0');
    const monthPad = String(selectedMonth).padStart(2, '0');
    const dateStr = `${selectedYear}-${monthPad}-${dayPad}`;

    const record = timeRecords.find(r => r.employee_id === currentEmployee?.id && r.date === dateStr);

    const metrics = calculateDailyMetrics({
      clock_in: record?.clock_in,
      lunch_start: record?.lunch_start,
      lunch_end: record?.lunch_end,
      clock_out: record?.clock_out,
      date: dateStr,
      standardDailyHours: currentEmployee?.standard_daily_hours || 8.8,
      workSaturdays: currentEmployee?.work_saturdays || false,
      abono_hours: record?.abono_hours || 0,
      abono_reason: record?.abono_reason || ''
    });

    dailyRows.push({
      dayNumber: dayPad,
      dateStr,
      dayInfo: getDayOfWeek(dateStr),
      record,
      metrics
    });
  }

  // Saldo Carregado de Meses Anteriores
  const previousBalanceMinutes = calculatePreviousMonthsBalance(
    currentEmployee?.id,
    timeRecords,
    selectedYear,
    selectedMonth,
    employees
  );

  // Totais do Mês e Saldo Consolidado para o Mês Seguinte
  const monthlyTotals = calculateMonthlyTotals(dailyRows, previousBalanceMinutes);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (!currentEmployee) return;
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Dia;Data;Dia da Semana;Entrada;Saida Almoco;Retorno Almoco;Saida;Trabalhado;Extra;Atraso;Abono Horas;Motivo Abono;Observacao\n";

    dailyRows.forEach(row => {
      const inTime = row.record?.clock_in || '';
      const lStart = row.record?.lunch_start || '';
      const lEnd = row.record?.lunch_end || '';
      const outTime = row.record?.clock_out || '';
      const worked = minutesToHHMM(row.metrics.workedMinutes);
      const extra = minutesToHHMM(row.metrics.overtimeMinutes);
      const delay = minutesToHHMM(row.metrics.delayMinutes);
      const abonoH = row.metrics.abonoHours ? `${row.metrics.abonoHours}h` : '';
      const abonoR = row.metrics.abonoReason || '';
      const obs = row.record?.notes || '';

      csvContent += `${row.dayNumber};${row.dateStr};${row.dayInfo.name};${inTime};${lStart};${lEnd};${outTime};${worked};${extra};${delay};${abonoH};${abonoR};${obs}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Folha_Ponto_${currentEmployee.name.replace(/\s+/g, '_')}_${selectedMonth}_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* PAINEL DE SELEÇÃO E ACOES */}
      <div className="clean-card no-print" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ marginBottom: 0, minWidth: '240px' }}>
            <label className="form-label">Selecionar Funcionário</label>
            <select
              className="form-select"
              value={employeeId}
              onChange={e => {
                setEmployeeId(e.target.value);
                if (onSelectEmployee) onSelectEmployee(e.target.value);
              }}
            >
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} {emp.status === 'inactive' ? '(DESLIGADO)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Mês Competência</label>
            <select
              className="form-select"
              value={selectedMonth}
              onChange={e => setSelectedMonth(parseInt(e.target.value, 10))}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                <option key={m} value={m}>
                  {new Date(2026, m - 1, 1).toLocaleString('pt-BR', { month: 'long' }).toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Ano</label>
            <select
              className="form-select"
              value={selectedYear}
              onChange={e => setSelectedYear(parseInt(e.target.value, 10))}
            >
              {Array.from({ length: Math.max(new Date().getFullYear(), selectedYear) + 10 - 2024 + 1 }, (_, i) => 2024 + i).map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={handleExportCSV}>
            <Download size={16} />
            Exportar CSV / Excel
          </button>
          <button className="btn btn-primary" onClick={handlePrint}>
            <Printer size={16} />
            Imprimir / Exportar PDF
          </button>
        </div>
      </div>

      {/* DOCUMENTO DA FOLHA DE PONTO */}
      {!currentEmployee ? (
        <div className="clean-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <FileText size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <h3>Nenhum funcionário selecionado</h3>
        </div>
      ) : (
        <div className="clean-card print-only-sheet">
          
          {/* CABEÇALHO */}
          <div style={{
            borderBottom: '2px solid var(--border-color)',
            paddingBottom: '1rem',
            marginBottom: '1.25rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, textTransform: 'uppercase' }}>
                FOLHA DE PONTO INDIVIDUAL
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Competência: <strong>{new Date(selectedYear, selectedMonth - 1, 1).toLocaleString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase()}</strong>
              </p>
            </div>

            <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <strong>SISTEMA PONTO & BANCO DE HORAS</strong>
              <div>Emissão: {new Date().toLocaleDateString('pt-BR')}</div>
            </div>
          </div>

          {/* DADOS DO FUNCIONÁRIO */}
          <div style={{
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            marginBottom: '1.25rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '0.85rem'
          }}>
            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Nome do Colaborador</span>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>{currentEmployee.name}</div>
            </div>

            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Nº de Matrícula</span>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, fontFamily: 'monospace' }}>{currentEmployee.matricula || currentEmployee.cpf || 'Não informado'}</div>
            </div>

            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Cargo / Setor</span>
              <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{currentEmployee.role} - {currentEmployee.department}</div>
            </div>

            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Jornada Diária (CLT)</span>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-blue)' }}>
                {(currentEmployee.standard_daily_hours || 8.8) === 8.8 ? '8h 48min / dia (1h almoço)' : `${currentEmployee.standard_daily_hours}h / dia`}
              </div>
            </div>
          </div>

          {/* TABELA DIA A DIA */}
          <div className="table-responsive" style={{ marginBottom: '1.25rem' }}>
            <table className="custom-table" style={{ fontSize: '0.825rem' }}>
              <thead>
                <tr>
                  <th style={{ width: '50px' }}>Dia</th>
                  <th>Semana</th>
                  <th>Entrada</th>
                  <th>Almoço (Saída)</th>
                  <th>Almoço (Retorno)</th>
                  <th>Saída</th>
                  <th>Trabalhado</th>
                  <th>Extra</th>
                  <th>Atraso</th>
                  <th>Abono / Observação</th>
                  <th className="no-print" style={{ textAlign: 'right' }}>Ação</th>
                </tr>
              </thead>
              <tbody>
                {dailyRows.map(row => {
                  const isWeekend = row.dayInfo.isWeekend;
                  const isSun = row.dayInfo.isSunday;

                  return (
                    <tr key={row.dateStr} style={{
                      background: isSun ? 'var(--accent-rose-subtle)' : isWeekend ? 'var(--bg-subtle)' : 'transparent'
                    }}>
                      <td style={{ fontWeight: 800, fontFamily: 'monospace' }}>{row.dayNumber}</td>
                      <td style={{ fontWeight: 600, color: isWeekend ? 'var(--accent-amber)' : 'var(--text-secondary)' }}>
                        {row.dayInfo.shortName}
                      </td>

                      <td style={{ fontFamily: 'monospace' }}>{row.record?.clock_in || '--:--'}</td>
                      <td style={{ fontFamily: 'monospace' }}>{row.record?.lunch_start || '--:--'}</td>
                      <td style={{ fontFamily: 'monospace' }}>{row.record?.lunch_end || '--:--'}</td>
                      <td style={{ fontFamily: 'monospace' }}>{row.record?.clock_out || '--:--'}</td>

                      <td style={{ fontWeight: 700, color: 'var(--accent-blue)' }}>
                        {minutesToHHMM(row.metrics.workedMinutes)}
                      </td>

                      <td style={{ fontWeight: 700, color: row.metrics.overtimeMinutes > 0 ? 'var(--accent-blue)' : 'inherit' }}>
                        {row.metrics.overtimeMinutes > 0 ? `+${minutesToHHMM(row.metrics.overtimeMinutes)}` : '--'}
                      </td>

                      <td style={{ fontWeight: 700, color: row.metrics.delayMinutes > 0 ? 'var(--accent-amber)' : 'inherit' }}>
                        {row.metrics.delayMinutes > 0 ? `-${minutesToHHMM(row.metrics.delayMinutes)}` : '--'}
                      </td>

                      <td style={{ fontSize: '0.8rem' }}>
                        {row.metrics.abonoHours > 0 ? (
                          <span className="badge badge-abono">
                            +{row.metrics.abonoHours}h Abono ({row.metrics.abonoReason || 'Atestado'})
                          </span>
                        ) : row.record?.notes ? (
                          <span>{row.record.notes}</span>
                        ) : isSun ? (
                          <span style={{ color: 'var(--text-muted)' }}>Domingo</span>
                        ) : isWeekend && !currentEmployee.work_saturdays ? (
                          <span style={{ color: 'var(--text-muted)' }}>Sábado</span>
                        ) : (
                          '--'
                        )}
                      </td>

                      <td className="no-print" style={{ textAlign: 'right' }}>
                        <button
                          className="btn btn-sm btn-secondary"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                          onClick={() => onOpenTimeModal(currentEmployee.id, row.dateStr)}
                        >
                          <Edit3 size={13} />
                          Editar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* QUADRO DE RESUMO FINAL & BANCO DE HORAS COM CARREGAMENTO */}
          <div style={{
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            marginBottom: '2rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--accent-blue)', margin: 0 }}>
                Resumo Consolidado & Banco de Horas (Carregamento p/ Mês Seguinte)
              </h4>
              <span className="badge" style={{ background: 'var(--accent-blue-subtle)', color: 'var(--accent-blue)', fontSize: '0.75rem' }}>
                <ArrowRightLeft size={13} style={{ marginRight: '4px' }} />
                Banco de Horas Ativo
              </span>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '0.85rem',
              textAlign: 'center'
            }}>
              <div style={{ background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Trabalhado Mês</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {monthlyTotals.formattedWorked}
                </div>
              </div>

              <div style={{ background: 'var(--accent-blue-subtle)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--accent-blue)', textTransform: 'uppercase' }}>Extras Mês (+)</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-blue)' }}>
                  +{monthlyTotals.formattedOvertime}
                </div>
              </div>

              <div style={{ background: 'var(--accent-amber-subtle)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--accent-amber)', textTransform: 'uppercase' }}>Atrasos Mês (-)</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-amber)' }}>
                  -{monthlyTotals.formattedDelay}
                </div>
              </div>

              <div style={{ background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border-color)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Saldo Mês Atual</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: monthlyTotals.netBalance >= 0 ? '#047857' : '#b91c1c' }}>
                  {monthlyTotals.formattedNetBalance}
                </div>
              </div>

              <div style={{ background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border-color)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Saldo Meses Anteriores</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: monthlyTotals.previousBalanceMinutes >= 0 ? '#047857' : '#b91c1c' }}>
                  {monthlyTotals.formattedPreviousBalance}
                </div>
              </div>

              <div style={{
                background: monthlyTotals.finalCumulativeBalance >= 0 ? 'var(--accent-emerald-subtle)' : 'var(--accent-rose-subtle)',
                padding: '0.75rem',
                borderRadius: 'var(--radius-sm)',
                border: monthlyTotals.finalCumulativeBalance >= 0 ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)'
              }}>
                <span style={{ fontSize: '0.7rem', color: monthlyTotals.finalCumulativeBalance >= 0 ? '#047857' : '#b91c1c', textTransform: 'uppercase', fontWeight: 800 }}>
                  SALDO PARA MÊS SEGUINTE
                </span>
                <div style={{ fontSize: '1.3rem', fontWeight: 900, color: monthlyTotals.finalCumulativeBalance >= 0 ? '#047857' : '#b91c1c' }}>
                  {monthlyTotals.formattedFinalCumulativeBalance}
                </div>
              </div>
            </div>
          </div>

          {/* ASSINATURAS */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '3rem',
            marginTop: '2.5rem',
            paddingTop: '1.5rem',
            borderTop: '1px dashed var(--border-color)',
            textAlign: 'center'
          }}>
            <div>
              <div style={{ borderBottom: '1px solid #000', marginBottom: '0.5rem', height: '25px' }}></div>
              <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{currentEmployee.name}</span>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Assinatura do Colaborador</div>
            </div>

            <div>
              <div style={{ borderBottom: '1px solid #000', marginBottom: '0.5rem', height: '25px' }}></div>
              <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Visto do Supervisor</span>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Assinatura do Responsável</div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
