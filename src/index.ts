import './store/index';
import './services/index';
import './router';

if (globalThis.matchMedia('(display-mode: standalone)').matches) {
  document.body.setAttribute('onkeydown', 'return (event.keyCode != 116)');
  console.log('STANDALONE = YES');
}
