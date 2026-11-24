import React, { useState, useEffect, useRef } from 'react';
import { PageTransition } from '../components/PageTransition';
import { Button } from '../components/ui/button';
import { EnvelopeSend } from '../components/EnvelopeSend';
import { CopyEmail } from '../components/CopyEmail';
import { Typewriter } from '../components/Typewriter';
import { ScrambleText } from '../components/ScrambleText';
import {
  Github,
  Linkedin,
  Code2,
  FileText,
  ArrowUpRight,
  Radio,
  Terminal,
  AlertTriangle,
  Send,
  Mail,
} from 'lucide-react';
import { FaXTwitter } from 'react-icons/fa6';
import { motion } from 'motion/react';
import { audioEngine } from '../lib/audio';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*<>';

const PLATFORM_BUTTONS = [
  {
    id: '01',
    icon: Github,
    label: 'GITHUB',
    url: 'https://github.com/MDMOINAKHTARR',
    variant: 'outline' as const,
    seed: 'comms-github-btn',
  },
  {
    id: '02',
    icon: Linkedin,
    label: 'LINKEDIN',
    url: 'https://www.linkedin.com/in/mdmoinakhtar/',
    variant: 'secondary' as const,
    seed: 'comms-linkedin-btn',
  },
  {
    id: '03',
    icon: Code2,
    label: 'LEETCODE',
    url: 'https://leetcode.com/u/__moinn_/',
    variant: 'default' as const,
    seed: 'comms-leetcode-btn',
  },
  {
    id: '04',
    icon: FaXTwitter,
    label: 'X-COMMS',
    url: 'https://x.com/Moincrafted',
    variant: 'ghost' as const,
    seed: 'comms-x-btn',
  },
  {
    id: '05',
    icon: FileText,
    label: 'RESUME.PDF',
    url: '/MdMoinAkhtar_Resume.pdf',
    variant: 'destructive' as const,
    seed: 'comms-dossier-pdf-btn',
  },
];

