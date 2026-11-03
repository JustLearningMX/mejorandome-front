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

