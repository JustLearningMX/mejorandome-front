import { authService } from '../services/auth.service';
import { getAppUrl } from './paths';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => Promise<void> | void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              type?: 'standard' | 'icon';
              theme?: 'outline' | 'filled_blue' | 'filled_black';
              size?: 'small' | 'medium' | 'large';
              text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
              shape?: 'rectangular' | 'pill' | 'circle' | 'square';
              logo_alignment?: 'left' | 'center';
              width?: number | string;
            }
          ) => void;
          prompt: (notification?: (notification: unknown) => void) => void;
        };
      };
    };
  }
}

let isInitialized = false;

export function showAuthNotification(message: string, type: 'info' | 'error' | 'success' = 'info'): void {
  let toast = document.getElementById('auth-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'auth-toast';
    toast.className = 'auth-toast';
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.setAttribute('data-type', type);
  toast.classList.add('visible');

  setTimeout(() => {
    toast?.classList.remove('visible');
  }, 4500);
}

export async function handleGoogleCredential(credential: string): Promise<void> {
  try {
    showAuthNotification('Autenticando con el servidor...', 'info');
    const result = await authService.loginWithGoogle(credential);
    showAuthNotification(`¡Bienvenido, ${result.user.name}!`, 'success');
    setTimeout(() => {
      window.location.href = getAppUrl('dashboard');
    }, 500);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al iniciar sesión';
    showAuthNotification(message, 'error');
    console.error('Fallo en autenticación con Google:', error);
  }
}

export function initGoogleAuth(): void {
  if (typeof window === 'undefined') return;

  const clientId = import.meta.env.PUBLIC_GOOGLE_CLIENT_ID;

  const setupGIS = () => {
    if (!window.google?.accounts?.id) return false;

    if (!isInitialized && clientId) {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          if (response.credential) {
            await handleGoogleCredential(response.credential);
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });
      isInitialized = true;
    }

    // Renderizar botones oficiales en los contenedores designados
    document.querySelectorAll<HTMLElement>('[data-gsi-container]').forEach((container) => {
      if (container.dataset.rendered === 'true') return;
      const size = (container.dataset.gsiSize as 'small' | 'medium' | 'large') || 'medium';
      const shape = (container.dataset.gsiShape as 'rectangular' | 'pill') || 'rectangular';
      const text = (container.dataset.gsiText as 'signin_with' | 'continue_with') || 'signin_with';

      try {
        if (clientId && window.google?.accounts?.id) {
          window.google.accounts.id.renderButton(container, {
            type: 'standard',
            theme: 'outline',
            size,
            shape,
            text,
            logo_alignment: 'left',
          });
          container.dataset.rendered = 'true';
        }
      } catch (err) {
        console.warn('No se pudo renderizar el botón de Google en el contenedor:', err);
      }
    });

    return true;
  };

  // Intentar montar de inmediato o con polling suave hasta que cargue el script de GIS
  if (!setupGIS()) {
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if (setupGIS() || attempts > 20) {
        clearInterval(interval);
      }
    }, 250);
  }

  // Vincular eventos a botones personalizados con data-google-auth-trigger
  document.querySelectorAll<HTMLElement>('[data-google-auth-trigger]').forEach((btn) => {
    if (btn.dataset.bound === 'true') return;
    btn.dataset.bound = 'true';

    btn.addEventListener('click', () => {
      if (!clientId) {
        showAuthNotification(
          'Configura PUBLIC_GOOGLE_CLIENT_ID en .env para autenticar con Google.',
          'info'
        );
        return;
      }

      if (window.google?.accounts?.id) {
        window.google.accounts.id.prompt();
      } else {
        showAuthNotification('Cargando servicio de Google, intenta de nuevo...', 'info');
      }
    });
  });
}

// Actualizar visualización del estado de autenticación en navbars
export function updateAuthUI(): void {
  if (typeof window === 'undefined') return;

  const user = authService.getStoredUser();
  const token = authService.getStoredToken();
  const isLoggedIn = Boolean(token && user);

  document.querySelectorAll<HTMLElement>('[data-auth-guest]').forEach((el) => {
    el.style.display = isLoggedIn ? 'none' : '';
  });

  document.querySelectorAll<HTMLElement>('[data-auth-user]').forEach((el) => {
    el.style.display = isLoggedIn ? '' : 'none';
  });

  if (isLoggedIn && user) {
    document.querySelectorAll<HTMLElement>('[data-user-name]').forEach((el) => {
      el.textContent = user.name;
    });

    document.querySelectorAll<HTMLElement>('[data-user-email]').forEach((el) => {
      el.textContent = user.email;
    });

    const initial = user.name ? user.name.trim().charAt(0).toUpperCase() : 'U';

    document.querySelectorAll<HTMLElement>('[data-user-initial]').forEach((el) => {
      el.textContent = initial;
    });

    // Renderizar foto de Google o inicial con manejo de error de carga
    document.querySelectorAll<HTMLElement>('[data-user-avatar-wrap]').forEach((wrap) => {
      const img = wrap.querySelector<HTMLImageElement>('[data-user-photo]');
      const init = wrap.querySelector<HTMLElement>('[data-user-initial]');

      if (user.picture && img) {
        img.src = user.picture;
        img.alt = user.name || 'Avatar';
        img.style.display = 'block';
        if (init) init.style.display = 'none';

        img.onerror = () => {
          img.style.display = 'none';
          if (init) init.style.display = '';
        };
      } else {
        if (img) img.style.display = 'none';
        if (init) init.style.display = '';
      }
    });
  }

  // Vincular botones de cerrar sesión
  document.querySelectorAll<HTMLElement>('[data-logout-button]').forEach((btn) => {
    if (btn.dataset.bound === 'true') return;
    btn.dataset.bound = 'true';

    btn.addEventListener('click', () => {
      authService.clearSession();
      showAuthNotification('Sesión finalizada', 'info');
      setTimeout(() => {
        window.location.href = getAppUrl();
      }, 300);
    });
  });
}