export function Comms() {
  const [desktopSendError, setDesktopSendError] = useState(false);

  // Desktop envelope send handler
  const handleSend = async (message: string, name?: string) => {
    setDesktopSendError(false);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name?.trim() || 'Anonymous Dispatch',
          message: message.trim(),
        }),
      });
      if (!res.ok) setDesktopSendError(true);
    } catch (err) {
      console.error('Failed to transmit note:', err);
      setDesktopSendError(true);
    }
  };

  // Mobile original form state & handlers
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [transmitted, setTransmitted] = useState(false);
  const [payload, setPayload] = useState('');
  const [senderName, setSenderName] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const originalPayloadRef = useRef('');

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isTransmitting) {
      interval = setInterval(() => {
        setPayload((prev) =>
          prev
            .split('')
            .map((char) =>
              char === ' ' || char === '\n'
                ? char
                : CHARS[Math.floor(Math.random() * CHARS.length)]
            )
            .join('')
        );
      }, 50);
    } else if (!isTransmitting && !transmitted) {
      setPayload(originalPayloadRef.current);
    }
    return () => clearInterval(interval);
  }, [isTransmitting, transmitted]);

  const handleTransmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    originalPayloadRef.current = payload;
    setIsTransmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: senderName, message: payload }),
      });

      let data: any = {};
      try {
        data = await response.json();
      } catch {}

      if (!response.ok) {
        throw new Error(data?.error || `Server error (${response.status})`);
      }

      setIsTransmitting(false);
      setTransmitted(true);
      setPayload('');
      setSenderName('');
    } catch (err: any) {
      console.error(err);
      setIsTransmitting(false);
      setFormError(
        err?.message || 'Transmission failed. Please check network connection.'
      );
    }
  };

  return (
    <PageTransition className="flex-1 flex flex-col w-full max-w-7xl mx-auto px-4 sm:px-8 md:px-12 py-6 sm:py-14">
      {/* ═════════════════════════════════════════════════════════════════════
          DESKTOP VIEW (sm:block) - New Index-Card Style + Sticky Note
          ═════════════════════════════════════════════════════════════════════ */}
      <div className="hidden sm:block w-full">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
          className="w-full"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full">
            {/* Left Column: Heading, Direct Wire, Platforms */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-2 h-2 rounded-full bg-stamp animate-pulse" />
                  <p className="text-[11px] sm:text-xs font-bold tracking-[0.25em] uppercase text-stamp font-typewriter">
                    — OPEN FOR OPPORTUNITIES
                  </p>
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-[3.25rem] font-black tracking-tight leading-[1.02] text-ink uppercase font-typewriter">
                  LET'S BUILD
                  <br />
                  SOMETHING
                  <br />
                  <span className="text-stamp">TOGETHER.</span>
                </h1>
                <div className="border-t-[3px] border-stamp/80 w-16 mt-3" />
              </div>

              {/* Direct Email Wire */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10.5px] font-bold tracking-[0.2em] uppercase text-ink/65 font-typewriter">
                  DIRECT WIRE / DISPATCH —
                </span>
                <div className="flex items-center">
                  <CopyEmail
                    email="mohdmoinakhtar081@gmail.com"
                    className="w-full sm:w-auto bg-paper/90 border border-ink/30 rounded-md px-3 py-1.5 shadow-xs hover:border-stamp/80 transition-colors font-mono text-xs sm:text-sm font-bold text-ink"
                  />
                </div>
              </div>

              {/* Platform Buttons */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-stamp" />
                  <span className="text-[10.5px] sm:text-xs font-bold tracking-[0.22em] uppercase text-ink/75 font-typewriter">
                    FIND ME AT —
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 pt-0.5">
                  {PLATFORM_BUTTONS.map(
                    ({ id, icon: Icon, label, url, variant, seed }) => (
                      <Button
                        key={label}
                        variant={variant}
                        size="sm"
                        seed={seed}
                        asChild
                        className="font-mono text-xs font-bold tracking-wider shadow-2xs transition-all hover:scale-[1.03] h-8 px-3"
                        onClick={() => {
                          try {
                            audioEngine.playClick();
                          } catch {}
                        }}
                      >
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2"
                        >
                          <span className="text-[10px] font-black opacity-75 font-mono">
                            {id}
                          </span>
                          <span className="w-px h-2.5 bg-current opacity-30" />
                          <Icon className="w-3.5 h-3.5 shrink-0" />
                          <span className="uppercase text-[11px]">{label}</span>
                          <ArrowUpRight className="w-3 h-3 opacity-60 ml-0.5 shrink-0" />
                        </a>
                      </Button>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Sticky Note with Washi Tape */}
            <div className="lg:col-span-7 flex items-center justify-center lg:justify-end w-full">
              <EnvelopeSend
                variant="sticky"
                onSend={handleSend}
                title="Send me a note"
                description="Write anything — questions, collabs, or just a hello."
                placeholder="What's on your mind?"
                namePlaceholder="Your name or handle..."
                limit={280}
                className="w-full"
              />
              {desktopSendError && (
                <div
                  role="alert"
                  className="mt-2 w-full rounded-sm border border-[#d32f2f]/60 bg-[#d32f2f]/10 px-3 py-2 font-mono text-xs font-bold text-[#9a1c1c] flex flex-wrap items-center justify-between gap-2"
                >
                  <span>Transmission could not reach server.</span>
                  <a
                    href="mailto:mohdmoinakhtar081@gmail.com"
                    className="underline hover:text-[#111111]"
                  >
                    Email mohdmoinakhtar081@gmail.com directly →
                  </a>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* ═════════════════════════════════════════════════════════════════════
          MOBILE VIEW (sm:hidden) - Original Classic Dossier / Telex Form
          (None of the new index card additions on mobile)
          ═════════════════════════════════════════════════════════════════════ */}
      <div className="block sm:hidden w-full">
        {/* Header section */}
        <div className="mb-4 w-full flex flex-col gap-2">
          <div className="flex items-center justify-between border-b-[3px] border-ink/20 pb-2">
            <div>
              <h2 className="text-2xl font-black tracking-tighter uppercase leading-none text-ink">
                <ScrambleText text="CONTACT ME" />
              </h2>
              <Typewriter
                delay={0.3}
                className="text-[10px] tracking-widest font-bold opacity-60 uppercase mt-1"
              >
                SEND ME A DIRECT MESSAGE
              </Typewriter>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold tracking-widest opacity-60 uppercase">
                STATUS:
              </span>
              <span className="text-xs font-black tracking-widest text-stamp flex items-center gap-1 mt-0.5">
                ONLINE
              </span>
            </div>
          </div>
        </div>

        {/* The Original Direct Dispatch Terminal Form */}
        <div className="w-full flex flex-col">
          <div className="relative border-[3px] border-ink p-4 bg-paper/60 backdrop-blur-xs flex-1 flex flex-col justify-between shadow-[6px_6px_0_rgba(0,0,0,0.15)]">
            <div className="absolute top-0 right-0 border-l-[3px] border-b-[3px] border-ink bg-ink text-paper text-[9px] font-bold px-2 py-0.5 tracking-widest uppercase">
              TRANSMISSION_ID: 984-COM
            </div>

            <div className="flex items-center gap-2 mb-3 text-xs font-bold border-b border-ink/10 pb-2">
              <Terminal className="w-4 h-4 text-stamp" />
              <span className="opacity-80 uppercase">DIRECT DISPATCH TERMINAL</span>
            </div>

            <div className="flex-1 flex flex-col justify-center">
              {!transmitted ? (
                <form onSubmit={handleTransmit} className="flex flex-col gap-3">
                  <div className="flex flex-col gap-2.5">
                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-xs uppercase text-ink/70">
                        NAME:
                      </label>
                      <input
                        type="text"
                        required
                        disabled={isTransmitting}
                        value={senderName}
                        onChange={(e) => setSenderName(e.target.value)}
                        className="bg-ink/5 border border-ink/20 focus:border-ink outline-none w-full py-2 px-3 text-sm font-bold transition-colors disabled:opacity-50 placeholder-ink/30 text-ink shadow-inner"
                        placeholder="ENTER NAME"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5 w-full">
                      <label className="font-bold text-xs uppercase text-ink/70">
                        MESSAGE:
                      </label>
                      <div className="relative h-[120px]">
                        {/* Dossier lined paper effect for textarea */}
                        <div className="absolute inset-0 bg-[linear-gradient(transparent_27px,rgba(0,0,0,0.1)_28px)] bg-[size:100%_28px] pointer-events-none" />
                        <textarea
                          required
                          disabled={isTransmitting}
                          value={payload}
                          onChange={(e) => setPayload(e.target.value)}
                          className="bg-ink/5 border border-ink/20 focus:border-ink outline-none w-full h-[120px] text-base font-bold transition-colors disabled:opacity-50 resize-none absolute inset-0 p-3 pt-1 placeholder-ink/30 text-ink shadow-inner leading-[28px]"
                          placeholder="ENTER MESSAGE..."
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 mt-1">
                    {formError && (
                      <div className="w-full flex items-start gap-2 bg-red-900/10 border border-red-700/40 text-red-700 text-xs font-bold font-mono tracking-wider px-3 py-2 rounded-sm">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span className="uppercase">{formError}</span>
                      </div>
                    )}
                    <button
                      type="submit"
                      disabled={isTransmitting}
                      className={`px-6 py-2.5 border-[3px] border-ink font-bold tracking-widest text-xs transition-all w-full relative group overflow-hidden cursor-pointer ${
                        isTransmitting
                          ? 'bg-ink text-paper animate-pulse'
                          : 'bg-transparent text-ink hover:bg-ink hover:text-paper shadow-[3px_3px_0_rgba(0,0,0,0.5)] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none bg-paper'
                      }`}
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2 uppercase">
                        {isTransmitting ? 'SENDING...' : 'SEND MESSAGE'}
                        {!isTransmitting && <Send className="w-3.5 h-3.5" />}
                      </span>
                    </button>
                  </div>
                </form>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center text-center p-6 border-[3px] border-ink bg-ink/5 w-full min-h-[240px]"
                >
                  <Mail className="w-12 h-12 text-ink mb-4 mx-auto opacity-80" />
                  <Typewriter
                    delay={0}
                    speed={0.02}
                    as="h3"
                    className="text-lg font-black mb-2 tracking-widest uppercase"
                  >
                    MESSAGE SENT
                  </Typewriter>
                  <Typewriter
                    delay={0.4}
                    speed={0.01}
                    as="p"
                    className="text-xs mb-6 max-w-xs mx-auto leading-relaxed font-bold opacity-70"
                  >
                    Your message has been successfully delivered to my Telegram.
                    I'll get back to you as soon as possible.
                  </Typewriter>
                  <button
                    onClick={() => {
                      setTransmitted(false);
                      originalPayloadRef.current = '';
                    }}
                    className="text-xs border-b-[2px] border-ink hover:bg-ink hover:text-paper transition-all px-4 py-2 uppercase tracking-widest font-black"
                  >
                    SEND ANOTHER MESSAGE
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

export default Comms;
