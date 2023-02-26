/* eslint-disable lines-between-class-members */
import { of, ReplaySubject, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { ICamera } from '../models/index';

class StoreService {
  public allSubs = new Subscription();
  public cameras$ = new ReplaySubject<ICamera[]>(1);
  public offline$ = new ReplaySubject<boolean>(1);
  public isLocalNetwork$ = new ReplaySubject<boolean>(1);
  public deferredPrompt$ = new ReplaySubject<any>(1);

  // TODO: put local network in localStorage? so we can swith on the fly?
  // TODO: put locations list in localStorage?
  init() {
    if (['192.168.2.222', 'localhost'].includes(globalThis.location.hostname)) {
      console.log('On local network.');
      this.isLocalNetwork$.next(true);
    } else {
      console.log('NOT running on local mgmt server!');
      this.isLocalNetwork$.next(false);
    }
    const source = of('is initialized').pipe(map(x => `Store ${x}!`));
    const sub = source.subscribe(console.log);
    this.allSubs.add(sub);
    this.allSubs.unsubscribe();
  }
}

export const storeSvc = new StoreService();
