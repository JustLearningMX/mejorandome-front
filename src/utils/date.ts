/**
 * Utilidades para manejo consistente de fechas y zonas horarias locales.
 * Evita el desfase generado por `toISOString()` en husos horarios como UTC-6 (México).
 */

/**
 * Retorna la fecha local en formato estándar YYYY-MM-DD.
 * Por defecto usa la zona horaria del entorno o 'America/Mexico_City'.
 */
export function getLocalDateString(date: Date = new Date(), timeZone?: string): string {
  try {
    const tz =
      timeZone ||
      Intl.DateTimeFormat().resolvedOptions().timeZone ||
      'America/Mexico_City';

    return new Intl.DateTimeFormat('en-CA', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  } catch {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}

/**
 * Retorna la fecha y hora local en formato compatible con inputs `datetime-local` (YYYY-MM-DDTHH:mm).
 */
export function getLocalDateTimeInputString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Comprueba si un registro (con fecha ISO o fecha local YYYY-MM-DD) corresponde al día de hoy en hora local.
 */
export function isTodayLocalDate(recordLocalDateOrDate: string | Date, timeZone?: string): boolean {
  const todayStr = getLocalDateString(new Date(), timeZone);

  if (typeof recordLocalDateOrDate === 'string') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(recordLocalDateOrDate)) {
      return recordLocalDateOrDate === todayStr;
    }
    return getLocalDateString(new Date(recordLocalDateOrDate), timeZone) === todayStr;
  }

  return getLocalDateString(recordLocalDateOrDate, timeZone) === todayStr;
}

/**
 * Desplaza una fecha local en formato YYYY-MM-DD sumando o restando días en tiempo de calendario.
 */
export function shiftLocalDate(dateStr: string, deltaDays: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d);
  dateObj.setDate(dateObj.getDate() + deltaDays);
  return getLocalDateString(dateObj);
}

/**
 * Determina si una fecha YYYY-MM-DD es posterior al día de hoy.
 */
export function isFutureLocalDate(dateStr: string): boolean {
  const todayStr = getLocalDateString();
  return dateStr > todayStr;
}

/**
 * Formatea una fecha local YYYY-MM-DD a un texto legible y elegante (ej. "Hoy, 3 de nov.", "Ayer, 2 de nov.", "Martes, 28 de oct. 2026").
 */
export function formatLocalDateDisplay(dateStr: string): { label: string; full: string; isToday: boolean; isYesterday: boolean } {
  const todayStr = getLocalDateString();
  const yesterdayStr = shiftLocalDate(todayStr, -1);

  const [y, m, d] = dateStr.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d, 12, 0, 0); // mediodía para evitar cualquier borde horario

  const isToday = dateStr === todayStr;
  const isYesterday = dateStr === yesterdayStr;

  const weekday = dateObj.toLocaleDateString('es-MX', { weekday: 'short' });
  const day = dateObj.getDate();
  const month = dateObj.toLocaleDateString('es-MX', { month: 'short' }).replace('.', '');
  const year = dateObj.getFullYear();
  const currentYear = new Date().getFullYear();

  const formattedBase = `${day} de ${month}${year !== currentYear ? ` ${year}` : ''}`;
  const full = `${dateObj.toLocaleDateString('es-MX', { weekday: 'long' })}, ${day} de ${dateObj.toLocaleDateString('es-MX', { month: 'long' })} de ${year}`;

  let label: string;
  if (isToday) {
    label = `Hoy, ${formattedBase}`;
  } else if (isYesterday) {
    label = `Ayer, ${formattedBase}`;
  } else {
    label = `${weekday ? weekday.charAt(0).toUpperCase() + weekday.slice(1) : ''}, ${formattedBase}`;
  }

  return { label, full, isToday, isYesterday };
}
