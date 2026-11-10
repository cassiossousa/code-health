import { Routes, Route } from 'react-router';
import Layout from './layouts/layout';
import Home from './pages/home';
import Stuff from './pages/stuff';
import NotFound from './pages/not-found';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="stuff" element={<Stuff />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
