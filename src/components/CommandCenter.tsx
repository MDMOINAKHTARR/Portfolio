import { Fragment, useEffect, useRef, useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Bookmark, Check, CheckSquare, Command, Copy, Download, Keyboard, Square, X, BookOpen, Compass, Paperclip, Play, Pause, Radio, FolderGit2, UserCheck, Sparkles, ArrowDown, ArrowRight, Volume2, Terminal, Send, ExternalLink, Database, RotateCcw, Bot, User, ChevronDown, ChevronUp, Cpu } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MUSIC_TRACKS, musicEngine, type PlaybackSnapshot } from '../lib/music';
import { useTheme } from '../context/ThemeContext';
import { audioEngine } from '../lib/audio';
import { Bubble, BubbleContent, BubbleGroup } from './ui/bubble';
import { Message, MessageAvatar, MessageContent, MessageFooter, MessageGroup, MessageHeader } from './ui/message';
import { TypingIndicator } from './ui/typing-indicator';
import {
  SUGGESTED_RAG_PROMPTS,
  queryDossierRag,
  type RagAction,
} from '../lib/dossierRag';
import {
  MAX_QUERY_LENGTH,
  MERC_TYPING_INDICATORS,
  askGeminiDossierAi,
  getInitialWelcomeTurn,
  type GeminiDossierResponse,
  type VisitorLens,
} from '../lib/geminiDossierAi';

interface ChatTurn {
  id: string;
  query?: string;
  response: GeminiDossierResponse;
  isGenerating?: boolean;
  isStreaming?: boolean;
  isLiveStream?: boolean;
  typingPhrase?: string;
}

type WadeMood = 'idle' | 'thinking' | 'sassy' | 'alert';

