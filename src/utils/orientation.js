import { ScreenOrientation } from '@capacitor/screen-orientation';
import { Capacitor } from '@capacitor/core';
import { toast } from 'sonner';

/**
 * Alterna a orientação da tela entre Modo Paisagem (Horizontal) e Retrato (Vertical)
 * Suporta aplicativo nativo Android (Capacitor) e Navegadores Mobile (Web)
 */
export async function toggleScreenOrientation() {
  try {
    const isNative = Capacitor.isNativePlatform();
    const isLandscape = window.innerWidth > window.innerHeight;

    if (isNative) {
      try {
        const current = await ScreenOrientation.orientation();
        const isCurrentlyLandscape = current?.type?.includes('landscape') || isLandscape;

        if (isCurrentlyLandscape) {
          await ScreenOrientation.lock({ orientation: 'portrait' });
          toast.success('Tela girada: Modo Vertical (Retrato)');
        } else {
          await ScreenOrientation.lock({ orientation: 'landscape' });
          toast.success('Tela girada: Modo Horizontal (Paisagem)');
        }
        return;
      } catch (e) {
        // Fallback nativo
        if (isLandscape) {
          await ScreenOrientation.lock({ orientation: 'portrait' }).catch(() => {});
        } else {
          await ScreenOrientation.lock({ orientation: 'landscape' }).catch(() => {});
        }
        return;
      }
    }

    // Ambiente Navegador Web Mobile
    if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
      try {
        await document.documentElement.requestFullscreen();
      } catch (e) {}
    }

    if (window.screen?.orientation?.lock) {
      if (isLandscape) {
        await window.screen.orientation.lock('portrait');
        toast.success('Tela girada: Modo Vertical');
      } else {
        await window.screen.orientation.lock('landscape');
        toast.success('Tela girada: Modo Horizontal');
      }
      return;
    }

    toast.info('Gire o aparelho para alternar a tela.');
  } catch (err) {
    toast.info('Gire seu celular para alternar entre horizontal e vertical.');
  }
}
