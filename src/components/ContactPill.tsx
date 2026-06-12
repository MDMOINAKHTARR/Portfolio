import React, { useState } from 'react';
import { ChevronRight, Check, AlertCircle, Loader2 } from 'lucide-react';

export function ContactPill() {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;

    setStatus('sending');
    setErrorMsg('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, message }),
      });

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned an unexpected non-JSON response.');
      }

      const data = await res.json();
      if (res.ok && data.success) {
        setStatus('success');
        setMessage('');
        // Keep name for convenience but reset status after some time
        setTimeout(() => setStatus('idle'), 3000);
      } else {
        throw new Error(data.error || 'Failed to send message');
      }
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setErrorMsg(err.message || 'Error executing directive');
      setTimeout(() => setStatus('idle'), 4000);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto my-6 px-1 flex flex-col items-center">
      <form 
        onSubmit={handleSubmit}
        className={`w-full h-12 sm:h-14 rounded-full flex items-center pl-4 sm:pl-5 pr-1.5 sm:pr-2 py-1.5 bg-op-bg border transition-all duration-300 shadow-sm hover:shadow-md select-none relative ${
          status === 'success' 
            ? 'border-emerald-500 ring-2 ring-emerald-500/20' 
            : status === 'error'
            ? 'border-red-500 ring-2 ring-red-500/20'
            : 'border-ink/20 hover:border-ink/40 focus-within:border-ink/50 focus-within:ring-2 focus-within:ring-ink/10'
        }`}
      >
        {/* Name input */}
        <input 
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="ur name dude"
          disabled={status === 'sending'}
          required
          className="bg-transparent border-none text-xs sm:text-sm text-ink placeholder:text-ink/40 focus:outline-none w-[28%] shrink-0 h-full font-mono text-center sm:text-left"
        />

        {/* Separator */}
        <div className="w-[1.5px] h-4 sm:h-5 bg-ink/20 mx-2 shrink-0 self-center" />

        {/* Message Input */}
        <input 
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Send message to Moin"
          disabled={status === 'sending'}
          required
          className="bg-transparent border-none text-xs sm:text-sm text-ink placeholder:text-ink/40 focus:outline-none flex-1 w-0 min-w-0 h-full font-mono px-1 sm:px-2"
        />

        {/* Dynamic Status / Button Action */}
        <button
          type="submit"
          disabled={status === 'sending' || !name.trim() || !message.trim()}
          className={`h-9 w-9 sm:h-11 sm:w-11 rounded-full flex items-center justify-center transition-all shrink-0 ml-1 ${
            status === 'success'
              ? 'bg-emerald-600 text-white'
              : status === 'error'
              ? 'bg-red-650 text-white animate-shake'
              : status === 'sending'
              ? 'bg-ink/10 text-ink/40 cursor-not-allowed'
              : 'bg-ink/15 hover:bg-ink text-ink hover:text-doc hover:scale-105 active:scale-95 disabled:opacity-35 disabled:hover:bg-ink/15 disabled:hover:text-ink disabled:scale-100 disabled:cursor-not-allowed shadow-sm'
          }`}
        >
          {status === 'sending' ? (
            <Loader2 className="w-4 h-4 sm:w-4.5 sm:h-4.5 animate-spin" />
          ) : status === 'success' ? (
            <Check className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          ) : status === 'error' ? (
            <AlertCircle className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          ) : (
            <ChevronRight className="w-4.5 h-4.5 sm:w-5.5 sm:h-5.5" />
          )}
        </button>
      </form>

      {/* Dynamic Status Text / Info banner immediately below the block, styled cleanly */}
      <div className="h-4 mt-2">
        {status === 'success' && (
          <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold tracking-wider animate-pulse uppercase">
            DIRECTIVE TRANSMITTED SECURELY ✓
          </span>
        )}
        {status === 'error' && (
          <span className="text-[10px] font-mono text-red-500 font-bold tracking-wider uppercase">
            {errorMsg || 'TRANSMISSION FAILED.'}
          </span>
        )}
      </div>
    </div>
  );
}
