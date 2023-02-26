import { LitElement, html, css } from 'lit';
import { customElement, query } from 'lit/decorators.js';
import { mvpCss } from '../styles-3rdParty';
import { fetchDataSvc } from '../services/data';

@customElement('rbb-secret')
export class Secret extends LitElement {
  static styles = [
    mvpCss,
    css`
      section {
        background-color: #ddd;
      }
      form {
        background-color: lightblue;
      }
    `,
  ];

  @query('#rbb-secret') _inputEle: HTMLInputElement;

  disconnectedCallback() {
    console.log(`${this.tagName} destroyed!`);
  }

  private setRbbSecretShortcut(evt: KeyboardEvent) {
    if (evt.key === 'Enter') {
      evt.preventDefault();
      this.setRbbSecret();
    }
  }

  private setRbbSecret() {
    localStorage.setItem('rbb-secret', this._inputEle.value);
    this._inputEle.value = '';
    fetchDataSvc.getVarsAfterNewSecret();
  }

  render() {
    return html`
      <section>
        <form>
          <header>
            <h2>Do you know it?</h2>
          </header>
          <label for="rbb-secret">Secret:</label>

          <input
            id="rbb-secret"
            name="rbb-secret"
            type="password"
            @keydown=${(e: KeyboardEvent) => this.setRbbSecretShortcut(e)}
          />

          <button type="button" @click="${this.setRbbSecret}">GO!</button>
        </form>
      </section>
    `;
  }
}
