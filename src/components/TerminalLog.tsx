import React, { useState, useEffect, useRef } from 'react';

const LOG_MESSAGES = [
  "Establishing secure connection...",
  "Bypassing firewall [PROT-9X]...",
  "Access granted. Decrypting protocol.",
  "Warning: Unauthorized access detected.",
  "Tracing origin IP address...",
  "Origin obfuscated. Rerouting through proxy.",
  "Downloading target profile...",
  "Data stream corrupted. Attempting recovery...",
  "Recovery successful. Parsing biometric data.",
  "Matching fingerprints: 89% probability.",
  "Cross-referencing global databases...",
  "Match found: ENR-06717711923.",
  "Initiating deep-scan on subject activities.",
  "Compiling recent operational history...",
  "Extracting 'CASSANDRA' files...",
  "Extracting 'HALO AI' files...",
  "Decryption complete. Ready for review."
];

export function TerminalLog() {
  const [logs, setLogs] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      setLogs((prev) => {
        const newLogs = [...prev, `[${new Date().toISOString().substring(11, 19)}] ${LOG_MESSAGES[currentIndex]}`];
        if (newLogs.length > 8) newLogs.shift();
        return newLogs;
      });
      currentIndex++;
      if (currentIndex >= LOG_MESSAGES.length) {
        clearInterval(interval);
      }
    }, Math.random() * 800 + 400); // Random delay between logs

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="mt-12 bg-black text-green-500 font-mono text-[10px] sm:text-xs p-3 sm:p-4 rounded-sm border border-green-900/50 shadow-[inset_0_0_10px_rgba(0,0,0,0.8)] relative overflow-hidden h-32 group">
       {/* Scanline overlay */}
       <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] pointer-events-none z-10 opacity-50"></div>
       
       <div className="absolute top-1 right-2 text-[8px] text-green-700 font-bold z-20">SYSTEM TERMINAL / LIVE</div>
       
       <div ref={scrollRef} className="relative z-0 h-full overflow-y-auto pr-2 scrollbar-hide space-y-1">
          {logs.map((log, i) => (
             <div key={i} className="opacity-80 break-all">{log}</div>
          ))}
          <div className="animate-pulse">_</div>
       </div>
    </div>
  );
}
