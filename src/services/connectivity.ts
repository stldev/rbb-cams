import { storeSvc } from '../store/camera';

// TODO: if offline use service worker to show different b64imgs
const SECONDS_TO_WAIT = 60;

export async function checkOnline() {
  function* keepChecking() {
    while (true) yield true;
  }

  for await (const i of keepChecking()) {
    const url = 'https://rickb-org.firebaseio.com/rbbHeading.json';

    try {
      const data = await (await fetch(url)).text();
      if (data === '"Welcome!"') {
        storeSvc.offline$.next(false);
        console.log('WE ARE ONLINE!');
      } else {
        throw new Error('Expected data="Welcome!" but got different result.');
      }
    } catch (err) {
      storeSvc.offline$.next(true);
      console.error('RBB_ERROR: now offline :(', err);
    } finally {
      console.log(`last checked on: ${new Date().toLocaleString()}`);
      await new Promise(resolve => setTimeout(() => resolve(''), SECONDS_TO_WAIT * 1000));
    }
  }
}
