/**
 * Dados de demonstração para visualização no Portfólio
 * Apenas 1 funcionário fictício com registros de ponto imaginários de 1 mês
 */
export function getDemoData() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const monthStr = String(month).padStart(2, '0');

  const demoEmployee = {
    id: 'emp-demo-01',
    name: 'Carlos Eduardo Silva',
    matricula: 'MAT-2026-01',
    cpf: '123.456.789-00',
    role: 'Assistente Administrativo',
    department: 'Operacional',
    standard_daily_hours: 8.8,
    work_saturdays: false,
    status: 'active',
    admission_date: `${year}-01-15`,
    dismissal_date: null,
    created_at: new Date().toISOString()
  };

  const daysInMonth = new Date(year, month, 0).getDate();
  const demoRecords = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const dayStr = String(day).padStart(2, '0');
    const dateStr = `${year}-${monthStr}-${dayStr}`;
    const dayOfWeek = new Date(year, month - 1, day).getDay(); // 0 = Dom, 6 = Sáb

    // Segunda a Sexta (jornada padrão CLT de 8h 48min)
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      if (day === 5) {
        demoRecords.push({
          id: `rec-demo-${dateStr}`,
          employee_id: demoEmployee.id,
          date: dateStr,
          clock_in: '08:00',
          lunch_start: '12:00',
          lunch_end: '13:00',
          clock_out: '18:30',
          abono_hours: 0,
          abono_reason: '',
          notes: 'Hora extra autorizada'
        });
      } else if (day === 12) {
        demoRecords.push({
          id: `rec-demo-${dateStr}`,
          employee_id: demoEmployee.id,
          date: dateStr,
          clock_in: '08:18',
          lunch_start: '12:00',
          lunch_end: '13:00',
          clock_out: '17:48',
          abono_hours: 0,
          abono_reason: '',
          notes: ''
        });
      } else if (day === 18) {
        demoRecords.push({
          id: `rec-demo-${dateStr}`,
          employee_id: demoEmployee.id,
          date: dateStr,
          clock_in: '08:00',
          lunch_start: '12:00',
          lunch_end: '13:00',
          clock_out: '15:48',
          abono_hours: 2,
          abono_reason: 'Consulta médica',
          notes: 'Atestado médico entregue'
        });
      } else {
        demoRecords.push({
          id: `rec-demo-${dateStr}`,
          employee_id: demoEmployee.id,
          date: dateStr,
          clock_in: '08:00',
          lunch_start: '12:00',
          lunch_end: '13:00',
          clock_out: '17:48',
          abono_hours: 0,
          abono_reason: '',
          notes: ''
        });
      }
    }
  }

  return { demoEmployee, demoRecords };
}
