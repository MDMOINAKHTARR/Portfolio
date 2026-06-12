import React, { useState, useEffect } from 'react';

export function TrafficStatsBar() {
  const [visits, setVisits] = useState(0);
  const [uniqueVisits, setUniqueVisits] = useState(0);

  useEffect(() => {
    const fetchSystemStatus = async () => {
      try {
        const res = await fetch('/api/system-status');
        if (res.ok) {
          const contentType = res.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const data = await res.json();
            setVisits(data.totalVisits);
            setUniqueVisits(data.uniqueVisitors);
          }
        }
      } catch (err) {
        // Silently ignore network errors during polling
      }
    };
    
    fetchSystemStatus();
    
    // Poll every 30 seconds
    const int = setInterval(fetchSystemStatus, 30000);
    return () => clearInterval(int);
  }, []);

  return (
    <div className="flex sm:hidden w-full mb-4 bg-red-900/5 border border-red-900/10 py-2 px-3 shadow-sm rounded">
      <div className="flex w-full items-center justify-between text-[9px] tracking-widest font-mono text-ink/80 font-bold uppercase shrink-0">
         <div className="flex items-center gap-1.5 text-red-600/90 shrink-0">
           <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
           LIVE
         </div>
         {visits > 0 ? (
           <div className="flex items-center gap-3 shrink-0">
             <span>TRAFFIC: {visits}</span>
             <span className="opacity-50">|</span>
             <span>UNIQUE: {uniqueVisits}</span>
           </div>
         ) : (
           <span>STANDBY</span>
         )}
      </div>
    </div>
  );
}
