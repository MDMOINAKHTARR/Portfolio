import { lazy, Suspense, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowUpRight, Award, X } from 'lucide-react';

const PdfViewer = lazy(() => import('./PdfViewer').then((module) => ({ default: module.PdfViewer })));

type Certificate = {
  id: string;
  title: string;
  meta: string;
  preview: string;
  kind: 'image' | 'pdf';
  url: string;
};

const CERTIFICATES: Certificate[] = [
  {
    id: 'data-science-foundations',
    title: 'Data Science Foundations',
    meta: 'JPEG · 2024',
    preview: '/DATA SCIENCE FOUNDATIONS (2024).jpeg',
    kind: 'image',
    url: '/DATA SCIENCE FOUNDATIONS (2024).jpeg',
  },
  {
    id: 'ultimate-job-ready',
    title: 'The Ultimate Job Ready Data Science Course',
    meta: 'PDF',
    preview: '/ujr-certificate-preview.png',
    kind: 'pdf',
    url: '/The_Ultimate_Job_Ready_Data_Science_Course_Certificate.pdf',
  },
];

export function CertificatesSection() {
  const [activeCert, setActiveCert] = useState<Certificate | null>(null);

  useEffect(() => {
    if (!activeCert) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActiveCert(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeCert]);

  return (
    <>
      <div className="flex items-center gap-3 mb-6 mt-10 border-b-2 border-amber-900/20 pb-4">
        <div className="bg-amber-900/10 p-2.5 rounded-lg border border-amber-900/20 shadow-sm">
          <Award className="w-6 h-6 sm:w-8 sm:h-8 text-amber-700 dark:text-amber-500" />
        </div>
        <h2 className="text-xl sm:text-3xl font-black tracking-[0.15em] font-mono leading-none pt-[2px] text-amber-900 dark:text-amber-500 uppercase drop-shadow-sm">
          CERTIFICATES
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
        {CERTIFICATES.map((cert, index) => (
          <button
            key={cert.id}
            type="button"
            onClick={() => setActiveCert(cert)}
            className={`group relative flex cursor-pointer flex-col rounded-xl border border-ink/20 bg-doc p-3 text-left shadow-[0_1px_2px_rgba(0,0,0,0.05),0_18px_40px_-24px_rgba(0,0,0,0.5)] transition-all duration-300 hover:-translate-y-1 hover:border-ink/40 hover:shadow-[0_2px_4px_rgba(0,0,0,0.06),0_26px_50px_-22px_rgba(0,0,0,0.55)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink/50 animate-in fade-in duration-500 ${
              index === 0 ? 'delay-100' : 'delay-200'
            }`}
          >
            <div className="relative overflow-hidden rounded-lg bg-paper-shadow p-4 shadow-[inset_0_1px_3px_rgba(0,0,0,0.08)] ring-1 ring-inset ring-ink/10 sm:p-5">
              <img
                src={cert.preview}
                alt=""
                aria-hidden="true"
                loading="lazy"
                decoding="async"
                className="mx-auto block h-[190px] w-full object-contain shadow-[0_2px_10px_rgba(0,0,0,0.18)] transition-transform duration-300 group-hover:scale-[1.02] sm:h-[230px]"
              />
            </div>

            <div className="flex items-start justify-between gap-3 px-1 pt-4">
              <span className="font-mono text-[10px] font-bold uppercase leading-relaxed tracking-[0.28em] text-ink/65 sm:text-[11px]">
                Certificate // {cert.meta}
              </span>
              <ArrowUpRight
                className="mt-0.5 h-4 w-4 shrink-0 text-ink/40 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink sm:h-5 sm:w-5"
                aria-hidden="true"
              />
            </div>

            <h3 className="px-1 pb-1 pt-2 font-stamp text-lg leading-[1.25] text-ink sm:text-2xl">
              {cert.title}
            </h3>
          </button>
        ))}
      </div>

      {activeCert && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 pb-20 sm:pb-6 bg-ink/80 backdrop-blur-sm"
          onClick={() => setActiveCert(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`${activeCert.title} certificate`}
            className={`relative w-full max-w-4xl bg-paper shadow-2xl flex flex-col z-10 animate-in fade-in zoom-in duration-200 ${activeCert.kind === 'image' ? 'max-h-[85vh]' : 'h-[85vh]'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center bg-ink text-paper p-3 shrink-0">
              <span className="font-mono text-xs uppercase tracking-widest font-bold">Secure viewer // [encrypted data]</span>
              <button
                type="button"
                onClick={() => setActiveCert(null)}
                aria-label="Close certificate viewer"
                className="p-1 transition-colors hover:bg-paper/20"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className={`flex-1 w-full bg-zinc-200 relative overflow-hidden flex items-center justify-center ${activeCert.kind === 'image' ? 'p-4' : ''}`}>
              {activeCert.kind === 'image' ? (
                <img
                  src={activeCert.url}
                  alt={`${activeCert.title} certificate`}
                  className="max-w-full max-h-[75vh] object-contain shadow-md"
                />
              ) : (
                <Suspense fallback={<SecureViewerFallback />}>
                  <PdfViewer url={activeCert.url} />
                </Suspense>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

function SecureViewerFallback() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-zinc-200 p-8 font-mono text-zinc-700">
      <span className="text-[10px] font-black tracking-[0.22em] opacity-60">Loading viewer…</span>
    </div>
  );
}
