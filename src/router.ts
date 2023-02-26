import { Route, Router } from '@vaadin/router';
import './app';
import './components/CamerasHeader';

const routes: Route[] = [
  {
    path: '/',
    component: 'rbb-app',
    children: [
      {
        path: 'grid',
        component: 'cameras-grid',
        action: async () => {
          await import('./components/CamerasGrid');
        },
      },
      {
        path: 'secret',
        component: 'rbb-secret',
        action: async () => {
          await import('./components/Secret');
        },
      },
      {
        path: 'links',
        component: 'rbb-links',
        action: async () => {
          await import('./components/Links');
        },
      },
      {
        path: 'notifications',
        component: 'rbb-notifications',
        action: async () => {
          await import('./components/Notifications');
        },
      },
    ],
  },
  {
    path: '(.*)',
    component: 'not-found',
    action: async () => {
      await import('./components/NotFound');
    },
  },
];

const outlet = document.getElementById('outlet');
export const router = new Router(outlet);
router.setRoutes(routes);
