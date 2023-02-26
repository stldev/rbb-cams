import { LitElement, html, css } from 'lit';
import { customElement, state, query } from 'lit/decorators.js';
import { Subscription, ReplaySubject } from 'rxjs';
import { mvpCss } from '../styles-3rdParty';
import { storeSvc } from '../store/camera';
import { IGlobalThis } from '../models';

@customElement('rbb-notifications')
export class RbbNotifications extends LitElement {
  @state() allSubs = new Subscription();

  @state() hideButton: boolean = true;

  @state() deferredPrompt: any = null;

  @query('textarea') _subscriptionJson: HTMLTextAreaElement;

  @query('button') _pushBtn: HTMLButtonElement;

  @state() deferredPrompt$ = storeSvc.deferredPrompt$ as ReplaySubject<boolean>;

  @state() isSubscribed = false;

  @state() swRegistration = (globalThis as unknown as IGlobalThis)
    .swRegistration;

  static styles = [
    mvpCss,
    css`
      article {
        margin: 3rem;
        padding: 3rem;
        background-color: #ddd;
      }
    `,
  ];

  private urlB64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      // eslint-disable-next-line no-useless-escape
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = globalThis.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  private updateBtn() {
    if (Notification.permission === 'denied') {
      this._pushBtn.textContent = 'Push Notifications Perms Denied.';
      this._pushBtn.disabled = true;
      this.updateSubscriptionOnServer(null);
      return;
    }

    if (this.isSubscribed) {
      this._pushBtn.textContent = 'Disable Push';
    } else {
      this._pushBtn.textContent = 'Enable Push';
    }

    this._pushBtn.disabled = false;
  }

  private updateSubscriptionOnServer(subscription: any) {
    // TODO: Send subscription to application server
    console.log('subscription', subscription);
    if (subscription) {
      this._subscriptionJson.value = JSON.stringify(subscription);
      this._subscriptionJson.innerHTML = JSON.stringify(subscription);
    }
  }

  private subscribeUser() {
    const applicationServerKey = this.urlB64ToUint8Array(
      process.env.APPSERVER_PUBLICKEY
    );
    this.swRegistration.pushManager
      .subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      })
      .then((subscription: any) => {
        console.log('User is subscribed.');

        this.updateSubscriptionOnServer(subscription);

        this.isSubscribed = true;

        this.updateBtn();
      })
      .catch((err: Error) => {
        console.log('Failed to subscribe the user: ', err);
        this.updateBtn();
      });
  }

  private unsubscribeUser() {
    this.swRegistration.pushManager
      .getSubscription()
      .then((subscription: any) => {
        if (subscription) return subscription.unsubscribe();
        return '';
      })
      .catch((error: Error) => {
        console.log('Error unsubscribing', error);
      })
      .then(() => {
        this.updateSubscriptionOnServer(null);

        console.log('User is unsubscribed.');
        this.isSubscribed = false;

        this.updateBtn();
      });
  }

  private clickPushBtn() {
    if (this.swRegistration) {
      this._pushBtn.disabled = true;
      if (this.isSubscribed) {
        this.unsubscribeUser();
      } else {
        this.subscribeUser();
      }
    }
  }

  private initializeUI() {
    const rbbSw = navigator.serviceWorker;

    if (
      rbbSw &&
      this.swRegistration
      // (rbbSw as any).controller &&
      // (rbbSw as any).controller.scriptURL ===
      //   'https://rbb-cameras.web.app/rbb-sw.js'
    ) {
      // Set the initial subscription value
      this.swRegistration.pushManager
        .getSubscription()
        .then((subscription: any) => {
          this.isSubscribed = !(subscription === null);

          this.updateSubscriptionOnServer(subscription);

          if (this.isSubscribed) {
            console.log('User IS subscribed.');
          } else {
            console.log('User is NOT subscribed.');
          }

          this.updateBtn();
        });
    } else {
      this._pushBtn.disabled = true;
      this._pushBtn.title = 'You do not have a service worker registered!';
    }
  }

  firstUpdated() {
    const sub2 = this.deferredPrompt$.subscribe(deferredPrompt => {
      this.deferredPrompt = deferredPrompt || null;
      if (this.deferredPrompt) this.hideButton = false;
    });

    this.allSubs.add(sub2);

    setTimeout(() => {
      this.initializeUI();
    }, 50);
  }

  disconnectedCallback() {
    this.allSubs.unsubscribe();
    console.log(`${this.tagName} destroyed!`);
  }

  render() {
    return html`
      <article>
        <button @click="${this.clickPushBtn}">Enable Push</button>
        <textarea readonly contenteditable="true">...</textarea>
      </article>
    `;
  }
}
