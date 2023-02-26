/* eslint-disable lit-a11y/click-events-have-key-events */
/* eslint-disable lit-a11y/anchor-is-valid */
import { LitElement, html, css } from 'lit';
import { customElement, state, query } from 'lit/decorators.js';
import { Subscription, ReplaySubject } from 'rxjs';
import { mvpCss } from '../styles-3rdParty';
import { storeSvc } from '../store/camera';

@customElement('cameras-header')
export class CamerasHeader extends LitElement {
  @state() allSubs = new Subscription();

  @state() isOffline: boolean = false;

  @state() hideButton: boolean = true;

  @state() deferredPrompt: any = null;

  @query('#mySidenav') _sideNav: HTMLDivElement;

  @query('#backdrop') _backDrop: HTMLDivElement;

  @state() offline$ = storeSvc.offline$ as ReplaySubject<boolean>;

  @state() deferredPrompt$ = storeSvc.deferredPrompt$ as ReplaySubject<boolean>;

  static styles = [
    mvpCss,
    css`
      .backdrop-container {
        display: none;
        position: fixed;
        z-index: 2;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        overflow: auto;
        background-color: rgb(0, 0, 0);
        background-color: rgba(0, 0, 0, 0.4);
        -webkit-animation: fadeIn 1.2s ease-in-out;
        animation: fadeIn 1.2s ease-in-out;
      }

      nav {
        width: 100%;
        height: 5vh;
        display: flex;
        justify-content: space-between;
        align-items: center;
        position: fixed;
        top: 0;
        left: 0;
        background-color: white;
        z-index: 1;
      }

      .mobile-nav-open-icon {
        font-size: 2rem;
        padding: 1rem;
        cursor: pointer;
        margin-right: 2rem;
        color: black;
        margin-left: 1rem;
      }

      .sidenav-container {
        height: 100%;
        width: 0;
        position: fixed;
        z-index: 3;
        top: 0;
        left: 0;
        background-color: #111;
        overflow-x: hidden;
        transition: 0.5s;
        padding-top: 10px;
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .sidenav-container a {
        text-decoration: none;
        font-size: 1rem;
        color: #818181;
        display: block;
        transition: 0.3s;
        margin: 10px 0;
      }

      .sidenav-container a:hover {
        color: #f1f1f1;
      }

      .sidenav-container .closebtn {
        font-size: 3rem;
        font-weight: 700;
        color: #c9002b;
        padding-right: 1rem;
      }

      .sidenav-container .drawer-close-button {
        height: 3rem;
        width: 100%;
        display: flex;
        justify-content: flex-end;
        align-items: center;
        margin-bottom: 3rem;
      }

      .is-online {
        font-size: 2rem;
        margin-right: 2rem;
      }

      @media all and (display-mode: standalone) {
        #pwa-install-btn {
          display: none;
        }
      }

      @media only screen and (display-mode: standalone) and (min-device-width: 375px) and (max-device-width: 812px) and (orientation: portrait) {
        nav {
          background: #389466;
          position: fixed;
          width: 100%;
          height: 40px;
          top: 0;
          z-index: 1;
        }
        .cards {
          margin-top: 45px;
        }
      }

      @media only screen and (display-mode: standalone) and (min-device-width: 375px) and (max-device-width: 667px) and (orientation: portrait) {
        nav {
          background: #389466;
          position: fixed;
          width: 100%;
          height: 40px;
          top: 0;
          z-index: 1;
        }
        .cards {
          margin-top: 45px;
        }
      }
      #pwa-install-btn {
        padding: 0.4rem;
      }
    `,
  ];

  private offlineStatus(isOffline: boolean) {
    if (isOffline) {
      return html`<span style="color:#ff1493;font-size:1.1rem;">OFFline</span>`;
    }
    return html`<span style="color:lightgreen;">online</span>`;
  }

  private async installPwa() {
    this.deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await this.deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    // We've used the prompt, and can't use it again, throw it away
    this.deferredPrompt = null;
    // doing reload because if not, then user can reload one time in pwa
    window.location.reload();
  }

  private openNav() {
    this._sideNav.style.width = '50%'; // opens side navbar by 70 percent
    this._backDrop.style.display = 'block'; // displays overlay
  }

  private closeNav() {
    this._sideNav.style.width = '0';
    this._backDrop.style.display = 'none';
  }

  firstUpdated() {
    const sub1 = this.offline$.subscribe(isOffline => {
      this.isOffline = isOffline;
    });

    const sub2 = this.deferredPrompt$.subscribe(deferredPrompt => {
      this.deferredPrompt = deferredPrompt || null;
      if (this.deferredPrompt) this.hideButton = false;
    });

    this.allSubs.add(sub1);
    this.allSubs.add(sub2);
  }

  disconnectedCallback() {
    this.allSubs.unsubscribe();
    console.log(`${this.tagName} destroyed!`);
  }

  render() {
    return html`
      <div id="mySidenav" class="sidenav-container">
        <span class="drawer-close-button">
          <a
            href="javascript:void(0)"
            class="closebtn"
            @click="${this.closeNav}"
            >&times;</a
          >
        </span>

        <a href="/grid" @click="${this.closeNav}">Grid</a>
        <a href="/secret" @click="${this.closeNav}">Secret</a>
        <a href="/links" @click="${this.closeNav}">Links</a>
        <a href="/notifications" @click="${this.closeNav}">Notifications</a>
      </div>
      <div class="backdrop-container" id="backdrop"></div>
      <nav>
        <span @click="${this.openNav}" class="mobile-nav-open-icon"
          >&#9776;</span
        >
        <button
          id="pwa-install-btn"
          style="${this.hideButton ? 'display:none;' : ''}"
          @click="${this.installPwa}"
        >
          Install
        </button>
        <span class="is-online"
          >${this.isOffline
            ? this.offlineStatus(true)
            : this.offlineStatus(false)}
        </span>
      </nav>
    `;
  }
}
