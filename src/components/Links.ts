import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { mvpCss } from '../styles-3rdParty';

@customElement('rbb-links')
export class RbbLinks extends LitElement {
  static styles = [
    mvpCss,
    css`
      article {
        margin: 6rem;
      }
    `,
  ];

  render() {
    return html`
      <article>
        <ul>
          <li><a href="http://192.168.2.1/">Router</a></li>
          <li><a href="https://rickb.org/">RickB.org</a></li>
        </ul>
      </article>
    `;
  }
}
