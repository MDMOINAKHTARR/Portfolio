import { lazy, Suspense, type ReactNode } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dossier } from './pages/Dossier';
import { ThemeProvider } from './context/ThemeContext';
import { GlobalAudio } from './components/GlobalAudio';
import { CommandCenter } from './components/CommandCenter';

const Capabilities = lazy(() => import('./pages/Capabilities').then((module) => ({ default: module.Capabilities })));
const Operations = lazy(() => import('./pages/Operations').then((module) => ({ default: module.Operations })));
const Evidence = lazy(() => import('./pages/Evidence').then((module) => ({ default: module.Evidence })));
const Comms = lazy(() => import('./pages/Comms').then((module) => ({ default: module.Comms })));

const loadRoute = (element: ReactNode) => (
  <Suspense fallback={<RouteFallback />}>
    {element}
  </Suspense>
);

function RouteFallback() {
  return (
    <div className="flex min-h-[55vh] w-full items-center justify-center px-6 font-mono text-ink">
      <div className="text-[10px] font-black tracking-[0.2em] opacity-55">Loading…</div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <GlobalAudio />
        <CommandCenter />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dossier />} />
            <Route path="capabilities" element={loadRoute(<Capabilities />)} />
            <Route path="operations" element={loadRoute(<Operations />)} />
            <Route path="evidence" element={loadRoute(<Evidence />)} />
            <Route path="comms" element={loadRoute(<Comms />)} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