function WadeMascot({
  size = 40,
  thinking = false,
  mood = 'idle',
}: {
  size?: number;
  thinking?: boolean;
  mood?: WadeMood;
}) {
  const activeMood: WadeMood = thinking ? 'thinking' : mood;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 56 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 overflow-visible ll-drop-sticker select-none transition-transform ${activeMood === 'thinking' ? 'animate-pulse' : ''
        }`}
      aria-hidden="true"
    >
      {/* Twin Katana Hilts Angled Behind Shoulders */}
      <g stroke="var(--c-ink)" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 33 L5 20" strokeWidth="3.2" />
        <path d="M4 23 L9 19" strokeWidth="2.2" />
        <path d="M43 33 L51 20" strokeWidth="3.2" />
        <path d="M52 23 L47 19" strokeWidth="2.2" />
      </g>

      {/* Alert Comic Exclamation Pop (only on guardrail / alert mode) */}
      {activeMood === 'alert' && (
        <g>
          <path
            d="M46 4 L52 2 L49 12 Z"
            fill="var(--c-stamp)"
            stroke="var(--c-ink)"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          <circle cx="47.5" cy="15.5" r="1.6" fill="var(--c-stamp)" stroke="var(--c-ink)" strokeWidth="1.2" />
        </g>
      )}

      {/* Thinking Thought Dots (only while thinking) */}
      {activeMood === 'thinking' && (
        <g fill="var(--c-doc)" stroke="var(--c-ink)" strokeWidth="1.3">
          <circle cx="46" cy="14" r="1.8" />
          <circle cx="50" cy="9" r="2.5" />
        </g>
      )}

      {/* Tactical Suit Shoulders & Cross-Chest Harness */}
      <path
        d="M11 51 C11 41.5 17 37.5 28 37.5 C39 37.5 45 41.5 45 51 Z"
        fill="var(--c-ink)"
        stroke="var(--c-ink)"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      {/* Red Suit Chest Panel & Diagonal Harness Straps */}
      <path d="M19 39 L28 45 L37 39 L35 50 H21 Z" fill="var(--c-stamp)" />
      <path
        d="M16 40 L25 50 M40 40 L31 50"
        stroke="var(--c-ink)"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      {/* Signature Round Belt / Collar Medallion */}
      <circle cx="28" cy="46.5" r="3" fill="var(--c-stamp)" stroke="var(--c-ink)" strokeWidth="1.5" />
      <path d="M28 44 V49" stroke="var(--c-ink)" strokeWidth="1.2" />

      {/* Deadpool Mask Head */}
      <path
        d="M28 6.5 C38 6.5 44.5 13 44.5 23.5 C44.5 33.5 37.5 40 28 40 C18.5 40 11.5 33.5 11.5 23.5 C11.5 13 18 6.5 28 6.5 Z"
        fill="var(--c-stamp)"
        stroke="var(--c-ink)"
        strokeWidth="2.3"
        strokeLinejoin="round"
      />

      {/* Comic Cel-Shading Highlight on Upper Left Cowl */}
      <path
        d="M17 13.5 Q22 9.5 29 9.5"
        stroke="white"
        strokeOpacity="0.28"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Center Mask Seam */}
      <path
        d="M28 8 V38.5"
        stroke="var(--c-ink)"
        strokeWidth="1.2"
        strokeOpacity="0.32"
        strokeLinecap="round"
      />

      {/* Classic Swept-Up Left Black Eye Patch */}
      <path
        d="M14 19.5 C14.5 15 19.5 15.2 24.5 20.5 C25 24 22.5 29.5 18.2 29.5 C15 29.5 13.8 24.5 14 19.5 Z"
        fill="var(--c-ink)"
      />
      {/* Classic Swept-Up Right Black Eye Patch */}
      <path
        d="M42 19.5 C41.5 15 36.5 15.2 31.5 20.5 C31 24 33.5 29.5 37.8 29.5 C41 29.5 42.2 24.5 42 19.5 Z"
        fill="var(--c-ink)"
      />

      {/* Expressive Asymmetric White Mask Eyes */}
      {activeMood === 'alert' ? (
        <>
          <circle cx="19.2" cy="22" r="3.6" fill="var(--c-doc)" />
          <circle cx="19.2" cy="22" r="1.1" fill="var(--c-ink)" />
          <circle cx="36.8" cy="22" r="3.6" fill="var(--c-doc)" />
          <circle cx="36.8" cy="22" r="1.1" fill="var(--c-ink)" />
        </>
      ) : activeMood === 'sassy' ? (
        <>
          {/* Wide left eye + bold comic wink on right */}
          <path d="M16.2 21.5 Q19.5 17.8 22.8 22 Q19.5 25.2 16.2 21.5 Z" fill="var(--c-doc)" />
          <path
            d="M33.2 22.6 Q36.2 19.6 39.4 22.2"
            stroke="var(--c-doc)"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        </>
      ) : activeMood === 'thinking' ? (
        <>
          {/* Looking up-right while thinking */}
          <path d="M16.8 20.5 Q19.5 18 22.4 20.5 Q19.5 22.6 16.8 20.5 Z" fill="var(--c-doc)" />
          <path d="M33.6 21.6 L39.2 19.6" stroke="var(--c-doc)" strokeWidth="2.2" strokeLinecap="round" />
        </>
      ) : (
        <>
          <path d="M16.8 21.5 Q19.5 19.2 22.4 22 Q19.5 24.6 16.8 21.5 Z" fill="var(--c-doc)" />
          <path d="M33.6 22 Q36.2 20.4 39 21.2 Q36.4 23.4 33.6 22 Z" fill="var(--c-doc)" />
        </>
      )}
    </svg>
  );
}

function renderFormattedText(text: string, isDarkFill = false) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\[\d+\])/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className={isDarkFill ? 'font-bold text-white' : 'font-bold text-ink'}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <code
          key={i}
          className={`px-1.5 py-0.2 mx-0.5 rounded font-mono text-[11px] font-bold ${isDarkFill
            ? 'bg-white/20 text-white'
            : 'bg-ink/8 text-ink'
            }`}
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    if (/^\[\d+\]$/.test(part)) {
      return null;
    }
    return <span key={i}>{part}</span>;
  });
}

function StreamingRagMessage({
  turn,
  onAction,
  onFollowUp,
  isLatestCompleted = false,
  onStreamTick,
}: {
  turn: ChatTurn;
  onAction: (action: RagAction) => void;
  onFollowUp?: (question: string) => void;
  isLatestCompleted?: boolean;
  onStreamTick?: () => void;
}) {
  const rawParagraphs = [
    ...turn.response.answer.split('\n').filter((l) => l.trim().length > 0),
    ...turn.response.bullets.map((b) => `• ${b}`),
  ];
  const fullText = rawParagraphs.join('\n');

  const [charCount, setCharCount] = useState(turn.isStreaming ? 0 : fullText.length);
  const [typingIndex, setTypingIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [copiedActionLabel, setCopiedActionLabel] = useState<string | null>(null);

  useEffect(() => {
    if (!turn.isGenerating) return;
    const interval = window.setInterval(() => {
      setTypingIndex((idx) => (idx + 1) % MERC_TYPING_INDICATORS.length);
    }, 1800);
    return () => window.clearInterval(interval);
  }, [turn.isGenerating]);

  useEffect(() => {
    if (turn.isGenerating) {
      setCharCount(0);
      return;
    }
    if (!turn.isStreaming || turn.isLiveStream) {
      setCharCount(fullText.length);
      return;
    }
    setCharCount(0);
  }, [turn.id, turn.isGenerating, turn.isStreaming, turn.isLiveStream, fullText]);

  useEffect(() => {
    if (turn.isGenerating || !turn.isStreaming || turn.isLiveStream) return;
    if (charCount >= fullText.length) return;

    const timer = window.setTimeout(() => {
      setCharCount((c) => Math.min(fullText.length, c + 18));
      onStreamTick?.();
    }, 14);

    return () => window.clearTimeout(timer);
  }, [turn.isGenerating, turn.isStreaming, turn.isLiveStream, charCount, fullText.length, onStreamTick]);

  const isDone = !turn.isGenerating && (!turn.isStreaming || (!turn.isLiveStream && charCount >= fullText.length));
  const visibleText = isDone ? fullText : fullText.slice(0, charCount);
  const lines = visibleText.split('\n').filter((l) => l.trim().length > 0);
  const activeMode = turn.response.conversationMode || 'casual';
  const activeTypingText =
    turn.typingPhrase && typingIndex === 0
      ? turn.typingPhrase
      : MERC_TYPING_INDICATORS[typingIndex % MERC_TYPING_INDICATORS.length];
  const isGuardrail =
    turn.response.modelUsed === 'guardrail-filter' || turn.response.modelUsed === 'rate-limiter';

  const bubbleVariant = turn.isGenerating
    ? 'outline'
    : isGuardrail
      ? 'destructive'
      : activeMode === 'recruiter'
        ? 'secondary'
        : 'muted';
  const isDarkBubble = bubbleVariant === 'destructive';

  const mascotMood: WadeMood = turn.isGenerating
    ? 'thinking'
    : isGuardrail
      ? 'alert'
      : activeMode === 'casual'
        ? 'sassy'
        : 'idle';

  return (
    <>
      <Message align="start">
        <MessageAvatar className="self-end group-has-data-[slot=message-footer]/message:-translate-y-5!">
          <WadeMascot size={40} mood={mascotMood} />
        </MessageAvatar>

        <MessageContent className="gap-1.5">
          <MessageHeader className="text-xs font-typewriter text-ink/70 px-1">
            Wade
          </MessageHeader>

          <BubbleGroup>
            {turn.isGenerating ? (
              <Bubble
                align="start"
                variant="outline"
                shape="cloud"
                pen="ink"
                tail
                className="max-w-[88%]"
              >
                <BubbleContent
                  seed={`wade-typing-${turn.id}`}
                  className="font-typewriter text-[12px] text-ink/80 px-4 py-2.5 flex items-center gap-2"
                >
                  <TypingIndicator variant="dots" pen="ink" pencil={false} seed={`typing-${turn.id}`} />
                  <span className="italic">{activeTypingText}</span>
                </BubbleContent>
              </Bubble>
            ) : (
              lines.map((line, idx) => {
                const trimmed = line.trim();
                const cleanLine = trimmed.replace(/^[•*-]\s+/, '');
                const isBullet = /^[•*-]\s+/.test(trimmed);
                const isLast = idx === lines.length - 1;

                return (
                  <Bubble
                    key={idx}
                    align="start"
                    variant={bubbleVariant}
                    shape="cloud"
                    pen="ink"
                    tail
                    className="max-w-[90%]"
                  >
                    <BubbleContent
                      seed={`wade-bubble-${turn.id}-${idx}-${bubbleVariant}`}
                      className={`font-typewriter text-[12.5px] leading-relaxed px-4 py-2.5 ${isDarkBubble ? 'text-white' : 'text-ink'
                        }`}
                    >
                      {isBullet ? (
                        <span className="flex items-start gap-2">
                          <span className={isDarkBubble ? 'text-white/80 font-bold' : 'text-stamp font-bold'}>
                            •
                          </span>
                          <span className="flex-1">
                            {renderFormattedText(cleanLine, isDarkBubble)}
                            {!isDone && isLast && (
                              <span className="inline-block w-1.5 h-3.5 bg-stamp ml-1 align-middle animate-pulse" />
                            )}
                          </span>
                        </span>
                      ) : (
                        <span>
                          {renderFormattedText(cleanLine, isDarkBubble)}
                          {!isDone && isLast && (
                            <span className="inline-block w-1.5 h-3.5 bg-stamp ml-1 align-middle animate-pulse" />
                          )}
                        </span>
                      )}
                    </BubbleContent>
                  </Bubble>
                );
              })
            )}
          </BubbleGroup>

          {isDone && (
            <MessageFooter className="text-[10.5px] font-typewriter text-ink/55 px-1 gap-2.5 whitespace-nowrap">
              <span>{turn.query ? `${turn.response.latencyMs}ms` : 'just now'}</span>
              {turn.query &&
                turn.response.actions.slice(0, 2).map((act) => {
                  const isActCopied = copiedActionLabel === act.label;
                  return (
                    <button
                      key={act.label}
                      type="button"
                      onClick={() => {
                        if (act.copyText) {
                          void navigator.clipboard?.writeText(act.copyText);
                          setCopiedActionLabel(act.label);
                          window.setTimeout(() => setCopiedActionLabel(null), 1600);
                        }
                        onAction(act);
                      }}
                      className="inline-flex items-center gap-1 text-stamp hover:text-ink underline underline-offset-2 transition-colors cursor-pointer"
                    >
                      <span>{isActCopied ? 'Copied!' : act.label}</span>
                      {act.copyText ? (
                        isActCopied ? <Check className="w-2.5 h-2.5 text-emerald-600" /> : <Copy className="w-2.5 h-2.5" />
                      ) : (
                        <ExternalLink className="w-2.5 h-2.5" />
                      )}
                    </button>
                  );
                })}
              <button
                type="button"
                onClick={() => {
                  void navigator.clipboard?.writeText(fullText.replace(/\*\*/g, ''));
                  setCopied(true);
                  window.setTimeout(() => setCopied(false), 1500);
                }}
                className="inline-flex items-center gap-1 opacity-0 group-hover/message:opacity-100 focus-visible:opacity-100 text-ink/45 hover:text-ink transition-opacity cursor-pointer ml-auto"
                title="Copy reply"
                aria-label="Copy Wade's reply"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'copied' : 'copy'}</span>
              </button>
            </MessageFooter>
          )}
        </MessageContent>
      </Message>

      {isDone && isLatestCompleted && turn.query && turn.response.followUps.length > 0 && onFollowUp && (
        <div className="flex flex-wrap gap-1.5 pl-12 pt-0.5">
          {turn.response.followUps.slice(0, 2).map((followUp) => (
            <button
              key={followUp}
              type="button"
              onClick={() => onFollowUp(followUp)}
              className="px-2.5 py-1 rounded-xs border border-ink/25 bg-paper/75 hover:bg-paper hover:border-ink/55 font-typewriter text-[11px] text-ink/75 hover:text-ink transition-colors cursor-pointer text-left"
            >
              ↳ {followUp}
            </button>
          ))}
        </div>
      )}
    </>
  );
}

const INITIAL_PLAYBACK: PlaybackSnapshot = {
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  trackIndex: 0,
  volume: 0.5,
};

const WADE_STORAGE_KEY = 'wade-clipboard-history-v1';

const WADE_SLASH_COMMANDS = [
  { cmd: '/fit', label: 'Role-fit check (e.g. /fit AI Engineer FastAPI)', query: '/fit AI & Full-Stack Engineer' },
  { cmd: '/recruiter', label: 'Toggle Recruiter lens (hiring ROI & velocity)', query: '' },
  { cmd: '/dev', label: 'Toggle Engineer lens (stack & architecture)', query: '' },
  { cmd: '/projects', label: 'Top AI & full-stack builds', query: 'What are Moin’s best AI & full-stack projects?' },
  { cmd: '/ieee', label: 'Published IEEE paper', query: 'Tell me about his IEEE hallucination paper' },
  { cmd: '/wins', label: 'Hackathon wins & awards', query: 'What hackathons has Moin won?' },
  { cmd: '/stack', label: 'Core tech stack & skills', query: 'What is Moin’s core tech stack and AI engineering skill set?' },
  { cmd: '/hire', label: 'Resume, email & availability', query: 'How can I contact Moin or get his resume?' },
  { cmd: '/clear', label: 'Start a fresh clipboard sheet', query: '' },
] as const;

const SHORTCUTS = [
  ['Ctrl + K', 'Chat with WADE (Portfolio AI)'],
  ['Space', 'Play / pause transmission'],
  ['N / B', 'Next / previous track'],
  ['UP / DOWN', 'Volume adjust'],
  ['T', 'Color / Noir atmosphere'],
  ['?', 'Field control guide'],
  ['Ctrl + `', 'Pull / Close Journal'],
] as const;

