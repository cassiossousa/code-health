import type { ReactNode } from 'react';
import Assessment from './pages/assessment';
import Home from './pages/home';

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
    to: '/repository-analysis',
    path: 'repository-analysis',
    label: 'Analyze',
    index: false,
    getElement: () => <Assessment />,
  },
];
