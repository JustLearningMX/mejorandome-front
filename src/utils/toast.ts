export type ToastType = 'info' | 'error' | 'success';

const REGION_ID = 'toast-region';
const DEFAULT_DURATION_MS = 4500;
const ERROR_DURATION_MS = 7000;
const LEAVE_ANIMATION_MS = 200;

function getRegion(): HTMLElement {
  let region = document.getElementById(REGION_ID);
  if (!region) {
    region = document.createElement('div');
    region.id = REGION_ID;
    region.className = 'toast-region';
    region.setAttribute('popover', 'manual');
    region.setAttribute('aria-live', 'polite');
    document.body.appendChild(region);
  }
  return region;
}

function bringToFront(region: HTMLElement): void {
  if (typeof region.showPopover !== 'function') return;
  if (region.matches(':popover-open')) region.hidePopover();
  region.showPopover();
}

function dismiss(toast: HTMLElement, region: HTMLElement): void {
  toast.classList.add('is-leaving');
  window.setTimeout(() => {
    toast.remove();
    if (!region.hasChildNodes() && region.matches(':popover-open')) region.hidePopover();
  }, LEAVE_ANIMATION_MS);
}

export function showToast(message: string, type: ToastType = 'info'): void {
  const region = getRegion();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.dataset.type = type;
  toast.setAttribute('role', type === 'error' ? 'alert' : 'status');
  toast.textContent = message;
  toast.addEventListener('click', () => dismiss(toast, region));

  region.appendChild(toast);
  bringToFront(region);

  const duration = type === 'error' ? ERROR_DURATION_MS : DEFAULT_DURATION_MS;
  window.setTimeout(() => dismiss(toast, region), duration);
}
