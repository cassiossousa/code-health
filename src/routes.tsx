import type { ReactNode } from 'react';
import Home from './pages/home';
import Assessment from './pages/assessment';

export interface AppRoute {
  to: string;
  path: string;
  label: string;
  index: boolean;
  getElement: () => ReactNode;
}

export const ROUTES: AppRoute[] = [
  {
    to: '/',
    path: '',
    label: 'Home',
    index: true,
    getElement: () => <Home />,
  },
  {
    to: '/assessment',
    path: 'assessment',
    label: 'Assess',
    index: false,
    getElement: () => <Assessment />,
  },
];