export function CommandCenter() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [journalOpen, setJournalOpen] = useState(false);
  const [ragOpen, setRagOpen] = useState(false);
  const [ragInput, setRagInput] = useState('');
  const [promptHistoryIdx, setPromptHistoryIdx] = useState(-1);
  const [slashSelectedIdx, setSlashSelectedIdx] = useState(0);
  const [visitorLens, setVisitorLens] = useState<VisitorLens>('default');
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [headerMoodIdx, setHeaderMoodIdx] = useState(2); // starts on 'sassy'
  const HEADER_MOODS: readonly WadeMood[] = ['idle', 'thinking', 'sassy', 'alert'];
  const headerMood = HEADER_MOODS[headerMoodIdx % HEADER_MOODS.length];

  const routePlaceholder =
    location.pathname === '/operations'
      ? "Ask about Moin's 8 projects · type / for cmds"
      : location.pathname === '/evidence'
        ? 'Ask about IEEE paper & wins · type / for cmds'
        : location.pathname === '/capabilities'
          ? 'Ask about stack & skills · type / for cmds'
          : location.pathname === '/comms'
            ? 'Ask about hiring Moin · type / for cmds'
            : 'Ask Wade anything · type / for commands';
  const [ragHistory, setRagHistory] = useState<ChatTurn[]>(() => {
    try {
      const saved = typeof window !== 'undefined' ? window.localStorage.getItem(WADE_STORAGE_KEY) : null;
      if (saved) {
        const parsed = JSON.parse(saved) as ChatTurn[];
        const valid = Array.isArray(parsed)
          ? parsed.filter((t) => t && typeof t.id === 'string' && t.response?.answer)
          : [];
        if (valid.length > 0) {
          return valid.map((t) => ({ ...t, isGenerating: false, isStreaming: false }));
        }
      }
    } catch {
      // ignore storage errors
    }
    return [
      {
        id: 'initial-brief',
        response: getInitialWelcomeTurn(),
        isGenerating: false,
        isStreaming: false,
      },
    ];
  });
  const isWadeThinking = ragHistory.some((t) => t.isGenerating);
  const userPromptHistory = ragHistory
    .map((t) => t.query)
    .filter((q): q is string => Boolean(q));
  const isSlashInput = ragInput.startsWith('/') || ragInput.startsWith('\\');
  const normalizedSlashQuery = isSlashInput
    ? `/${ragInput.slice(1).trim().toLowerCase()}`
    : '';
  const slashMatches = isSlashInput
    ? WADE_SLASH_COMMANDS.filter((item) => item.cmd.startsWith(normalizedSlashQuery))
    : [];
  const activeSlashIdx =
    slashMatches.length > 0 ? Math.min(slashSelectedIdx, slashMatches.length - 1) : 0;

  useEffect(() => {
    try {
      const completed = ragHistory
        .filter((t) => !t.isGenerating && !t.isStreaming)
        .slice(-20);
      if (completed.length > 0) {
        window.localStorage.setItem(WADE_STORAGE_KEY, JSON.stringify(completed));
      }
    } catch {
      // ignore storage quota errors
    }
  }, [ragHistory]);

  const resetWadeSheet = () => {
    setPromptHistoryIdx(-1);
    const fresh: ChatTurn[] = [
      {
        id: `reset-${Date.now()}`,
        response: getInitialWelcomeTurn(),
        isGenerating: false,
        isStreaming: false,
      },
    ];
    setRagHistory(fresh);
    try {
      window.localStorage.removeItem(WADE_STORAGE_KEY);
    } catch {
      // ignore storage errors
    }
  };

  const exportWadeNotes = () => {
    const lines = [
      '# WADE // Moin Portfolio Clipboard Notes',
      `Exported: ${new Date().toLocaleString()}`,
      '',
      ...ragHistory
        .filter((t) => !t.isGenerating)
        .flatMap((t) => {
          const block: string[] = [];
          if (t.query) block.push(`**You:** ${t.query}`);
          const bullets = t.response.bullets.map((b) => `- ${b}`).join('\n');
          block.push(`**Wade:** ${t.response.answer.replace(/\s*\[\d+\]/g, '')}`);
          if (bullets) block.push(bullets);
          block.push('');
          return block;
        }),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wade-portfolio-notes.md';
    a.click();
    URL.revokeObjectURL(url);
  };
  const ragScrollRef = useRef<HTMLDivElement>(null);
  const ragInputRef = useRef<HTMLInputElement>(null);
  const [footerVisible, setFooterVisible] = useState(() =>
    typeof document !== 'undefined' && document.documentElement.classList.contains('footer-in-view')
  );
  const [playback, setPlayback] = useState<PlaybackSnapshot>(INITIAL_PLAYBACK);
  const playbackRef = useRef(INITIAL_PLAYBACK);
  const typedBuffer = useRef('');
  const konamiProgress = useRef(0);

  const askRagQuestion = async (question: string) => {
    const trimmed = question.trim();
    if (!trimmed) return;

    const turnId = `turn-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const preliminaryBase = queryDossierRag(trimmed);
    const preliminary: GeminiDossierResponse = {
      ...preliminaryBase,
      followUps: [],
      modelUsed: 'gemini-3.5-flash-lite',
    };
    const randomTypingPhrase =
      MERC_TYPING_INDICATORS[Math.floor(Math.random() * MERC_TYPING_INDICATORS.length)];

    const priorHistory = ragHistory.flatMap((t) =>
      t.query
        ? [
          { role: 'user' as const, text: t.query },
          { role: 'model' as const, text: t.response.answer },
        ]
        : [{ role: 'model' as const, text: t.response.answer }]
    );

    setRagHistory((prev) => [
      ...prev.map((t) => ({ ...t, isStreaming: false, isGenerating: false })),
      {
        id: turnId,
        query: trimmed,
        response: preliminary,
        isGenerating: true,
        isStreaming: false,
        typingPhrase: randomTypingPhrase,
      },
    ]);
    setRagInput('');
    requestAnimationFrame(() => {
      if (ragScrollRef.current) {
        ragScrollRef.current.scrollTop = ragScrollRef.current.scrollHeight;
      }
    });

    let receivedLiveTokens = false;
    const geminiResponse = await askGeminiDossierAi(
      trimmed,
      priorHistory,
      location.pathname,
      visitorLens,
      (partialText) => {
        receivedLiveTokens = true;
        setRagHistory((prev) =>
          prev.map((t) =>
            t.id === turnId
              ? {
                ...t,
                response: { ...t.response, answer: partialText },
                isGenerating: false,
                isStreaming: true,
                isLiveStream: true,
              }
              : t
          )
        );
        requestAnimationFrame(() => {
          if (ragScrollRef.current) {
            ragScrollRef.current.scrollTop = ragScrollRef.current.scrollHeight;
          }
        });
      }
    );
    setRagHistory((prev) =>
      prev.map((t) =>
        t.id === turnId
          ? {
            ...t,
            response: geminiResponse,
            isGenerating: false,
            isStreaming: !receivedLiveTokens,
            isLiveStream: receivedLiveTokens,
          }
          : t
      )
    );
    requestAnimationFrame(() => {
      if (ragScrollRef.current) {
        ragScrollRef.current.scrollTop = ragScrollRef.current.scrollHeight;
      }
    });
  };

  const executeSlashCommand = (item: (typeof WADE_SLASH_COMMANDS)[number]) => {
    setPromptHistoryIdx(-1);
    if (item.cmd === '/clear') {
      setRagInput('');
      resetWadeSheet();
      return;
    }
    if (item.cmd === '/recruiter') {
      setRagInput('');
      setVisitorLens((prev) => (prev === 'recruiter' ? 'default' : 'recruiter'));
      return;
    }
    if (item.cmd === '/dev') {
      setRagInput('');
      setVisitorLens((prev) => (prev === 'dev' ? 'default' : 'dev'));
      return;
    }
    if (item.cmd === '/fit') {
      setRagInput('/fit ');
      requestAnimationFrame(() => ragInputRef.current?.focus());
      return;
    }
    setRagInput('');
    void askRagQuestion(item.query);
  };

  const handleRagSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = ragInput.trim();
    const normalizedTrimmed = trimmed.startsWith('\\') ? `/${trimmed.slice(1)}` : trimmed;
    if (/^\/fit\b/i.test(normalizedTrimmed)) {
      setPromptHistoryIdx(-1);
      askRagQuestion(
        normalizedTrimmed.toLowerCase() === '/fit'
          ? '/fit AI & Full-Stack Engineer'
          : normalizedTrimmed
      );
      return;
    }
    if (normalizedTrimmed.startsWith('/')) {
      const exact =
        WADE_SLASH_COMMANDS.find((c) => c.cmd === normalizedTrimmed.toLowerCase()) ??
        slashMatches[activeSlashIdx];
      if (exact) {
        executeSlashCommand(exact);
        return;
      }
    }
    setPromptHistoryIdx(-1);
    askRagQuestion(ragInput);
  };

  const handleRagAction = (action: RagAction) => {
    if (action.route) {
      setRagOpen(false);
      navigate(action.route);
    } else if (action.href) {
      window.open(action.href, action.href.startsWith('mailto:') ? '_self' : '_blank', 'noopener,noreferrer');
    }
  };

  useEffect(() => {
    if (ragOpen) {
      requestAnimationFrame(() => {
        ragInputRef.current?.focus();
        if (ragScrollRef.current) {
          ragScrollRef.current.scrollTop = ragScrollRef.current.scrollHeight;
        }
      });
    }
  }, [ragOpen]);

  useEffect(() => {
    const onFooterVisibility = (e: Event) => {
      const visible = Boolean((e as CustomEvent<boolean>).detail);
      setFooterVisible(visible);
      if (visible) {
        setShowShortcuts(false);
        setJournalOpen(false);
        setRagOpen(false);
      }
    };
    window.addEventListener('footer-visibility', onFooterVisibility);
    return () => window.removeEventListener('footer-visibility', onFooterVisibility);
  }, []);

  useEffect(() => {
    return musicEngine.subscribe((snapshot) => {
      playbackRef.current = snapshot;
      setPlayback(snapshot);
    });
  }, []);

  const currentTrack = MUSIC_TRACKS[playback.trackIndex];

  useEffect(() => {
    const handleKeyboard = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const isTyping = target.matches('input, textarea, select') || target.isContentEditable;

      if (event.key === 'Escape' && (journalOpen || showShortcuts || ragOpen)) {
        event.preventDefault();
        setJournalOpen(false);
        setShowShortcuts(false);
        setRagOpen(false);
        return;
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setRagOpen((open) => !open);
        setJournalOpen(false);
        setShowShortcuts(false);
        return;
      }

      if (event.ctrlKey && (event.key === '`' || event.key === '~')) {
        event.preventDefault();
        setJournalOpen((open) => !open);
        setRagOpen(false);
        return;
      }

      if (isTyping || journalOpen || ragOpen || event.metaKey || event.ctrlKey || event.altKey) return;

      const key = event.key.toLowerCase();
      const currentPlayback = playbackRef.current;
      if (event.code === 'Space') {
        event.preventDefault();
        void musicEngine.toggle(currentPlayback.trackIndex);
      } else if (key === 'n') {
        void musicEngine.play((currentPlayback.trackIndex + 1) % MUSIC_TRACKS.length);
      } else if (key === 'b') {
        void musicEngine.play((currentPlayback.trackIndex - 1 + MUSIC_TRACKS.length) % MUSIC_TRACKS.length);
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        musicEngine.setVolume(Math.min(1, currentPlayback.volume + 0.08));
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        musicEngine.setVolume(Math.max(0, currentPlayback.volume - 0.08));
      } else if (key === 't') {
        toggleTheme();
      } else if (event.key === '?') {
        setShowShortcuts(true);
      }

      if (key.length === 1 && /[a-z]/.test(key)) {
        typedBuffer.current = `${typedBuffer.current}${key}`.slice(-24);
        if (typedBuffer.current.endsWith('superman')) void musicEngine.play(MUSIC_TRACKS.findIndex((track) => track.id === 'starman'));
        if (typedBuffer.current.endsWith('spiderverse')) void musicEngine.play(MUSIC_TRACKS.findIndex((track) => track.id === 'am-i-dreaming'));
      }

      const konami = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];
      if (key === konami[konamiProgress.current]) {
        konamiProgress.current += 1;
        if (konamiProgress.current === konami.length) {
          konamiProgress.current = 0;
          audioEngine.init();
          audioEngine.playClick();
          setJournalOpen(true);
        }
      } else {
        konamiProgress.current = key === konami[0] ? 1 : 0;
      }
    };

    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [showShortcuts, journalOpen, ragOpen, toggleTheme]);

  return (
    <>
      {/* Flat side-by-side Launcher Dock - Visible on Desktop & Mobile (above mobile dock) and auto-retracts when Footer is in view */}
      <aside
        className={`field-agent-launcher-dock fixed bottom-[76px] right-3 sm:bottom-4 sm:right-8 z-[380] flex items-center gap-1 rounded-lg border-2 border-ink bg-paper p-1 shadow-[3px_3px_0_var(--c-ink)] print:hidden transition-all duration-300 ease-out ${footerVisible ? 'opacity-0 translate-y-12 pointer-events-none invisible' : 'opacity-100 translate-y-0 visible'
          }`}
        aria-label="Field Agent Control Launcher"
      >
        {/* WADE Launcher Button with Mini Mascot */}
        <button
          type="button"
          onClick={() => {
            audioEngine.init();
            audioEngine.playClick();
            setRagOpen((open) => !open);
            setJournalOpen(false);
            setShowShortcuts(false);
          }}
          className={`group relative flex items-center justify-center gap-1.5 rounded px-2.5 py-1 transition-all duration-200 focus:outline-none ${ragOpen
            ? 'bg-stamp text-paper shadow-sm'
            : 'bg-ink/5 text-ink hover:bg-stamp hover:text-paper'
            }`}
          aria-expanded={ragOpen}
          title="Talk to WADE — Moin's Portfolio Guardian (Ctrl + K)"
        >
          <WadeMascot size={18} mood={ragOpen ? 'sassy' : 'idle'} />
          <span className="font-stamp text-[10.5px] font-black tracking-wider uppercase whitespace-nowrap">
            ASK WADE
          </span>
          <span
            className={`h-1.5 w-1.5 rounded-full shrink-0 ${ragOpen ? 'bg-paper' : 'bg-stamp animate-pulse'
              }`}
          />
        </button>

        {/* Journal Tab Button - Compact icon by default, expands to full size on click */}
        <button
          type="button"
          onClick={() => {
            setJournalOpen((open) => !open);
            setRagOpen(false);
            setShowShortcuts(false);
          }}
          className={`group relative hidden sm:flex items-center justify-center rounded transition-all duration-200 focus:outline-none ${journalOpen
            ? 'bg-stamp text-paper px-3 py-1.5 gap-2 shadow-sm'
            : 'text-ink hover:bg-ink/10 h-8 w-8'
            }`}
          aria-expanded={journalOpen}
          title="Open Field Case Journal & Comic Log (Ctrl + `)"
        >
          {/* Subtle Satin Bookmark Tag hanging off top */}
          <div className="absolute -top-2.5 right-1 h-3.5 w-1.5 rounded-b-xs border-x border-b border-paper/40 bg-stamp shadow-xs pointer-events-none" />

          <BookOpen className={`h-4 w-4 transition-transform group-hover:scale-110 shrink-0 ${journalOpen ? 'text-paper' : 'text-stamp'}`} />

          {journalOpen && (
            <span className="font-mono text-[10px] font-black tracking-wider uppercase whitespace-nowrap animate-in fade-in slide-in-from-left-1 duration-200">
              CASE JOURNAL
            </span>
          )}
        </button>
      </aside>

      <AnimatePresence>
        {/* WADE Tactile Desk Clipboard with Side Index Tabs */}
        {ragOpen && (
          <motion.section
            data-lenis-prevent
            data-lenis-prevent-wheel
            data-lenis-prevent-touch
            initial={{ opacity: 0, y: 22, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-label="WADE — Portfolio Chat"
            className="fixed bottom-[124px] right-4 sm:bottom-[64px] sm:right-8 z-[420] w-[min(90vw,430px)] h-[min(75vh,575px)] flex flex-col pt-4 print:hidden overflow-visible"
          >
            {/* Clipboard Backing Board with Wood/Kraft Grain & Corner Rivets */}
            <div className="relative flex-1 min-h-0 flex flex-col rounded-md border-2 border-ink bg-folder-dark bg-cardboard p-2.5 shadow-[8px_10px_0_var(--c-ink),0_26px_54px_rgba(0,0,0,0.38)] overflow-visible">
              {/* 4 Corner Brass/Steel Board Rivets */}
              <span className="pointer-events-none absolute top-1.5 left-1.5 w-1.5 h-1.5 rounded-full bg-stone-300 border border-ink/70" aria-hidden="true" />
              <span className="pointer-events-none absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-stone-300 border border-ink/70" aria-hidden="true" />
              <span className="pointer-events-none absolute bottom-1.5 left-1.5 w-1.5 h-1.5 rounded-full bg-stone-300 border border-ink/70" aria-hidden="true" />
              <span className="pointer-events-none absolute bottom-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-stone-300 border border-ink/70" aria-hidden="true" />

              {/* Secondary Under-Sheet Peeking Slightly Beneath Active Page */}
              <div
                className="pointer-events-none absolute inset-x-3 top-3 bottom-1.5 rounded-xs border border-ink/35 bg-paper/90 rotate-[0.7deg] z-0"
                aria-hidden="true"
              />

              {/* Brushed Steel Spring Clipboard Clip (Top Center) */}
              <div
                className="absolute -top-4 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center pointer-events-none select-none"
                aria-hidden="true"
              >
                <div className="w-6 h-3 rounded-t-full border-2 border-b-0 border-ink bg-gradient-to-b from-stone-200 to-stone-400 flex items-center justify-center">
                  <div className="w-2 h-1.5 rounded-full bg-desk/80 border border-ink/60" />
                </div>
                <div className="relative flex items-center">
                  {/* Left & Right Spring-Wire Hinge Arms */}
                  <span className="w-2.5 h-3 -mr-0.5 rounded-l-full border-2 border-r-0 border-ink bg-stone-300" />
                  <div className="w-32 h-5 rounded-xs border-2 border-ink bg-gradient-to-b from-stone-100 via-stone-300 to-stone-400 shadow-[0_4px_0_rgba(0,0,0,0.28)] flex items-center justify-between px-2.5 relative overflow-hidden">
                    <div className="absolute inset-x-0 top-0.5 h-[1px] bg-white/75" />
                    <div className="absolute inset-x-1 bottom-0.5 h-[1.5px] bg-ink/20 rounded-full" />
                    <span className="w-1.5 h-1.5 rounded-full bg-stone-600 border border-ink/60" />
                    <span className="font-mono text-[7.5px] font-black tracking-[0.22em] text-ink/85 uppercase">
                      WADE-01
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-stone-600 border border-ink/60" />
                  </div>
                  <span className="w-2.5 h-3 -ml-0.5 rounded-r-full border-2 border-l-0 border-ink bg-stone-300" />
                </div>
              </div>

              {/* Clamped Looseleaf Dot-Grid Sheet */}
              <div
                style={{ backgroundColor: 'var(--c-doc)' }}
                className="relative z-10 flex-1 min-h-0 flex flex-col rounded-xs border-[1.5px] border-ink bg-doc text-ink overflow-hidden"
              >
                {/* Clean Editorial Looseleaf Header with Clip Cast Shadow */}
                <header
                  style={{
                    boxShadow: 'inset 0 10px 12px -10px rgba(0, 0, 0, 0.24)',
                  }}
                  className="relative shrink-0 bg-paper border-b-[1.5px] border-ink pl-3.5 pr-3 pt-3 pb-2 flex items-center justify-between gap-2.5"
                >
                  {/* Left Crimson Spine Accent */}
                  <span
                    className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-stamp"
                    aria-hidden="true"
                  />

                  <div className="flex items-center gap-2.5 min-w-0">
                    <button
                      type="button"
                      onClick={() => {
                        setHeaderMoodIdx((i) => i + 1);
                      }}
                      className="shrink-0 -my-0.5 cursor-pointer hover:scale-105 active:scale-95 transition-transform"
                      title="Click Wade to switch expression"
                      aria-label="Cycle Wade expression"
                    >
                      <WadeMascot size={50} mood={isWadeThinking ? 'thinking' : headerMood} />
                    </button>

                    <div className="flex flex-col justify-center min-w-0">
                      <div className="flex items-baseline gap-1.5">
                        <span className="relative inline-block font-stamp text-[22px] font-black tracking-[0.08em] text-ink uppercase leading-none">
                          <span
                            className="pointer-events-none absolute inset-x-0 bottom-0.5 h-2.5 bg-hl-yellow-bg/75 -rotate-1 z-0"
                            aria-hidden="true"
                          />
                          <span className="relative z-10">WADE</span>
                        </span>
                        <span className="font-mono text-[8.5px] font-bold uppercase tracking-wider text-ink/45 leading-none whitespace-nowrap">
                          {isWadeThinking
                            ? '· thinking…'
                            : `· ${ragHistory.length} ${ragHistory.length === 1 ? 'note' : 'notes'}`}
                        </span>
                      </div>
                      <span className="font-handwritten text-[12.5px] font-bold text-ink/70 truncate mt-0.5 leading-snug">
                        Moin&apos;s portfolio guardian
                      </span>
                    </div>
                  </div>

                  {/* Redesigned Tactile Header Actions (SAVE / NEW / CLOSE) */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={exportWadeNotes}
                      title="Export clipboard notes (.md)"
                      aria-label="Export clipboard notes"
                      className="h-7 px-2 inline-flex items-center gap-1 rounded-xs border-[1.5px] border-ink/80 bg-doc text-ink font-mono text-[9px] font-black tracking-wider uppercase shadow-[1.5px_1.5px_0_var(--c-ink)] hover:bg-hl-yellow-bg active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
                    >
                      <Download className="w-3 h-3" />
                      <span>SAVE</span>
                    </button>
                    <button
                      type="button"
                      onClick={resetWadeSheet}
                      title="New sheet (Reset chat)"
                      aria-label="Reset chat history"
                      className="h-7 px-2 inline-flex items-center gap-1 rounded-xs border-[1.5px] border-ink/80 bg-doc text-ink font-mono text-[9px] font-black tracking-wider uppercase shadow-[1.5px_1.5px_0_var(--c-ink)] hover:bg-hl-yellow-bg active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>NEW</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRagOpen(false)}
                      title="Close WADE clipboard"
                      aria-label="Close WADE clipboard"
                      className="h-7 w-7 flex items-center justify-center rounded-xs border-[1.5px] border-ink bg-stamp/10 text-stamp shadow-[1.5px_1.5px_0_var(--c-ink)] hover:bg-stamp hover:text-paper active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                  </div>
                </header>

                {/* Classic Double Vertical Red Margin Rule on Looseleaf Sheet */}
                <div
                  className="pointer-events-none absolute top-0 bottom-0 left-2.5 z-0 w-[3px] border-l border-r border-stamp/18"
                  aria-hidden="true"
                />
                {/* Subtle WADE Watermark Stamp on Page (non-flowing overlay so it never shifts messages) */}
                <div
                  className="pointer-events-none select-none absolute top-20 right-4 z-0 opacity-[0.045] -rotate-12 font-stamp text-[20px] font-black tracking-widest text-stamp border-2 border-stamp px-2 py-0.5 uppercase"
                  aria-hidden="true"
                >
                  WADE // VERIFIED
                </div>

                {/* Architect Graph-Paper Transcript Canvas */}
                <div
                  ref={ragScrollRef}
                  onScroll={(e) => {
                    const el = e.currentTarget;
                    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
                    setShowScrollDown(distFromBottom > 90);
                  }}
                  style={{
                    backgroundColor: 'color-mix(in srgb, var(--c-paper) 38%, var(--c-doc))',
                    backgroundImage: [
                      'linear-gradient(to right, color-mix(in srgb, var(--c-ink) 9%, transparent) 1px, transparent 1px)',
                      'linear-gradient(to bottom, color-mix(in srgb, var(--c-ink) 9%, transparent) 1px, transparent 1px)',
                      'linear-gradient(to right, color-mix(in srgb, var(--c-ink) 5%, transparent) 1px, transparent 1px)',
                      'linear-gradient(to bottom, color-mix(in srgb, var(--c-ink) 5%, transparent) 1px, transparent 1px)',
                    ].join(', '),
                    backgroundSize: '80px 80px, 80px 80px, 20px 20px, 20px 20px',
                  }}
                  className="relative flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 pt-4 pb-6"
                >
                  <MessageGroup className="relative z-10 gap-4">
                    {ragHistory.map((turn, turnIdx) => {
                      const cleanHeadingLine = (raw: string) =>
                        raw.replace(/^#{1,4}\s+/, '').trim();
                      const normalizedTurn: ChatTurn = {
                        ...turn,
                        response: {
                          ...turn.response,
                          answer: turn.response.answer
                            .replace(/\s*\[\d+\]/g, '')
                            .split('\n')
                            .map((l) =>
                              /^#{1,4}\s+/.test(l.trim())
                                ? `**${cleanHeadingLine(l.trim())}**`
                                : l
                            )
                            .join('\n'),
                        },
                      };

                      return (
                        <Fragment key={turn.id}>
                          {turn.query && (
                            <Message align="end">
                              <MessageContent className="items-end gap-1">
                                <MessageHeader className="justify-end text-xs font-typewriter text-ink/60 px-1">
                                  You
                                </MessageHeader>
                                <BubbleGroup className="w-full items-end">
                                  <Bubble
                                    align="end"
                                    variant="default"
                                    shape="cloud"
                                    pen="you"
                                    tail
                                    className="max-w-[88%]"
                                  >
                                    <BubbleContent
                                      seed={`user-bubble-${turn.id}`}
                                      className="font-typewriter text-[12.5px] leading-relaxed text-white px-4 py-2.5"
                                    >
                                      {turn.query}
                                    </BubbleContent>
                                  </Bubble>
                                </BubbleGroup>
                              </MessageContent>
                            </Message>
                          )}

                          <StreamingRagMessage
                            turn={normalizedTurn}
                            onAction={handleRagAction}
                            onFollowUp={askRagQuestion}
                            isLatestCompleted={turnIdx === ragHistory.length - 1}
                            onStreamTick={() => {
                              if (ragScrollRef.current) {
                                ragScrollRef.current.scrollTop = ragScrollRef.current.scrollHeight;
                              }
                            }}
                          />
                        </Fragment>
                      );
                    })}

                    {/* Natural Looseleaf Outline Starter Bubbles on First Open */}
                    {ragHistory.length <= 1 && (
                      <div className="flex flex-wrap gap-2 pl-12 pt-1">
                        {SUGGESTED_RAG_PROMPTS.slice(0, 3).map((prompt) => (
                          <Bubble key={prompt} align="start" variant="outline" shape="cloud" tail={false}>
                            <BubbleContent
                              asChild
                              seed={`starter-${prompt}`}
                              className="font-typewriter text-[11.5px] text-ink/80 hover:text-ink px-3 py-1.5"
                            >
                              <button
                                type="button"
                                onClick={() => askRagQuestion(prompt)}
                                className="cursor-pointer text-left"
                              >
                                {prompt}
                              </button>
                            </BubbleContent>
                          </Bubble>
                        ))}
                      </div>
                    )}
                  </MessageGroup>
                </div>

                {/* Clean Bottom Dispatch Input Strip */}
                <form
                  onSubmit={handleRagSubmit}
                  className="relative shrink-0 bg-paper/90 border-t border-ink/20 px-3.5 py-2.5"
                >
                  {/* Slash-Command Index Slip (only visible when typing /) */}
                  {slashMatches.length > 0 && (
                    <div
                      role="listbox"
                      aria-label="Wade slash commands"
                      className="absolute bottom-full left-3.5 right-3.5 mb-1.5 z-30 rounded-xs border-[1.5px] border-ink bg-paper shadow-[4px_4px_0_var(--c-ink)] py-1 divide-y divide-ink/10"
                    >
                      {slashMatches.map((item, idx) => {
                        const isSelected = idx === activeSlashIdx;
                        return (
                          <button
                            key={item.cmd}
                            type="button"
                            role="option"
                            aria-selected={isSelected}
                            onMouseEnter={() => setSlashSelectedIdx(idx)}
                            onClick={() => executeSlashCommand(item)}
                            className={`w-full px-3 py-1.5 flex items-center justify-between gap-2 text-left transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-hl-yellow-bg/80 border-l-2 border-l-stamp'
                                : 'hover:bg-hl-yellow-bg/50'
                            }`}
                          >
                            <span className="font-mono text-[10.5px] font-black text-stamp">
                              {item.cmd}
                            </span>
                            <span className="font-typewriter text-[11px] text-ink/75 truncate">
                              {item.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {showScrollDown && (
                    <button
                      type="button"
                      onClick={() => {
                        if (ragScrollRef.current) {
                          ragScrollRef.current.scrollTo({
                            top: ragScrollRef.current.scrollHeight,
                            behavior: 'smooth',
                          });
                        }
                      }}
                      aria-label="Scroll to latest message"
                      title="Jump to latest"
                      className="absolute -top-10 left-1/2 -translate-x-1/2 z-20 w-9 h-9 flex items-center justify-center cursor-pointer ll-drop-sticker opacity-70 hover:opacity-100 hover:-translate-y-0.5 active:translate-y-0 transition-all"
                    >
                      <svg
                        width="34"
                        height="34"
                        viewBox="0 0 36 36"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        {/* Hand-drawn yellow sticky-square */}
                        <path
                          d="M6.5 3.5 C13.5 3 23 3.2 29.5 3.8 C31.8 4 32.8 5.4 32.6 8 C32.3 15 32.7 22.5 32.2 28.8 C32 31.4 30.8 32.5 28 32.4 C21 32.2 13 32.6 7 32.1 C4.4 31.9 3.4 30.6 3.5 28 C3.8 21 3.3 13 3.8 7 C4 4.7 4.9 3.6 6.5 3.5 Z"
                          fill="#f2dc5d"
                          stroke="var(--c-ink)"
                          strokeWidth="2.3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        {/* Subtle sketchy second ink pass along top-right */}
                        <path
                          d="M14 3.3 Q23 3.1 29.8 3.9 C31.6 4.2 32.5 5.4 32.5 7.5"
                          stroke="var(--c-ink)"
                          strokeWidth="1.2"
                          strokeOpacity="0.45"
                          strokeLinecap="round"
                        />
                        {/* Hand-drawn downward arrow */}
                        <path
                          d="M18 11.2 C18.1 15.5 17.9 20.2 18 24.4"
                          stroke="var(--c-ink)"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                        <path
                          d="M12.6 19.4 C14.5 21.4 16.4 23.2 18 24.8 C19.7 23.1 21.5 21.3 23.4 19.5"
                          stroke="var(--c-ink)"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  )}

                  <div className="flex items-center gap-2 bg-doc border border-ink/40 rounded-xs px-3 py-1.5 focus-within:border-ink transition-colors">
                    {visitorLens !== 'default' && (
                      <button
                        type="button"
                        onClick={() => setVisitorLens('default')}
                        title="Click to clear active visitor lens"
                        className="shrink-0 px-1.5 py-0.5 rounded-[2px] border border-stamp/40 bg-stamp/10 font-mono text-[8.5px] font-black uppercase tracking-wider text-stamp hover:bg-stamp hover:text-paper transition-colors cursor-pointer"
                      >
                        {visitorLens === 'recruiter' ? 'HIRING' : 'DEV'} ×
                      </button>
                    )}
                    <input
                      ref={ragInputRef}
                      type="text"
                      maxLength={MAX_QUERY_LENGTH}
                      value={ragInput}
                      onChange={(e) => {
                        setRagInput(e.target.value);
                        setPromptHistoryIdx(-1);
                        setSlashSelectedIdx(0);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape' && isSlashInput) {
                          e.stopPropagation();
                          setRagInput('');
                          setSlashSelectedIdx(0);
                          return;
                        }
                        if (slashMatches.length > 0) {
                          if (e.key === 'ArrowDown') {
                            e.preventDefault();
                            setSlashSelectedIdx((idx) => (idx + 1) % slashMatches.length);
                            return;
                          }
                          if (e.key === 'ArrowUp') {
                            e.preventDefault();
                            setSlashSelectedIdx(
                              (idx) => (idx - 1 + slashMatches.length) % slashMatches.length
                            );
                            return;
                          }
                          if (e.key === 'Tab') {
                            e.preventDefault();
                            const chosen = slashMatches[activeSlashIdx];
                            if (chosen) {
                              setRagInput(chosen.cmd === '/fit' ? '/fit ' : chosen.cmd);
                            }
                            return;
                          }
                        }
                        if (e.key === 'ArrowUp' && !isSlashInput && userPromptHistory.length > 0) {
                          e.preventDefault();
                          const nextIdx = promptHistoryIdx === -1
                            ? userPromptHistory.length - 1
                            : Math.max(0, promptHistoryIdx - 1);
                          setPromptHistoryIdx(nextIdx);
                          setRagInput(userPromptHistory[nextIdx]);
                        } else if (e.key === 'ArrowDown' && promptHistoryIdx !== -1) {
                          e.preventDefault();
                          const nextIdx = promptHistoryIdx + 1;
                          if (nextIdx >= userPromptHistory.length) {
                            setPromptHistoryIdx(-1);
                            setRagInput('');
                          } else {
                            setPromptHistoryIdx(nextIdx);
                            setRagInput(userPromptHistory[nextIdx]);
                          }
                        }
                      }}
                      placeholder={routePlaceholder}
                      aria-label="Ask WADE a question"
                      className="flex-1 min-w-0 bg-transparent py-0.5 font-typewriter text-[12.5px] text-ink placeholder:text-ink/45 outline-none! focus:outline-none! focus-visible:outline-none!"
                    />
                    {ragInput.length >= 280 && (
                      <span
                        className={`font-mono text-[9.5px] font-bold shrink-0 ${ragInput.length >= 345 ? 'text-stamp' : 'text-ink/45'
                          }`}
                      >
                        {ragInput.length}/{MAX_QUERY_LENGTH}
                      </span>
                    )}
                    <button
                      type="submit"
                      disabled={isWadeThinking}
                      aria-label="Send question"
                      className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-xs bg-stamp hover:bg-ink disabled:opacity-45 text-paper font-mono text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      <Send className="w-3 h-3" />
                      <span>ASK</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </motion.section>
        )}
        {/* Shortcuts Guide Card */}
        {showShortcuts && (
          <motion.section
            className="fixed bottom-[90px] right-4 z-[390] w-[min(92vw,330px)] border-[3px] border-ink bg-paper p-5 text-ink shadow-[8px_8px_0_var(--c-ink)] sm:right-8"
            initial={{ opacity: 0, y: 14, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            aria-label="Keyboard shortcuts"
          >
            <div className="flex items-center justify-between border-b-2 border-ink/20 pb-2.5">
              <span className="flex items-center gap-2 font-stamp text-lg font-black text-ink">
                <Compass className="h-5 w-5 text-stamp" /> FIELD DIRECTIVES
              </span>
              <button type="button" onClick={() => setShowShortcuts(false)} aria-label="Close shortcuts" className="hover:text-stamp">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-2 font-['Kalam',cursive] text-xs font-bold text-ink/75 leading-relaxed">
              Global shortcuts active across all agent files:
            </p>
            <dl className="mt-3 grid grid-cols-[100px_1fr] gap-y-2 font-mono text-[10px]">
              {SHORTCUTS.map(([key, action]) => (
                <Fragment key={key}>
                  <dt className="font-black text-stamp">{key}</dt>
                  <dd className="font-bold text-ink/80">{action}</dd>
                </Fragment>
              ))}
            </dl>
          </motion.section>
        )}

        {/* Enhanced 2-Page Vintage Field Journal Overlay */}
        {journalOpen && (
          <motion.aside
            className="field-pocket-journal fixed inset-x-3 bottom-[65px] z-[410] mx-auto max-w-2xl sm:bottom-10 pointer-events-none"
            initial={{ opacity: 0, y: 40, rotate: -1.5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, rotate: 1, scale: 0.95 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-label="Field Pocket Journal"
          >
            {/* Textured Sleeve Wrapper using Theme Colors */}
            <div className="relative rounded-xl border-[3px] border-ink bg-folder-dark p-3 sm:p-4 shadow-[0_25px_60px_rgba(0,0,0,0.5)] pointer-events-auto">

              {/* Double stitched borders inside the cover */}
              <div className="absolute inset-1.5 rounded-lg border border-dashed border-ink/20 pointer-events-none" />
              <div className="absolute inset-2.5 rounded-md border border-dotted border-ink/10 pointer-events-none" />

              {/* Brass Corner Brackets */}
              <div className="absolute top-2 left-2 h-4 w-4 rounded-tl border-t-2 border-l-2 border-ink/40 pointer-events-none" />
              <div className="absolute top-2 right-2 h-4 w-4 rounded-tr border-t-2 border-r-2 border-ink/40 pointer-events-none" />
              <div className="absolute bottom-2 left-2 h-4 w-4 rounded-bl border-b-2 border-l-2 border-ink/40 pointer-events-none" />
              <div className="absolute bottom-2 right-2 h-4 w-4 rounded-br border-b-2 border-r-2 border-ink/40 pointer-events-none" />

              {/* Crimson Bookmark Satin Ribbon */}
              <div
                className="absolute top-0 right-[42%] w-3.5 h-24 bg-stamp z-30 pointer-events-none shadow-md border-x border-b border-paper/30"
                style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 86%, 0 100%)' }}
              />


              {/* Stacked Paper Spread */}
              <div className="relative rounded-lg border-2 border-ink bg-folder p-0.5 shadow-2xl">

                {/* Uneven Stacked Paper Edges */}
                <div className="absolute -bottom-1 inset-x-2 h-2 rounded bg-paper/60 border border-ink/10 pointer-events-none -z-10" />
                <div className="absolute -bottom-2 inset-x-4.5 h-2 rounded bg-paper/30 border border-ink/10 pointer-events-none -z-20" />

                {/* Double Page Layout */}
                <div className="relative grid grid-cols-1 md:grid-cols-2 gap-0 overflow-hidden rounded bg-paper text-ink">

                  {/* Crease line shadow */}
                  <div className="hidden md:block absolute inset-y-0 left-1/2 -translate-x-1/2 w-6 bg-gradient-to-r from-black/10 via-black/25 to-black/10 z-20 pointer-events-none" />

                  {/* Metal Wire Spiral Binding Spine */}
                  <div className="hidden md:flex absolute inset-y-0 left-1/2 -translate-x-1/2 flex-col justify-around py-5 z-25 pointer-events-none w-8">
                    {Array.from({ length: 9 }).map((_, i) => (
                      <div key={i} className="relative flex items-center justify-between w-full h-3 -my-0.5">
                        {/* Left binder hole */}
                        <div className="w-1.5 h-1.5 rounded-full bg-ink/75 shadow-[inset_0.5px_0.5px_1px_rgba(0,0,0,0.8)]" />
                        {/* Curved wire ring */}
                        <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-6 h-2 rounded-full border-t border-b border-stone-400 bg-gradient-to-b from-stone-200 via-stone-100 to-stone-400 shadow-[1px_1px_2px_rgba(0,0,0,0.25)]" />
                        {/* Right binder hole */}
                        <div className="w-1.5 h-1.5 rounded-full bg-ink/75 shadow-[inset_0.5px_0.5px_1px_rgba(0,0,0,0.8)]" />
                      </div>
                    ))}
                  </div>

                  {/* Sleek Fabric Ribbon Bookmark integrated cleanly down the Center Spine */}
                  <div className="hidden md:block absolute -top-3 left-1/2 -translate-x-1/2 h-[calc(100%+26px)] w-3.5 z-22 pointer-events-none filter drop-shadow-[2px_4px_5px_rgba(0,0,0,0.3)]">
                    <div
                      className="w-full h-full bg-gradient-to-r from-red-950 via-stamp via-rose-700 to-red-900 border-x border-black/30 relative"
                      style={{
                        backgroundImage: 'repeating-linear-gradient(90deg, rgba(0,0,0,0.15) 0px, rgba(0,0,0,0.15) 1px, transparent 1px, transparent 3px)',
                        clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), 50% 100%, 0 calc(100% - 10px))'
                      }}
                    >
                      {/* Golden Satin Sheen Line down the ribbon */}
                      <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1px] bg-gradient-to-b from-amber-200/50 via-amber-300/30 to-transparent" />

                      {/* Brass Ring Accent near bottom tail */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full border border-amber-600 bg-amber-400 shadow-xs" />
                    </div>
                  </div>

                  {/* ================= PAGE 1: Case Dossier & Special Log ================= */}
                  <div className="relative p-4 sm:p-5 font-typewriter border-b md:border-b-0 md:border-r border-ink/20 overflow-hidden flex flex-col justify-between space-y-4">

                    {/* Horizontal ruled paper lines background */}
                    <div
                      className="absolute inset-0 opacity-[0.05] pointer-events-none z-0"
                      style={{
                        backgroundImage: 'repeating-linear-gradient(to bottom, transparent, transparent 23px, var(--c-ink) 24px)',
                        backgroundSize: '100% 24px'
                      }}
                    />

                    {/* Red margin line on the left */}
                    <div className="absolute inset-y-0 left-5 w-[2px] bg-rose-500/25 pointer-events-none z-10" />

                    {/* Faded diagonal CLASSIFIED stamp watermark */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden opacity-[0.03] z-0">
                      <span className="font-stamp text-[54px] font-black text-stamp tracking-[0.2em] -rotate-12 uppercase">
                        CLASSIFIED
                      </span>
                    </div>

                    {/* Top Content Area */}
                    <div className="relative z-10 space-y-3.5 pl-2 sm:pl-3">

                      {/* Subject Identity Header */}
                      <div className="relative bg-paper/90 border border-ink/20 p-2.5 rounded-xs shadow-2xs space-y-1">
                        {/* Tape Strip Accent */}
                        <div className="absolute -top-2 left-4 bg-tape/40 border border-tape/30 px-1.5 py-0.2 font-mono text-[8px] font-bold text-ink/70 uppercase tracking-widest rotate-[-1deg]">
                          FIELD JOURNAL
                        </div>

                        <div className="flex items-center justify-between border-b border-ink/15 pb-1 pt-0.5">
                          <span className="font-mono text-[9px] font-black text-stamp uppercase tracking-widest flex items-center gap-1.5">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-stamp animate-pulse" />
                            CASE FILE // #001
                          </span>
                          <span className="font-mono text-[8px] font-black text-stamp bg-stamp/10 px-1.5 py-0.2 rounded border border-stamp/20 uppercase tracking-wider">
                            SPECIAL CASE LOG
                          </span>
                        </div>

                        <div className="flex items-baseline justify-between pt-0.5">
                          <span className="font-mono text-sm font-black text-ink tracking-tight">
                            MD MOIN AKHTAR
                          </span>
                          <span className="font-mono text-[10px] font-extrabold text-ink/70">
                            SOFTWARE DEVELOPER
                          </span>
                        </div>
                      </div>

                      {/* Hero Showcase: Spider-Verse Comic Log */}
                      <div className="relative group bg-paper border-2 border-dashed border-stamp/40 hover:border-stamp p-3 rounded-xs transition-all shadow-xs hover:shadow-md bg-linear-to-br from-paper via-stamp/5 to-tape/10 space-y-3">

                        <div className="flex gap-3 items-center">
                          {/* Comic Cover Thumbnail with vintage tape */}
                          <div className="relative shrink-0 w-16 h-22 rounded overflow-hidden border border-ink/30 shadow-sm group-hover:rotate-1 transition-transform bg-ink/10">
                            <img
                              src="/moin cover.png"
                              alt="Spider-Verse Comic Cover"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = '/comic book cover.jpg';
                              }}
                            />
                            <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent pointer-events-none" />
                            <span className="absolute bottom-1 inset-x-0 font-mono text-[8px] font-black text-white text-center tracking-wider uppercase">
                              VOL. 01
                            </span>
                          </div>

                          {/* Details & Synopsis */}
                          <div className="min-w-0 flex-1 space-y-1.5">
                            <div className="font-mono text-xs font-black text-ink tracking-tight flex items-center gap-1 text-stamp group-hover:text-stamp transition-colors">
                              <Sparkles className="w-3.5 h-3.5 text-stamp shrink-0" />
                              <span>ORIGIN STORY CHRONICLES</span>
                            </div>
                            <p className="font-mono text-[10.5px] text-ink/75 leading-relaxed">
                              An interactive visual lore and web-slinger chronicle tracking the journey from Delhi to AI systems engineering.
                            </p>
                            <div className="flex items-center gap-2 text-[9px] font-mono text-ink/60 pt-0.5">
                              <span>• Retro Comic Art</span>
                              <span>• Secret Intel</span>
                            </div>
                          </div>
                        </div>

                        {/* Action Button */}
                        <button
                          type="button"
                          onClick={() => {
                            audioEngine.init();
                            audioEngine.playClick();
                            setJournalOpen(false);
                            navigate('/classified');
                          }}
                          className="w-full flex items-center justify-center gap-2 py-2 rounded-xs bg-stamp hover:bg-stamp/90 text-paper font-mono text-xs font-black uppercase tracking-wider transition-all shadow-2xs hover:shadow-sm hover:translate-y-[-1px]"
                        >
                          <span>READ COMIC LOG</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                    </div>

                    {/* Bottom Status Stamp Bar */}
                    <div className="relative z-10 pl-2 sm:pl-3 pt-2 border-t border-ink/15 flex items-center justify-between font-mono text-[9px]">
                      <span className="inline-block -rotate-1 border border-stamp bg-stamp/10 px-1.5 py-0.2 font-stamp text-[8px] font-black text-stamp tracking-widest uppercase">
                        PORTFOLIO JOURNAL • ONLINE
                      </span>
                      <span className="font-extrabold text-ink/40">PAGE 01</span>
                    </div>

                  </div>

                  {/* ================= PAGE 2: Field Notes & Atmosphere ================= */}
                  <div className="relative p-4 sm:p-5 font-typewriter overflow-hidden flex flex-col justify-between space-y-4">

                    {/* Ruled lines */}
                    <div
                      className="absolute inset-0 opacity-[0.05] pointer-events-none"
                      style={{
                        backgroundImage: 'repeating-linear-gradient(to bottom, transparent, transparent 23px, var(--c-ink) 24px)',
                        backgroundSize: '100% 24px'
                      }}
                    />

                    <div className="relative z-10 space-y-4">
                      {/* Header */}
                      <div className="flex items-center justify-between border-b border-ink/20 pb-2">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-stamp shrink-0" />
                          <span className="font-mono text-[10px] font-black tracking-widest text-ink uppercase">
                            FIELD NOTES
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setJournalOpen(false)}
                          className="flex h-6 w-6 items-center justify-center border border-ink/30 text-ink/75 hover:bg-ink hover:text-paper transition-all rounded-xs"
                          aria-label="Close Field Journal"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Field Dispatch Note */}
                      <div className="bg-paper/80 border border-ink/25 p-3.5 rounded-xs shadow-xs space-y-2.5">
                        <div className="flex items-center justify-between border-b border-ink/15 pb-1.5 mb-0.5">
                          <span className="font-mono text-[10px] font-black text-stamp tracking-wider uppercase">
                            INVESTIGATION DISPATCH
                          </span>
                          <span className="font-mono text-[9px] font-bold text-ink/60 uppercase tracking-wide">
                            DELHI SECTOR
                          </span>
                        </div>
                        <p className="font-mono text-[11.5px] text-ink/90 leading-[1.65] italic">
                          "Subject active in full-stack architecture, TypeScript frontends, and AI agent integration. Proven track record in rapid prototyping and tactile user experience engineering."
                        </p>
                        <div className="pt-1.5 border-t border-ink/12 flex items-center justify-between">
                          <span className="font-mono text-[10px] font-black text-ink">PRIMARY DIRECTIVE:</span>
                          <span className="font-mono text-[10px] font-bold text-stamp">Top folder tabs →</span>
                        </div>
                      </div>

                      {/* Live Audio Transmission Status Card */}
                      <div className="bg-paper/85 border border-ink/25 p-3 rounded-xs shadow-xs flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-ink/10 flex items-center justify-center shrink-0 border border-ink/25">
                            <Radio className={`w-4.5 h-4.5 text-stamp ${playback.isPlaying ? 'animate-pulse' : 'opacity-50'}`} />
                          </div>
                          <div className="min-w-0">
                            <div className="font-mono text-[9px] font-black text-stamp uppercase tracking-wider flex items-center gap-1.5 mb-0.5">
                              <span>DESK TRANSMISSION</span>
                              {playback.isPlaying && (
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-600 animate-ping" />
                              )}
                            </div>
                            <div className="font-mono text-xs font-bold text-ink truncate">
                              {currentTrack?.title ?? 'Awesome Mix Vol. 1'}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => void musicEngine.toggle(playback.trackIndex)}
                          className="shrink-0 px-3 py-1.5 rounded-xs border border-ink/30 bg-ink/5 hover:bg-stamp hover:text-paper hover:border-stamp transition-colors font-mono text-[10px] font-black tracking-wider uppercase flex items-center gap-1.5"
                        >
                          {playback.isPlaying ? (
                            <>
                              <Pause className="w-3 h-3" />
                              <span>PAUSE</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3 h-3" />
                              <span>PLAY</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Bottom Keyboard Reference & Footer */}
                    <div className="relative z-10 pt-2 border-t border-ink/20 flex items-center justify-between font-mono text-[9.5px] text-ink/65">
                      <div className="flex items-center gap-2.5">
                        <span><strong className="text-ink font-black">SPACE</strong> · Audio</span>
                        <span className="text-ink/35">|</span>
                        <span><strong className="text-ink font-black">T</strong> · Theme</span>
                        <span className="text-ink/35">|</span>
                        <span><strong className="text-ink font-black">ESC</strong> · Close</span>
                      </div>
                      <span className="font-extrabold text-ink/40">PG 02</span>
                    </div>

                  </div>

                </div>

              </div>

            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}



