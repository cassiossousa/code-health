import type { ReactNode } from 'react';
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
    label: 'Assess',
    index: true,
    getElement: () => <Assessment />,
  },
];
