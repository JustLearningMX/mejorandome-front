import type { WeightMeasurementResponse } from '../types/weight';
import type { StepsHistoryItem } from '../types/activity';
import { getLocalDateString, shiftLocalDate } from './date';

export interface SparklineGeometry {
  linePoints: string;
  areaPoints: string;
  lastPoint: { x: number; y: number };
}

export interface WeekBar {
  localDate: string;
  steps: number;
  heightPct: number;
  goalReached: boolean;
  isToday: boolean;
  dayLabel: string;
}

const WEEKDAY_INITIALS = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];

export function latestWeightPerDay(measurements: WeightMeasurementResponse[]): number[] {
  const byDay = new Map<string, WeightMeasurementResponse>();
  for (const item of measurements) {
    const current = byDay.get(item.healthDay.localDate);
    if (!current || item.occurredAt > current.occurredAt) {
      byDay.set(item.healthDay.localDate, item);
    }
  }
  return [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, item]) => item.weightKg);
}

export function buildSparkline(
  values: number[],
  width: number,
  height: number,
  padding: number
): SparklineGeometry | null {
  if (values.length < 2) return null;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const stepX = (width - padding * 2) / (values.length - 1);

  const points = values.map((value, index) => ({
    x: padding + index * stepX,
    y: padding + (1 - (value - min) / range) * (height - padding * 2),
  }));

  const format = (p: { x: number; y: number }) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
  const linePoints = points.map(format).join(' ');
  const first = points[0];
  const last = points[points.length - 1];
  const areaPoints = `${format({ x: first.x, y: height })} ${linePoints} ${format({ x: last.x, y: height })}`;

  return { linePoints, areaPoints, lastPoint: last };
}

export function buildWeekBars(
  items: StepsHistoryItem[],
  goal: number,
  daysCount = 7
): WeekBar[] {
  const today = getLocalDateString();
  const stepsByDate = new Map(items.map((item) => [item.localDate, item.steps]));

  return Array.from({ length: daysCount }, (_, index) => {
    const localDate = shiftLocalDate(today, index - (daysCount - 1));
    const steps = stepsByDate.get(localDate) ?? 0;
    const [year, month, day] = localDate.split('-').map(Number);
    return {
      localDate,
      steps,
      heightPct: goal > 0 ? Math.min(100, Math.round((steps / goal) * 100)) : 0,
      goalReached: goal > 0 && steps >= goal,
      isToday: localDate === today,
      dayLabel: WEEKDAY_INITIALS[new Date(year, month - 1, day).getDay()],
    };
  });
}
