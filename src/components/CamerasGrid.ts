/* eslint-disable prefer-template */
import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { Subscription, ReplaySubject } from 'rxjs';
import { mvpCss } from '../styles-3rdParty';
import { storeSvc } from '../store/camera';
import { ICamera } from '../models/index';
import { spotlightHtml } from '../services/camera-spotlight';

@customElement('cameras-grid')
export class CamerasGrid extends LitElement {
  @state() allSubs = new Subscription();

  @state() camList: ICamera[] = [];

  @state() isLocalNetwork: boolean = null;

  @state() isLocalNetwork$ = storeSvc.isLocalNetwork$ as ReplaySubject<boolean>;

  @state() cameras$ = storeSvc.cameras$ as ReplaySubject<ICamera[]>;

  static styles = [
    mvpCss,
    css`
      section {
        max-width: 1870px;
        margin: 3rem auto 1rem auto;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(395px, 1fr));
        grid-gap: 0.1rem;
      }

      article {
        background-color: dodgerblue;
      }

      article a {
        color: #eee;
      }

      h4 {
        margin: 0.2rem;
      }

      img {
        height: auto;
        width: 100%;
      }

      button {
        padding: 0.1rem 0.7rem;
      }
    `,
  ];

  private getStream(ip: string) {
    const rtspUrl = 'rtsp://rbb:123@' + ip + '/live1.sdp';
    const urlRoot = 'http://localhost:8080/requests/status.xml';
    const queryParams = '?command=in_play&input=' + rtspUrl;
    const newWindow = window.open(urlRoot + queryParams);
    const DELAY_FIVE_SEC = 5555;
    setTimeout(() => {
      newWindow?.close();
    }, DELAY_FIVE_SEC);
  }

  private copyRtsp(locationId: string) {
    const buttonEle = this.shadowRoot?.querySelector(
      `button[data-rtsp-btn="${locationId}"]`
    ) as HTMLButtonElement;
    buttonEle.style.backgroundColor = 'lightgreen';
    const rtspUrl = 'rtsp://rbb:123@' + locationId.split('-')[1] + '/live1.sdp';
    const textArea = document.createElement('textArea') as HTMLTextAreaElement;
    textArea.readOnly = true;
    textArea.contentEditable = 'true';
    textArea.value = rtspUrl;
    textArea.innerHTML = rtspUrl;
    document.body.appendChild(textArea);
    const range = document.createRange();
    range.selectNodeContents(textArea);
    const selection = window.getSelection() as Selection;
    selection.removeAllRanges();
    selection.addRange(range);
    textArea.setSelectionRange(0, 999999);
    document.execCommand('copy');
    const DELAY_HALF_SEC = 555;
    setTimeout(() => {
      buttonEle.style.backgroundColor = '';
      document.body.removeChild(textArea);
    }, DELAY_HALF_SEC);
  }

  private openOneCam(locationId: string) {
    const newWindow = window.open('about:blank');
    const rbbSecret = localStorage.getItem('rbb-secret') as string;

    let url = '';
    if (this.isLocalNetwork) {
      url =
        process.env.URL_BIGIMG_LOCAL + locationId + '&path=dms?nowprofileid=1';
    } else {
      url = process.env.URL_BIGIMG_CLOUD;
    }

    // let html1 = spotlightHtml.getHTML();
    let html1 = spotlightHtml.strings[0];
    // console.log('------ HTML -------');
    // console.log(spotlightHtml);
    // console.log(spotlightHtml.strings);
    // console.log(html1);
    html1 = html1
      .replace('__URL__', url)
      .replace('__RBB-SECRET__', rbbSecret)
      .replace('__LOCATION-ID__', locationId);

    if (!this.isLocalNetwork) {
      html1 = html1.replace(
        '// __ADD-HEADER__',
        "headers['location-id'] = locationId;"
      );
    }

    newWindow?.document.write(html1);
    newWindow?.document.close();
  }

  firstUpdated() {
    const sub0 = this.cameras$.subscribe(cameras => {
      this.camList = cameras;
    });

    const sub1 = this.isLocalNetwork$.subscribe(isLocalNetwork => {
      this.isLocalNetwork = isLocalNetwork;
    });

    this.allSubs.add(sub0);
    this.allSubs.add(sub1);
  }

  disconnectedCallback() {
    this.allSubs.unsubscribe();
    console.log(`${this.tagName} destroyed!`);
  }

  render() {
    return html`
      <section>
        ${this.camList.map(
          cam => html`
            <article>
              <h4>
                <a href="http://${cam.ip}/status.htm" target="_blank">
                  ${cam.name}
                </a>
                &nbsp;
                <button @click=${() => this.openOneCam(cam.locationId)}>
                  BIG
                </button>
                &nbsp;
                <button @click="${() => this.getStream(cam.ip)}">PC</button>
                &nbsp;
                <button
                  data-rtsp-btn="${cam.locationId}"
                  @click="${() => this.copyRtsp(cam.locationId)}"
                >
                  VLC
                </button>
                &nbsp;
              </h4>
              <img alt="" src="${cam.imgBase64}" />
            </article>
          `
        )}
      </section>
    `;
  }
}
