const ICON_PATHS = {
  scale: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 10a4 4 0 0 1 8 0"/><path d="M12 10l2-2"/>',
  utensils: '<path d="M4 3v7a2 2 0 0 0 2 2 2 2 0 0 0 2-2V3"/><path d="M6 3v18"/><path d="M18 21V3c-2.5 1.5-4 4-4 7 0 2 1 3 4 3"/>',
  activity: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  chart: '<path d="M3 3v18h18"/><path d="M18 9l-5 5-2-2-4 4"/>',
  leaf: '<path d="M11 20A7 7 0 0 1 4 13c0-5 4-9 16-9 0 12-4 16-9 16z"/><path d="M4 21c2-4 5-7 9-9"/>',
  salad: '<path d="M3 11h18a9 9 0 0 1-18 0z"/><path d="M8 11c0-3 2-5 4-5s4 2 4 5"/>',
  sunrise: '<path d="M12 3v4M5.6 7.6l2.1 2.1M18.4 7.6l-2.1 2.1M3 17h18"/><path d="M7 17a5 5 0 0 1 10 0"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
  apple: '<path d="M12 7c-1-2-3-3-5-2-3 1-4 5-2 9 1.5 3 3 5 5 5 1 0 1.5-.5 2-.5s1 .5 2 .5c2 0 3.5-2 5-5 2-4 1-8-2-9-2-1-4 0-5 2z"/><path d="M12 7c0-2 1-4 3-5"/>',
  footsteps: '<path d="M4 16c0-3 1-5 3-5s3 2 3 5-1 4-3 4-3-1-3-4z"/><path d="M14 8c0-3 1-5 3-5s3 2 3 5-1 4-3 4-3-1-3-4z"/>',
  bike: '<circle cx="6" cy="17" r="3.5"/><circle cx="18" cy="17" r="3.5"/><path d="M6 17l4-8h5l3 8M10 9L8 6H6M13 13h-3"/>',
  waves: '<path d="M2 18c2 0 2-1.5 5-1.5s3 1.5 5 1.5 3-1.5 5-1.5 2 1.5 5 1.5"/><path d="M2 12c2 0 2-1.5 5-1.5s3 1.5 5 1.5 3-1.5 5-1.5 2 1.5 5 1.5"/>',
  dumbbell: '<path d="M6 6v12M18 6v12M3 9v6M21 9v6M6 12h12"/>',
  lotus: '<path d="M12 21c-4-2-7-5-7-9 3 0 5 1 7 4 2-3 4-4 7-4 0 4-3 7-7 9z"/><path d="M12 16c-2-2-2-6 0-9 2 3 2 7 0 9z"/>',
  zap: '<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>',
  ball: '<circle cx="12" cy="12" r="9"/><path d="M12 3v18M3 12h18M5.6 5.6c3 3 3 10.8 0 12.8M18.4 5.6c-3 3-3 10.8 0 12.8"/>',
  flame: '<path d="M12 22c4 0 7-3 7-7 0-3-2-5-3-7-1 2-2 3-3 3 0-3-1-6-4-9 0 5-4 7-4 12 0 4 3 8 7 8z"/>',
  sparkles: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 16v4M17 18h4"/>',
  check: '<path d="M20 6L9 17l-5-5"/>',
  message: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
} as const;

export type IconName = keyof typeof ICON_PATHS;

export function iconSvg(name: IconName, size = 16): string {
  return `<svg class="icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON_PATHS[name]}</svg>`;
}
