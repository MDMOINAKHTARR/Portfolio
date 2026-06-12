import React, { useState, useEffect } from 'react';
import { Activity, Users, Eye } from 'lucide-react';
import { Typewriter } from './Typewriter';

export function AnalyticsWidget() {
  const [visits, setVisits] = useState(0);
  const [uniqueVisits, setUniqueVisits] = useState(0);
  const [loading, setLoading] = useState(true);

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
          } else {
            console.warn('Received non-JSON response from /api/system-status');
          }
        }
      } catch (err) {
        // Silently ignore network errors to prevent console spam during dev server restarts
      } finally {
        setLoading(false);
      }
    };
    
    fetchSystemStatus();
    
    // Poll every 30 seconds
    const int = setInterval(fetchSystemStatus, 30000);
    return () => clearInterval(int);
  }, []);

  return (
    <div className="border-[2px] border-ink/20 p-4 bg-ink/5 mt-8 w-full max-w-sm ml-auto mr-auto sm:ml-0 shadow-inner">
      <div className="flex items-center gap-2 border-b-[2px] border-ink/10 pb-2 mb-3">
        <Activity className="w-4 h-4 text-ink opacity-80" />
        <Typewriter delay={0.1} className="font-mono text-xs font-bold tracking-widest uppercase opacity-70 text-ink">
          SERVER_TRAFFIC_LOGS
        </Typewriter>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 opacity-60 mb-1">
            <Eye className="w-3 h-3 text-ink" />
            <span className="text-[9px] font-mono font-bold tracking-wider uppercase text-ink">Total Hits</span>
          </div>
          {loading ? (
             <span className="text-xl font-black font-mono text-ink tracking-widest leading-none blur-[2px] opacity-50">0000</span>
          ) : (
            <Typewriter delay={0.3} className="text-xl font-black font-mono text-ink tracking-widest leading-none">
              {visits.toString().padStart(4, '0')}
            </Typewriter>
          )}
        </div>
        
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 opacity-60 mb-1">
            <Users className="w-3 h-3 text-ink" />
            <span className="text-[9px] font-mono font-bold tracking-wider uppercase text-ink">Unique Intel</span>
          </div>
          {loading ? (
             <span className="text-xl font-black font-mono text-ink tracking-widest leading-none blur-[2px] opacity-50">0000</span>
          ) : (
            <Typewriter delay={0.5} className="text-xl font-black font-mono text-ink tracking-widest leading-none">
              {uniqueVisits.toString().padStart(4, '0')}
            </Typewriter>
          )}
        </div>
      </div>
    </div>
  );
}
