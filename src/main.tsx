import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router';
import { ThemeProvider } from 'styled-components';
import Layout from './spa/layout';
import NotFound from './pages/not-found';
import { ROUTES, type AppRoute } from './routes';
import { GlobalStyle, theme } from './design/theme';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            {ROUTES.map((route: AppRoute) => (
              <Route
                key={route.path}
                index={route.index}
                path={route.path}
                element={route.getElement()}
              />
            ))}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
);
