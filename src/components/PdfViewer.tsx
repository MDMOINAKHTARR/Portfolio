import { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Loader2 } from 'lucide-react';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

export function PdfViewer({ url }: { url: string }) {
  const [numPages, setNumPages] = useState<number>();
  const [width, setWidth] = useState(800);

  useEffect(() => {
    const handleResize = () => {
      const container = document.getElementById('pdf-container');
      if (container) {
        setWidth(container.clientWidth - 32); // leave gap
      } else {
        setWidth(window.innerWidth > 1024 ? 900 : window.innerWidth - 64);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
  }

  return (
    <div id="pdf-container" className="w-full h-full bg-zinc-200 overflow-auto flex flex-col items-center justify-start pt-8 pb-8">
      <Document 
        file={url} 
        onLoadSuccess={onDocumentLoadSuccess}
        loading={
          <div className="flex flex-col items-center justify-center p-20 opacity-50">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p className="font-mono text-sm tracking-widest uppercase">Decrypting secure file...</p>
          </div>
        }
        error={
          <div className="flex flex-col items-center justify-center p-20 text-red-600 opacity-80">
            <p className="font-mono text-sm tracking-widest uppercase mb-2">Decryption Failed</p>
            <p className="font-mono text-xs">The requested asset could not be loaded.</p>
          </div>
        }
      >
        <Page 
          pageNumber={1} 
          renderTextLayer={false} 
          renderAnnotationLayer={false}
          className="shadow-2xl border border-ink/20"
          width={width > 900 ? 900 : width}
        />
      </Document>
    </div>
  );
}
