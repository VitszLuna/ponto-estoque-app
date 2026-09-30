/**
 * Utilitários para Cálculos de Horas, Atrasos, Abonos e Horas Extras do Ponto
 * Carga horária padrão CLT: 8 horas e 48 minutos (8.8 horas = 528 minutos)
 */

// Converter "HH:MM" para minutos a partir da meia-noite
export function timeToMinutes(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return 0;
  const parts = timeStr.split(':');
  if (parts.length < 2) return 0;
  const hours = parseInt(parts[0], 10) || 0;
  const minutes = parseInt(parts[1], 10) || 0;
  return hours * 60 + minutes;
}

// Converter minutos inteiros para formato "HH:MM"
export function minutesToHHMM(totalMinutes) {
  if (isNaN(totalMinutes) || totalMinutes === null) return '00:00';
  const absMinutes = Math.abs(Math.round(totalMinutes));
  const h = Math.floor(absMinutes / 60);
  const m = absMinutes % 60;
  const pad = (num) => String(num).padStart(2, '0');
  return `${pad(h)}:${pad(m)}`;
}

// Formatador por extenso tipo "8h 48m" ou "+2h 15m"
export function minutesToHoursMinutesText(totalMinutes) {
  if (isNaN(totalMinutes) || totalMinutes === null || totalMinutes === 0) return '0h 00m';
  const sign = totalMinutes > 0 ? '+' : '-';
  const absMinutes = Math.abs(Math.round(totalMinutes));
  const h = Math.floor(absMinutes / 60);
  const m = absMinutes % 60;
  const pad = (num) => String(num).padStart(2, '0');
  return `${sign}${h}h ${pad(m)}m`;
}

// Formatador com sinal positivo/negativo (+02:15 ou -00:30)
export function formatSignedMinutes(totalMinutes) {
  if (!totalMinutes || totalMinutes === 0) return '00:00';
  const sign = totalMinutes > 0 ? '+' : '-';
  return `${sign}${minutesToHHMM(totalMinutes)}`;
}

// Determinar o dia da semana a partir de uma data YYYY-MM-DD
export function getDayOfWeek(dateStr) {
  if (!dateStr) return { dayIndex: 0, name: '', isWeekend: false, isSaturday: false, isSunday: false };
  const date = new Date(`${dateStr}T12:00:00`);
  const dayIndex = date.getDay();
  
  const names = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
  const shortNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  
  return {
    dayIndex,
    name: names[dayIndex],
    shortName: shortNames[dayIndex],
    isWeekend: dayIndex === 0 || dayIndex === 6,
    isSaturday: dayIndex === 6,
    isSunday: dayIndex === 0
  };
}

/**
 * Calcula as horas trabalhadas, horas extras, atrasos e abonos de um registro diário
 * Jornada Diária Padrão CLT: 8 horas e 48 minutos = 8.8 horas = 528 minutos
 */
export function calculateDailyMetrics({
  clock_in,
  lunch_start,
  lunch_end,
  clock_out,
  date,
  standardDailyHours = 8.8, // Default 8h 48min (8.8 horas)
  workSaturdays = false,
  abono_hours = 0,
  abono_reason = ''
}) {
  const dayInfo = getDayOfWeek(date);
  
  let workedMinutes = 0;
  let morningMinutes = 0;
  let afternoonMinutes = 0;

  // Manhã: Entrada -> Saída Almoço
  if (clock_in && lunch_start) {
    const inMin = timeToMinutes(clock_in);
    const lunchStartMin = timeToMinutes(lunch_start);
    if (lunchStartMin > inMin) morningMinutes = lunchStartMin - inMin;
  }

  // Tarde: Retorno Almoço -> Saída
  if (lunch_end && clock_out) {
    const lunchEndMin = timeToMinutes(lunch_end);
    const outMin = timeToMinutes(clock_out);
    if (outMin > lunchEndMin) afternoonMinutes = outMin - lunchEndMin;
  }

  // Caso tenha apenas Entrada e Saída sem marcação explícita de almoço
  if (clock_in && clock_out && !lunch_start && !lunch_end) {
    const inMin = timeToMinutes(clock_in);
    const outMin = timeToMinutes(clock_out);
    if (outMin > inMin) {
      const totalSpan = outMin - inMin;
      // Dedução automática de 1 hora (60 min) de almoço para jornadas acima de 6 horas
      workedMinutes = totalSpan > 360 ? totalSpan - 60 : totalSpan;
    }
  } else {
    workedMinutes = morningMinutes + afternoonMinutes;
  }

  // Meta diária contratual em minutos (8.8 * 60 = 528 min = 8h 48min)
  let expectedMinutes = Math.round(standardDailyHours * 60);

  if (dayInfo.isSunday) {
    expectedMinutes = 0;
  } else if (dayInfo.isSaturday) {
    expectedMinutes = workSaturdays ? Math.round(standardDailyHours * 60) : 0;
  }

  // Abono em minutos
  const abonoMinutes = Math.round((parseFloat(abono_hours) || 0) * 60);

  // Total creditado = trabalhado + abonado
  const totalEffectiveMinutes = workedMinutes + abonoMinutes;

  let overtimeMinutes = 0;
  let delayMinutes = 0;

  if (totalEffectiveMinutes > expectedMinutes) {
    overtimeMinutes = totalEffectiveMinutes - expectedMinutes;
    delayMinutes = 0;
  } else if (totalEffectiveMinutes < expectedMinutes) {
    delayMinutes = expectedMinutes - totalEffectiveMinutes;
    overtimeMinutes = 0;
  }

  return {
    workedMinutes,
    expectedMinutes,
    abonoMinutes,
    abonoHours: parseFloat(abono_hours) || 0,
    abonoReason: abono_reason || '',
    overtimeMinutes,
    delayMinutes,
    netBalanceMinutes: overtimeMinutes - delayMinutes
  };
}

