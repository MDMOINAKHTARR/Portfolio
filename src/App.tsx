import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dossier } from './pages/Dossier';
import { Capabilities } from './pages/Capabilities';
import { Operations } from './pages/Operations';
import { Evidence } from './pages/Evidence';
import { Comms } from './pages/Comms';
import { ThemeProvider } from './context/ThemeContext';
import { GlobalAudio } from './components/GlobalAudio';

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <GlobalAudio />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dossier />} />
            <Route path="capabilities" element={<Capabilities />} />
            <Route path="operations" element={<Operations />} />
            <Route path="evidence" element={<Evidence />} />
            <Route path="comms" element={<Comms />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
