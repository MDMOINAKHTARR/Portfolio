import React from 'react';
import { motion } from 'motion/react';
import { Github, Linkedin, Code2, FileText, ArrowUpRight } from 'lucide-react';
import { FaXTwitter } from 'react-icons/fa6';
import { Notebook } from './ui/notebook';
import { Button } from './ui/button';
import { EnvelopeSend } from './EnvelopeSend';
import { CopyEmail } from './CopyEmail';
import { audioEngine } from '../lib/audio';

const PLATFORM_BUTTONS = [
  {
    id: '01',
    icon: Github,
    label: 'GITHUB',
    url: 'https://github.com/MDMOINAKHTARR',
    variant: 'outline' as const,
    seed: 'github-btn',
  },
  {
    id: '02',
    icon: Linkedin,
    label: 'LINKEDIN',
    url: 'https://www.linkedin.com/in/mdmoinakhtar/',
    variant: 'secondary' as const,
    seed: 'linkedin-btn',
  },
  {
    id: '03',
    icon: Code2,
    label: 'LEETCODE',
    url: 'https://leetcode.com/u/__moinn_/',
    variant: 'default' as const,
    seed: 'leetcode-btn',
  },
  {
    id: '04',
    icon: FaXTwitter,
    label: 'X-COMMS',
    url: 'https://x.com/Moincrafted',
    variant: 'ghost' as const,
    seed: 'x-btn',
  },
  {
    id: '05',
    icon: FileText,
    label: 'RESUME.PDF',
    url: '/MdMoinAkhtar_Resume.pdf',
    variant: 'destructive' as const,
    seed: 'dossier-pdf-btn',
  },
];

export function HomeContactSection() {
  const [sendStatus, setSendStatus] = React.useState<'idle' | 'sent' | 'error'>('idle');

  const handleSend = async (message: string, name?: string) => {
    setSendStatus('idle');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name?.trim() || 'Anonymous Dispatch',
          message: message.trim(),
        }),
      });
      if (!res.ok) {
        setSendStatus('error');
        return;
      }
      setSendStatus('sent');
    } catch (err) {
      console.error('Failed to transmit note:', err);
      setSendStatus('error');
    }
  };

  return (
    <section className="block w-full relative z-20 py-10 sm:py-14 px-3 sm:px-6 md:px-8">
      <div className="w-[100%] sm:w-[94%] lg:w-[86%] max-w-[1100px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          className="w-full flex justify-center"
        >
          {/* Snug Notebook with index-card pages */}
          <Notebook
            binding="spiral"
            side="start"
            pages={2}
            tone="steel"
            stock="index-card"
            rules="index"
            seed="contact-notebook-compact"
            className="w-full shadow-2xl border border-[#d2c9b4] pt-6 pb-6 px-4 sm:ps-14 sm:pe-6 flex flex-col text-[#1e1e1e] font-typewriter"
            style={{
              backgroundColor: '#fbf6e9',
              ['--ll-stock' as string]: '#fbf6e9',
              ['--ll-paper' as string]: '#fbf6e9',
              ['--ll-card' as string]: '#fbf6e9',
              ['--ll-paper-shade' as string]: '#ece6da',
              ['--ll-ink' as string]: '#1e1e1e',
            }}
          >
            {/* Grid tightly bounding left info & right form */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-6 items-center w-full">
              
              {/* ── LEFT INNER SPREAD ── */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                {/* Header */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full bg-[#d32f2f] animate-pulse" />
                    <p className="text-[10.5px] sm:text-[11px] font-bold tracking-[0.25em] uppercase text-[#d32f2f] font-typewriter">
                      — OPEN FOR OPPORTUNITIES
                    </p>
                  </div>
                  <h2 className="text-3xl sm:text-4xl lg:text-[2.85rem] font-black tracking-tight leading-[1.02] text-[#111111] uppercase font-typewriter">
                    LET'S BUILD<br />SOMETHING<br />
                    <span className="text-[#d32f2f]">TOGETHER.</span>
                  </h2>
                  <div className="border-t-[3px] border-[#d32f2f]/80 w-14 mt-2" />
                </div>

                {/* Direct Email Wire / Dispatch */}
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#1e1e1e]/65 font-typewriter">
                    DIRECT WIRE / DISPATCH —
                  </span>
                  <div className="flex items-center">
                    <CopyEmail
                      email="mohdmoinakhtar081@gmail.com"
                      className="w-full sm:w-auto bg-[#ffffff]/90 border border-[#1e1e1e]/30 rounded-md px-2.5 py-1 shadow-xs hover:border-[#d32f2f]/80 transition-colors font-mono text-xs font-bold text-[#111111]"
                    />
                  </div>
                </div>

                {/* Tactical Buttons for Different Platforms */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#d32f2f]" />
                    <span className="text-[10px] font-bold tracking-[0.22em] uppercase text-[#1e1e1e]/75 font-typewriter">
                      FIND ME AT —
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {PLATFORM_BUTTONS.map(({ id, icon: Icon, label, url, variant, seed }) => (
                      <Button
                        key={label}
                        variant={variant}
                        size="xs"
                        seed={seed}
                        asChild
                        className="font-mono text-[11px] font-bold tracking-wider shadow-2xs transition-all hover:scale-[1.03] h-7 px-2.5"
                        onClick={() => {
                          try { audioEngine.playClick(); } catch {}
                        }}
                      >
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5"
                        >
                          <span className="text-[9px] font-black opacity-75 font-mono">
                            {id}
                          </span>
                          <span className="w-px h-2.5 bg-current opacity-30" />
                          <Icon className="w-3 h-3 shrink-0" />
                          <span className="uppercase text-[10.5px]">{label}</span>
                          <ArrowUpRight className="w-2.5 h-2.5 opacity-60 ml-0.5 shrink-0" />
                        </a>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── RIGHT INNER SPREAD: Interactive Note & Inkwell Form ── */}
              <div className="lg:col-span-7 flex flex-col items-center justify-center lg:justify-end w-full gap-2">
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
                {sendStatus === 'error' && (
                  <div
                    role="alert"
                    className="w-full rounded-sm border border-[#d32f2f]/60 bg-[#d32f2f]/10 px-3 py-2 font-mono text-xs font-bold text-[#9a1c1c] flex flex-wrap items-center justify-between gap-2"
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
          </Notebook>
        </motion.div>
      </div>
    </section>
  );
}
