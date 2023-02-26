import { Router } from '@vaadin/router';
import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { mvpCss } from '../styles-3rdParty';

@customElement('not-found')
export class NotFound extends LitElement {
  static styles = [
    mvpCss,
    css`
      article {
        text-align: center;
      }
      header {
        color: red;
      }
    `,
  ];

  render() {
    return html`
      <article>
        <header>
          <h2>We don't have what you are looking for... sorry! :(</h2>
        </header>
        <button @click="${() => Router.go('/')}">Back to home</button>
      </article>
    `;
  }
}
