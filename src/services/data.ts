/* eslint-disable prefer-template */
/* eslint-disable lines-between-class-members */
import { take, ReplaySubject } from 'rxjs';
import { storeSvc } from '../store/camera';
import { ICamera, ICameraVars } from '../models/index';

class FetchDataService {
  private rbbCamerasUrl: string =
    'https://rickb-org.firebaseio.com/rbbCameras.json';
  private isLocalNetwork: boolean = null;
  private allLocations: any[] = [];
  private cameras$ = storeSvc.cameras$ as ReplaySubject<ICamera[]>;
  private isLocalNetwork$ = storeSvc.isLocalNetwork$ as ReplaySubject<boolean>;

  async init() {
    this.isLocalNetwork$.subscribe(isLocalNetwork => {
      this.isLocalNetwork = isLocalNetwork;
    });

    const data = await (await fetch(this.rbbCamerasUrl)).json();
    this.allLocations = data.length > 0 ? data : [];

    if (this.isLocalNetwork) {
      this.allLocations = this.allLocations.filter(loc =>
        loc.locationId.startsWith('rbb-')
      );
    }

    const mimeType = 'data:image/svg+xml;charset=UTF-8,';
    const imgBase64 =
      mimeType +
      "%3Csvg width='640' height='90' xmlns='http://www.w3.org/2000/svg' " +
      "xmlns:svg='http://www.w3.org/2000/svg'%3E%3Ctext fill='%23ccc' " +
      "font-family='Serif' font-size='24' stroke='%23000000' stroke-width='0' text-anchor='middle' x='312' " +
      "xml:space='preserve' y='63'%3E__BASE64__%3C/text%3E%3C/svg%3E";

    const allCamerasList = this.allLocations.map(location => {
      const base64ToUse = imgBase64.replace('__BASE64__', location.locationId);
      return {
        locationId: location.locationId,
        name: location.locationId,
        ip: 'n/a',
        imgBase64: base64ToUse,
      } as ICamera;
    });

    this.cameras$.next(allCamerasList);

    allCamerasList.forEach(cam => {
      this.getVars(cam.locationId);
      this.getBigImg(cam.locationId);
    });

    const DELAY_SECS = 60 * 1000;
    setInterval(() => {
      allCamerasList.forEach(cam => this.getBigImg(cam.locationId));
    }, DELAY_SECS);
  }

  public getVarsAfterNewSecret() {
    this.allLocations.forEach(loc => {
      this.getVars(loc.locationId);
      this.getBigImg(loc.locationId);
    });
  }

  async getVars(locationId: string) {
    console.log('isLocalNetwork', this.isLocalNetwork);

    let url = '';
    if (this.isLocalNetwork) {
      url = process.env.URL_VARS_LOCAL + locationId;
    } else {
      url = process.env.URL_VARS_CLOUD;
    }

    const rbbSecret = localStorage.getItem('rbb-secret');

    let resp: any = {};

    if (!rbbSecret || rbbSecret.length < 9) {
      resp.js =
        "function getVars() { return { name: 'local', ip: '0.0.0.0' }; } ";
    } else {
      const headers = { 'rbb-secret': rbbSecret };
      if (!this.isLocalNetwork) headers['location-id'] = locationId;

      resp = await (await fetch(url, { headers })).json().catch(e => e);
    }

    if (resp instanceof Error) {
      console.error('RBB-ERR: ', resp);
      return;
    }

    if (resp && resp.js) {
      // eslint-disable-next-line no-new-func
      const camVars = new Function('return ' + resp.js)()() as ICameraVars;

      this.cameras$.pipe(take(1)).subscribe(cameras => {
        const camerasCopy = JSON.parse(JSON.stringify(cameras)) as ICamera[];

        const match =
          camerasCopy.find(cam => cam.locationId === locationId) ||
          ({} as ICamera);

        match.name = camVars.name;
        match.ip = camVars.ip;
        this.cameras$.next(camerasCopy);
      });
    }
  }

  async getBigImg(locationId: string) {
    let url = '';
    if (this.isLocalNetwork) {
      url =
        process.env.URL_BIGIMG_LOCAL + locationId + '&path=dms?nowprofileid=1';
    } else {
      url = process.env.URL_BIGIMG_CLOUD;
    }

    const rbbSecret = localStorage.getItem('rbb-secret');

    let resp: any = {};

    let mimeType = 'data:image/jpeg;base64,';

    if (!rbbSecret || rbbSecret.length < 9) {
      mimeType = 'data:image/svg+xml;charset=UTF-8,';
      resp.b64img =
        "%3Csvg width='640' height='90' xmlns='http://www.w3.org/2000/svg' " +
        "xmlns:svg='http://www.w3.org/2000/svg'%3E%3Ctext fill='%23ccc' font-family='Serif' " +
        "font-size='24' stroke='%23000000' stroke-width='0' text-anchor='middle' x='312' " +
        "xml:space='preserve' y='63'%3Eno image being served%3C/text%3E%3C/svg%3E";
    } else {
      const headers = { 'rbb-secret': rbbSecret };
      if (!this.isLocalNetwork) headers['location-id'] = locationId;

      resp = await (await fetch(url, { headers })).json().catch(e => e);
    }

    if (resp instanceof Error) {
      console.error('RBB-ERR: ', resp);
      return;
    }

    this.cameras$.pipe(take(1)).subscribe(cameras => {
      const camerasCopy = JSON.parse(JSON.stringify(cameras)) as ICamera[];

      const match =
        camerasCopy.find(cam => cam.locationId === locationId) ||
        ({} as ICamera);

      if (resp.b64img) {
        match.imgBase64 = `${mimeType}${resp.b64img}`;
      }

      this.cameras$.next(camerasCopy);
    });
  }

  // async acceptPushAlerts(subscription: PushSubscription) {
  // TODO: you could send and store the subscription in database then have backend function to...
  // use web-push to send out messages to all those subscriptions
  // }
}

export const fetchDataSvc = new FetchDataService();