/**
 * Calcula o Saldo Acumulado dos Meses Anteriores (Carregamento de Banco de Horas)
 */
export function calculatePreviousMonthsBalance(employeeId, timeRecords, currentYear, currentMonth, employees = []) {
  if (!employeeId || !timeRecords || timeRecords.length === 0) return 0;
  const emp = employees.find(e => e.id === employeeId);
  const standardDailyHours = emp?.standard_daily_hours || 8.8;
  const workSaturdays = emp?.work_saturdays || false;

  let previousBalance = 0;

  timeRecords.forEach(rec => {
    if (rec.employee_id !== employeeId || !rec.date) return;
    const [recYearStr, recMonthStr] = rec.date.split('-');
    const recYear = parseInt(recYearStr, 10);
    const recMonth = parseInt(recMonthStr, 10);

    // Verificar se o registro é de um mês/ano anterior ao atual selecionado
    const isBefore = recYear < currentYear || (recYear === currentYear && recMonth < currentMonth);

    if (isBefore) {
      const metrics = calculateDailyMetrics({
        clock_in: rec.clock_in,
        lunch_start: rec.lunch_start,
        lunch_end: rec.lunch_end,
        clock_out: rec.clock_out,
        date: rec.date,
        standardDailyHours,
        workSaturdays,
        abono_hours: rec.abono_hours || 0,
        abono_reason: rec.abono_reason || ''
      });
      previousBalance += metrics.netBalanceMinutes;
    }
  });

  return previousBalance;
}

/**
 * Agrupa totais mensais para relatório incluindo acúmulo e saldo para o mês seguinte
 */
export function calculateMonthlyTotals(dailyRecordsWithMetrics, previousBalanceMinutes = 0) {
  let totalWorked = 0;
  let totalOvertime = 0;
  let totalDelay = 0;
  let totalAbono = 0;

  dailyRecordsWithMetrics.forEach(rec => {
    totalWorked += rec.metrics.workedMinutes || 0;
    totalOvertime += rec.metrics.overtimeMinutes || 0;
    totalDelay += rec.metrics.delayMinutes || 0;
    totalAbono += rec.metrics.abonoMinutes || 0;
  });

  const netBalance = totalOvertime - totalDelay; // Saldo exclusivo do mês atual
  const finalCumulativeBalance = previousBalanceMinutes + netBalance; // Saldo total acumulado para o próximo mês

  return {
    totalWorked,
    totalOvertime,
    totalDelay,
    totalAbono,
    netBalance,
    previousBalanceMinutes,
    finalCumulativeBalance,
    formattedWorked: minutesToHHMM(totalWorked),
    formattedOvertime: minutesToHHMM(totalOvertime),
    formattedDelay: minutesToHHMM(totalDelay),
    formattedAbono: minutesToHHMM(totalAbono),
    formattedNetBalance: formatSignedMinutes(netBalance),
    formattedPreviousBalance: formatSignedMinutes(previousBalanceMinutes),
    formattedFinalCumulativeBalance: formatSignedMinutes(finalCumulativeBalance)
  };
}
