import { html } from 'lit';

export const spotlightHtml = html`
  <!DOCTYPE html>
  <html>
    <head>
      <title>RbbCamsBig</title>
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <meta
        name="viewport"
        content="width=device-width,initial-scale=1,viewport-fit=cover"
      />

      <link rel="shortcut icon" href="favicon.ico" />
      <link rel="icon" href="favicon.svg" />

      <style>
        * {
          padding: 0;
          margin: 0;
        }
        p {
          text-align: center;
        }
        p button {
          padding: 0.25rem 1rem;
          margin: 0.25rem 1rem;
          font-size: large;
        }
      </style>
    </head>
    <body>
      <p><button onclick="globalThis.close()">CLOSE</button></p>
      <img
        alt=""
        id="MyImgBig"
        style="width:100%;height:auto;"
        src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="
      />

      <script>
        async function getImg() {
          const url = '__URL__';
          const rbbSecret = '__RBB-SECRET__';
          const locationId = '__LOCATION-ID__';
          let resp = {};
          let mimeType = 'data:image/jpeg;base64,';
          if (!rbbSecret || rbbSecret.length < 9) {
            mimeType = 'data:image/svg+xml;charset=UTF-8,';
            resp.b64img =
              "%3Csvg width='640' height='90' xmlns='http://www.w3.org/2000/svg' xmlns:svg='http://www.w3.org/2000/svg'%3E%3Ctext " +
              "fill='%23ff0000' font-family='Serif' font-size='24' stroke='%23000000' stroke-width='0' text-anchor='middle' x='312' " +
              "xml:space='preserve' y='63'%3Eno image being served%3C/text%3E%3C/svg%3E";
          } else {
            const headers = {
              'rbb-secret': rbbSecret,
            };

            // __ADD-HEADER__

            resp = await (await fetch(url, { headers })).json().catch(e => e);
          }
          if (resp instanceof Error) {
            console.error('RBB-ERR: ', resp);
            return;
          }
          const imgEle = document.getElementById('MyImgBig');
          imgEle.src = mimeType + resp.b64img;
        }
        getImg();
        setInterval(getImg, 9999);
      </script>
    </body>
  </html>
`;
