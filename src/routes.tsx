import type { ReactNode } from 'react';
import Home from './pages/home';
import RepositoryAnalysis from './pages/repository-analysis';
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
    to: '/repository-analysis',
    path: 'repository-analysis',
    label: 'Analyze',
    index: false,
    getElement: () => <RepositoryAnalysis />,
  },
  {
    to: '/assessment',
    path: 'assessment',
    label: 'Assess',
    index: false,
    getElement: () => <Assessment />,
  },
];
