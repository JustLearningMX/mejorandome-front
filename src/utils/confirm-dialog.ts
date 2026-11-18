interface ConfirmOptions {
  message: string;
  title?: string;
  confirmLabel?: string;
}

export function confirmAction({
  message,
  title = 'Confirmar acción',
  confirmLabel = 'Eliminar',
}: ConfirmOptions): Promise<boolean> {
  const dialog = document.getElementById('confirm-dialog') as HTMLDialogElement | null;
  if (!dialog) return Promise.resolve(false);

  dialog.querySelector('#confirm-dialog-title')!.textContent = title;
  dialog.querySelector('#confirm-dialog-message')!.textContent = message;
  dialog.querySelector('#confirm-dialog-accept')!.textContent = confirmLabel;

  return new Promise((resolve) => {
    dialog.addEventListener('close', () => resolve(dialog.returnValue === 'confirm'), { once: true });
    dialog.returnValue = 'cancel';
    dialog.showModal();
  });
}
