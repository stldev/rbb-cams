import { storeSvc } from '../store/camera';

globalThis.addEventListener('beforeinstallprompt', e => {
  // Prevent the mini-infobar from appearing on mobile
  e.preventDefault();
  // Stash the event so it can be triggered later.
  storeSvc.deferredPrompt$.next(e);
  // Optionally, send analytics event that PWA install promo was shown.
  console.log(`'beforeinstallprompt' event was fired.`);
});

globalThis.addEventListener('appinstalled', () => {
  // Clear the deferredPrompt so it can be garbage collected
  storeSvc.deferredPrompt$.next(null);
  console.log('PWA was installed');
});
