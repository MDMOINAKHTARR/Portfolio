"use client";

import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { ActivityTimeline, type ActivityEvent } from "@/components/ui/activity-timeline";
import { Paper } from "@/components/ui/paper";
import { Clipboard, ClipboardPaper } from "@/components/ui/clipboard";
import { Notebook } from "@/components/ui/notebook";
import { StickyNote } from "@/components/ui/sticky-note";
import { Ticket, TicketBody, TicketStub, TicketNumber } from "@/components/ui/ticket";
import { Sticker } from "@/components/ui/sticker";
import { Doodle } from "@/components/ui/doodle";
import { BookmarkRibbon } from "@/components/ui/bookmark";
import { ConfettiTrigger } from "@/components/ui/confetti";
import { Annotate } from "@/components/ui/annotate";
import { Button } from "@/components/ui/button";
import { Stamp } from "@/components/ui/stamp";
import { Circled } from "@/components/ui/circled";
import { Underline } from "@/components/ui/underline";
import { Highlight } from "@/components/ui/highlight";
import { Tape } from "@/components/ui/tape";
import { audioEngine } from "@/lib/audio";
import { cn } from "@/lib/utils";
import { RefreshCw, Radio, ArrowUpRight, BookOpen, ExternalLink, Terminal, Trophy } from "lucide-react";
import { FaXTwitter } from "react-icons/fa6";
import { Github } from "lucide-react";

// Deduplicate activity items across live API responses
function deduplicateEvents(list: ActivityEvent[]): ActivityEvent[] {
  const seenKeys = new Set<string>();
  const out: ActivityEvent[] = [];

  for (const item of list) {
    let key = "";
    if (item.kind === "star") {
      key = `star:${item.target.toLowerCase().trim()}`;
    } else if (item.kind === "commit" || item.kind === "github") {
      const shaMatch = item.url?.match(/commit\/([a-f0-9]{7,40})/i) || item.id.match(/gh-push-([a-f0-9]{7})/i);
      if (shaMatch) {
        key = `commit:sha:${shaMatch[1].slice(0, 7).toLowerCase()}`;
      } else {
        key = `${item.kind}:${item.target.toLowerCase()}:${item.id}`;
      }
    } else if (item.kind === "leetcode") {
      key = `lc:${item.target.toLowerCase().trim()}`;
    } else if (item.kind === "x") {
      const statusIdMatch = item.url?.match(/status\/(\d+)/) || item.id.match(/\d{15,}/);
      key = statusIdMatch ? `x:${statusIdMatch[1]}` : `x:${item.id}`;
    } else {
      key = `${item.kind}:${item.id}`;
    }

    if (seenKeys.has(key)) {
      continue;
    }
    seenKeys.add(key);
    out.push(item);
  }

  return out.sort((a, b) => b.at - a.at);
}

export function ActivityStatusSection() {
  const [now, setNow] = useState(() => Date.now());
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<boolean>(false);

  // Keep relative times ticking every 60s when tab is visible
  useEffect(() => {
    const id = setInterval(() => {
      if (!document.hidden) {
        setNow(Date.now());
      }
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  // Fetch live recent data from unified backend (/api/activity-timeline) with client GitHub fallback
  const fetchAllLiveData = useCallback(async () => {
    setIsSyncing(true);
    setFetchError(false);

    try {
      try {
        const res = await fetch(`/api/activity-timeline?t=${Date.now()}`, {
          cache: "no-store",
          signal: AbortSignal.timeout(8000),
        });

        if (res.ok) {
          const data = await res.json();
          if (data?.success && Array.isArray(data.events)) {
            setEvents(deduplicateEvents(data.events));
            setNow(Date.now());
            return;
          }
        }
      } catch {
        // Fall through to direct GitHub public API fallback
      }

      try {
        const clientGhRes = await fetch(
          `https://api.github.com/users/MDMOINAKHTARR/events/public?per_page=15`,
          {
            headers: { Accept: "application/vnd.github.v3+json" },
            cache: "no-store",
            signal: AbortSignal.timeout(5000),
          }
        );

        if (clientGhRes.ok) {
          const data = await clientGhRes.json();
          if (Array.isArray(data)) {
            const liveEvents: ActivityEvent[] = [];
            for (const item of data) {
              const repo = item.repo?.name || "";
              const at = new Date(item.created_at).getTime();
              if (!repo || Number.isNaN(at)) continue;

              const shortRepo = repo.replace(/^MDMOINAKHTARR\//i, "");

              if (item.type === "PushEvent") {
                const sha = item.payload?.head;
                const commitMsg = item.payload?.commits?.[0]?.message?.split("\n")[0];
                const branch = item.payload?.ref?.replace("refs/heads/", "") || "main";

                liveEvents.push({
                  id: `gh-push-${sha ? sha.slice(0, 7) : item.id}`,
                  kind: "commit",
                  actor: "MDMOINAKHTARR",
                  action: "pushed to",
                  target: `${shortRepo}:${branch}`,
                  detail: commitMsg || `Pushed commit to ${branch}`,
                  at,
                  url: `https://github.com/${repo}${sha ? `/commit/${sha}` : ""}`,
                });
              } else if (item.type === "WatchEvent") {
                liveEvents.push({
                  id: `gh-star-${item.id || repo}`,
                  kind: "star",
                  actor: "MDMOINAKHTARR",
                  action: "starred",
                  target: repo,
                  detail: "Starred repository on GitHub",
                  at,
                  url: `https://github.com/${repo}`,
                });
              }
            }

            setEvents(deduplicateEvents(liveEvents));
            setNow(Date.now());
            return;
          }
        }

        setFetchError(true);
      } catch {
        setFetchError(true);
      }
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
    }
  }, []);

  // Fetch on mount and refresh periodically every 5 minutes when visible
  useEffect(() => {
    fetchAllLiveData();
    const interval = setInterval(() => {
      if (!document.hidden) {
        fetchAllLiveData();
      }
    }, 5 * 60_000);
    return () => clearInterval(interval);
  }, [fetchAllLiveData]);

  // Display only the latest 6 activities
  const latestSixEvents = events.slice(0, 6);

  const handleSyncClick = () => {
    audioEngine.playClick();
    fetchAllLiveData();
  };

  const handleAudioClick = () => {
    audioEngine.playClick();
  };

  return (
    <section
      aria-label="Recent activity & research exhibits"
      className="relative z-20 max-w-6xl mx-auto px-3 sm:px-6 pt-4 pb-10"
    >
      {/* External Activity Timeline Heading Row (excluded from equal-height card grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 mb-5">
        <div className="lg:col-span-6 flex items-end justify-between gap-3 pb-3.5 border-b border-amber-200/20">
          <div className="flex-1 min-w-0 border-l-4 border-amber-300 pl-3.5 sm:pl-4">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 mb-2 rounded-xs bg-amber-300/15 border border-amber-300/35 text-amber-200 font-type text-[10px] font-bold uppercase tracking-[0.18em]">
              <Radio className="size-3 text-amber-300 shrink-0" />
              <span>Live Telemetry</span>
            </div>

            <h2 className="text-3xl sm:text-[36px] font-extrabold tracking-tight text-[#fbf8f1] leading-none drop-shadow-[0_2px_10px_rgba(0,0,0,0.35)] flex items-center gap-2.5 flex-wrap">
              <span>Recent</span>
              <span className="inline-block bg-amber-300 text-[#141210] font-hand font-bold text-[32px] sm:text-[38px] leading-none px-3 py-1 -rotate-1 rounded-xs border border-[#141210]/20 shadow-[3px_3px_0_rgba(0,0,0,0.35)]">
                Activity
              </span>
            </h2>

            <p className="mt-2.5 font-type text-[11.5px] text-[#e2ebe4]/90 tracking-wider">
              GitHub commits &amp; stars · LeetCode solves · 𝕏 broadcasts
            </p>
          </div>

          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleSyncClick}
            disabled={isSyncing}
            seed="resync-tomato-btn"
            title="Fetch latest updates from GitHub and X"
            className={cn(
              "font-type text-[11px] font-bold uppercase tracking-[0.14em] cursor-pointer shrink-0 border-2 border-[#141210] shadow-[2px_2px_0_#141210] transition-colors",
              isSyncing
                ? "bg-amber-300! text-[#141210]! opacity-95!"
                : "bg-[#d9483b]! text-[#fffaf0]! hover:bg-[#c53a2e]!"
            )}
          >
            <RefreshCw className={cn("size-3.5", isSyncing && "animate-spin")} />
            <span>{isSyncing ? "Syncing..." : "Re-sync"}</span>
          </Button>
        </div>
      </div>

      {/* Equal-Height Two-Card Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-stretch">
        
        {/* ── LEFT COLUMN: LOOSELEAF CLIPBOARD FIELD LOG ── */}
        <div className="lg:col-span-6 flex">
          <Clipboard
            tone="hardboard"
            tilt={-0.35}
            seed="activity-clipboard-board"
            className="w-full max-w-none h-full px-4 sm:px-5 pt-11 pb-4 sm:pb-5"
          >
            <ClipboardPaper
              stock="paper"
              rules="ruled"
              edge={{ bottom: "torn" }}
              seed="activity-clipboard-sheet"
              style={{ paddingTop: "38px" }}
              className="-mt-5 flex-1 flex flex-col justify-between pe-3.5 sm:pe-4 pb-3 ps-10 sm:ps-12 bg-[#fbf8f1] text-[#1a1715]"
            >
              {/* Timeline Stream Container */}
              <div className="relative z-10 flex-1 flex flex-col">
                {isLoading && events.length === 0 ? (
                  <ol aria-label="Loading activity timeline" className="flex-1 flex flex-col justify-between font-sans">
                    {Array.from({ length: 6 }).map((_, idx) => (
                      <li
                        key={idx}
                        className={cn(
                          "flex-1 flex items-center gap-3 px-2.5 py-2.5 animate-pulse",
                          idx < 5 && "border-b border-[#8fb0d4]/30"
                        )}
                      >
                        <div className="size-6.5 rounded-full bg-[#8fb0d4]/25 shrink-0" />
                        <div className="flex-1 space-y-1.5">
                          <div className="h-3 w-3/4 bg-[#8fb0d4]/25 rounded-xs" />
                          <div className="h-2.5 w-1/2 bg-[#8fb0d4]/15 rounded-xs" />
                        </div>
                      </li>
                    ))}
                  </ol>
                ) : events.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center py-8 px-4 gap-2.5">
                    <p className="font-type text-[11.5px] text-[#5c5349]">
                      {fetchError
                        ? "Could not reach live activity feeds right now."
                        : "No recent public activity found."}
                    </p>
                    <button
                      type="button"
                      onClick={handleSyncClick}
                      className="font-type text-[10.5px] font-bold uppercase tracking-wider text-[#1f4488] hover:underline cursor-pointer"
                    >
                      Retry Sync
                    </button>
                  </div>
                ) : (
                  <ActivityTimeline events={latestSixEvents} now={now} />
                )}
              </div>

              {/* Clipboard Sheet Footer */}
              <div className="relative z-10 border-t border-[#8fb0d4]/45 pt-2.5 mt-2 flex items-center justify-between text-[10px] font-type text-[#685f54] flex-wrap gap-2">
                <div className="flex items-center gap-1.5">
                  <Radio className="size-2.5 text-[#2f6b45] animate-pulse" />
                  <span className="text-[#1a1715] font-bold uppercase tracking-wider">Live Telemetry</span>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href="https://github.com/MDMOINAKHTARR"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleAudioClick}
                    className="hover:text-[#1f4488] hover:underline flex items-center gap-1 transition-colors"
                  >
                    <Github className="size-2.5" />
                    <span>@MDMOINAKHTARR</span>
                  </a>
                  <span className="opacity-40">•</span>
                  <a
                    href="https://leetcode.com/u/__moinn_/"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleAudioClick}
                    className="hover:text-[#c2410c] hover:underline flex items-center gap-1 transition-colors"
                  >
                    <Terminal className="size-2.5" />
                    <span>@__moinn_</span>
                  </a>
                  <span className="opacity-40">•</span>
                  <a
                    href="https://x.com/Moincrafted"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleAudioClick}
                    className="hover:text-[#b23a28] hover:underline flex items-center gap-1 transition-colors"
                  >
                    <FaXTwitter className="size-2.5" />
                    <span>@Moincrafted</span>
                  </a>
                </div>
              </div>
            </ClipboardPaper>
          </Clipboard>
        </div>

        {/* ── RIGHT COLUMN: COMPACT LOOSELEAF RESEARCH PAPER DOSSIER ── */}
        <div className="lg:col-span-6 flex">
          <Paper
            stock="paper"
            rules="ruled-hand"
            edge={{ top: "torn" }}
            curl
            tape="both"
            tapeKind="washi-stripes"
            fastener="clip"
            tilt={0.3}
            seed="ieee-research-looseleaf"
            className="relative w-full h-full flex flex-col justify-between bg-[#fbf8f1] text-[#1a1715] rounded-xs border border-[#dcd3c1] overflow-visible"
          >
            {/* Looseleaf Top Masthead */}
            <div className="relative z-10 border-b border-[#8fb0d4]/45 px-4 sm:px-6 pt-5 pb-3 flex items-start justify-between gap-2">
              <div>
                <div className="font-type text-[9.5px] tracking-[0.2em] uppercase text-[#685f54]">
                  Peer-Reviewed Publication // Doc #11441054
                </div>
                <h2 className="font-hand text-xl sm:text-2xl font-bold text-[#1a1715] leading-tight mt-0.5">
                  Published{" "}
                  <Underline kind="double" tone="blue" seed="looseleaf-ieee-ul">
                    IEEE Research
                  </Underline>
                </h2>
              </div>

              {/* Hand-inked Looseleaf Rubber Stamp */}
              <div className="shrink-0 -mt-1">
                <Stamp
                  text="IEEE 2026"
                  shape="rect"
                  ink="ink-you"
                  sub="ICAUC"
                  tilt={-4}
                  w={84}
                  h={40}
                  seed="ieee-stamp-2026"
                />
              </div>
            </div>

            {/* Looseleaf Body with 3-Hole Binder Punch Margin + Red Notebook Margin Rule */}
            <div className="relative flex-1 flex z-10">
              {/* Left 3-Hole Binder Margin */}
              <div
                aria-hidden="true"
                className="flex flex-col justify-around items-center w-8 sm:w-10 shrink-0 py-2.5 border-r-2 border-[#d9776a]/70 select-none"
              >
                <div className="size-3 rounded-full bg-[#16253b]/85 border border-black/20 shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.65)]" />
                <div className="size-3 rounded-full bg-[#16253b]/85 border border-black/20 shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.65)]" />
                <div className="size-3 rounded-full bg-[#16253b]/85 border border-black/20 shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.65)]" />
              </div>

              {/* Notebook Content Area — Compact Research Paper Details */}
              <div className="flex-1 px-4 sm:px-5 py-3.5 flex flex-col justify-between gap-2.5">
                
                {/* Venue, Paper Title & Author */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Circled tone="blue" shape="circle" seed="ieee-circled" className="px-2 py-0.5 text-[10px] font-type font-bold text-[#1f4488] uppercase">
                      IEEE Xplore
                    </Circled>
                    <span className="font-type text-[10.5px] font-bold text-[#685f54]">
                      ICAUC 2026 • JAN 2026
                    </span>
                  </div>

                  <h3 className="font-sans font-extrabold text-sm sm:text-[15.5px] text-[#1a1715] leading-snug">
                    A Sentence-Level Risk Estimator for Identifying Hallucinations in Generative AI
                  </h3>

                  <div className="font-type text-[10px] text-[#685f54] tracking-wide">
                    <span className="font-bold text-[#1a1715]">MD Moin Akhtar</span> · VIPS-TC, New Delhi
                  </div>

                  <p className="font-hand text-[14.5px] text-[#2c4f9e] leading-snug pt-0.5">
                    “Scores each sentence independently — pinpointing fabricated quotes, dates, or names where document-level checks pass.”
                  </p>
                </div>

                {/* Three-Signal Fusion Pipeline (Notebook Breakdown) */}
                <div className="border-t border-b border-[#8fb0d4]/35 py-2 space-y-1">
                  <div className="font-type text-[9px] font-bold uppercase tracking-[0.16em] text-[#685f54] mb-1">
                    Three-Signal Fusion Pipeline
                  </div>
                  <div className="grid grid-cols-1 gap-1 text-[11px]">
                    <div className="flex items-baseline gap-2">
                      <span className="font-type text-[9.5px] font-bold text-[#1f4488] shrink-0">01.</span>
                      <span className="font-semibold text-[#1a1715] shrink-0">BERT Similarity</span>
                      <span className="font-hand text-[13px] text-[#5c5349] truncate">— meaning match vs. reference</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-type text-[9.5px] font-bold text-[#2f6b45] shrink-0">02.</span>
                      <span className="font-semibold text-[#1a1715] shrink-0">QA Factuality</span>
                      <span className="font-hand text-[13px] text-[#5c5349] truncate">— claim answerability from source</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-type text-[9.5px] font-bold text-[#b23a28] shrink-0">03.</span>
                      <span className="font-semibold text-[#1a1715] shrink-0">NLI Entailment</span>
                      <span className="font-hand text-[13px] text-[#5c5349] truncate">— textual support before clearing risk</span>
                    </div>
                  </div>
                </div>

                {/* Benchmark Metrics Strip */}
                <div className="grid grid-cols-4 divide-x divide-[#8fb0d4]/50 border border-[#8fb0d4]/50 bg-white/60 rounded-[2px] py-1.5 text-center font-type">
                  <div className="px-1">
                    <div className="text-[8.5px] uppercase text-[#685f54] font-bold">Precision</div>
                    <div className="text-[13.5px] font-black text-[#1f4488]">0.85</div>
                  </div>
                  <div className="px-1">
                    <div className="text-[8.5px] uppercase text-[#685f54] font-bold">Recall</div>
                    <div className="text-[13.5px] font-black text-[#1a1715]">0.75</div>
                  </div>
                  <div className="px-1">
                    <div className="text-[8.5px] uppercase text-[#685f54] font-bold">F1 Score</div>
                    <div className="text-[13.5px] font-black text-[#2f6b45]">0.80</div>
                  </div>
                  <div className="px-1">
                    <div className="text-[8.5px] uppercase text-[#685f54] font-bold">Catch-Rate</div>
                    <div className="text-[13.5px] font-black text-[#b23a28]">+22%</div>
                  </div>
                </div>

                {/* Action Links */}
                <div className="flex items-center gap-2.5 flex-wrap">
                  <a
                    href="https://ieeexplore.ieee.org/document/11441054"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleAudioClick}
                    className="inline-flex items-center gap-1.5 font-type text-[10.5px] font-bold text-[#1f4488] bg-[#8fb0d4]/25 hover:bg-[#8fb0d4]/40 border border-[#1f4488]/35 px-2.5 py-1 rounded-[2px] transition-colors"
                  >
                    <BookOpen className="size-3" />
                    <span>READ IEEE PAPER</span>
                    <ExternalLink className="size-2.5" />
                  </a>
                  <a
                    href="https://x.com/Moincrafted/status/2038219385077375293?s=20"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleAudioClick}
                    className="inline-flex items-center gap-1 font-type text-[10px] font-bold text-[#b23a28] hover:underline px-1 py-1"
                  >
                    <span>[ 𝕏 ANNOUNCEMENT ↗ ]</span>
                  </a>
                </div>

              </div>
            </div>

            {/* Looseleaf Bottom Margin Footer */}
            <div className="relative z-10 border-t border-[#8fb0d4]/45 px-4 sm:px-6 py-2.5 bg-[#f5efe1]/70 flex items-center justify-between gap-2 flex-wrap">
              <span className="font-hand text-[13px] text-[#685f54]">
                CNN/DailyMail &amp; XSum Benchmarks
              </span>
              <Link
                to="/evidence"
                onClick={handleAudioClick}
                className="font-type text-[10px] font-bold text-[#1f4488] hover:text-[#b23a28] hover:underline inline-flex items-center gap-1 transition-colors"
              >
                <span>READ ABSTRACT &amp; EVIDENCE</span>
                <ArrowUpRight className="size-3" />
              </Link>
            </div>
          </Paper>
        </div>

      </div>

      {/* ── HACKATHON WINS (LOOSELEAF INDEX CARDS) ── */}
      <div className="mt-12">
        <div className="relative flex items-end justify-between gap-4 mb-5 pb-3.5 border-b border-amber-200/20 flex-wrap">
          <div className="border-l-4 border-amber-300 pl-3.5 sm:pl-4">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 mb-2 rounded-xs bg-amber-300/15 border border-amber-300/35 text-amber-200 font-type text-[10px] font-bold uppercase tracking-[0.18em]">
              <Trophy className="size-3 text-amber-300 shrink-0" />
              <span>Competition Archive</span>
            </div>

            <h2 className="text-3xl sm:text-[36px] font-extrabold tracking-tight text-[#fbf8f1] leading-none drop-shadow-[0_2px_10px_rgba(0,0,0,0.35)] flex items-center gap-2.5 flex-wrap">
              <span>Hackathon</span>
              <span className="inline-block bg-amber-300 text-[#141210] font-hand font-bold text-[32px] sm:text-[38px] leading-none px-3 py-1 -rotate-1 rounded-xs border border-[#141210]/20 shadow-[3px_3px_0_rgba(0,0,0,0.35)]">
                Wins
              </span>
            </h2>

            <p className="mt-2.5 font-type text-[11.5px] text-[#e2ebe4]/90 tracking-wider">
              Verified national &amp; buildathon placements
            </p>
          </div>

          <Link
            to="/evidence"
            onClick={handleAudioClick}
            className="font-type text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#141210] bg-amber-200 hover:bg-amber-300 px-3 py-1.5 rounded-xs border border-[#141210]/20 shadow-[2px_2px_0_rgba(0,0,0,0.3)] inline-flex items-center gap-1.5 transition-all hover:-translate-y-0.5"
          >
            <span>View Full Evidence</span>
            <ArrowUpRight className="size-3.5" />
          </Link>
        </div>

        <Notebook
          binding="spiral"
          side="top"
          pages={2}
          tone="steel"
          rules="pad"
          tilt={-0.2}
          seed="hackathon-spiral-notebook"
          style={{ paddingTop: "28px", paddingBottom: "16px" }}
          className="relative w-full bg-[#fbf8f1] text-[#11100e] border border-[#dcd3c1] rounded-xs px-4 sm:px-6 shadow-[0_16px_38px_rgba(0,0,0,0.3)] overflow-visible"
        >
          {/* Washi Tape Corner Accents */}
          <Tape
            kind="washi-dots"
            color="tangerine"
            length={56}
            height={18}
            angle={-32}
            seed="nb-tape-bl"
            className="absolute -bottom-2 -left-4 z-20 hidden sm:block calm:hidden"
          />
          <Tape
            kind="washi-stripes"
            color="teal"
            length={56}
            height={18}
            angle={28}
            seed="nb-tape-tr"
            className="absolute top-2 -right-5 z-20 hidden sm:block calm:hidden"
          />
          <div className="pointer-events-none absolute -top-2 right-12 z-20 hidden sm:block calm:hidden">
            <BookmarkRibbon
              tone="tomato"
              tilt={2}
              seed="nb-bookmark-ribbon"
            />
          </div>

          {/* Compact Stamp & Medal Accent */}
          <div className="relative z-10 flex items-center justify-end gap-3 mb-3">
            <ConfettiTrigger
              count={38}
              spread={70}
              onClick={() => audioEngine.playClick()}
              title="Click to celebrate hackathon wins!"
              className="hidden sm:inline-flex items-center cursor-pointer transition-transform hover:-translate-y-0.5 active:translate-y-0 -my-2"
            >
              <Sticker
                name="first-place"
                size={40}
                peel
                seed="nb-header-medal"
                className="calm:hidden"
              />
            </ConfettiTrigger>
            <Stamp
              text="VERIFIED"
              sub="HIGHLIGHTS"
              shape="rect"
              ink="red"
              tilt={-3}
              w={92}
              h={34}
              seed="notebook-hack-summary-stamp"
            />
          </div>

          {/* Asymmetric Looseleaf Artifact Collage: IndexCard + StickyNote + Perforated Ticket */}
          <div className="relative z-10 space-y-4">
            {/* Row 1: Ruled IndexCard (7 cols) + Sunny StickyNote (5 cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
              {/* Win 1: Hermes x GrowthX — Warm Peach Paper Card with Pin & Index Rules */}
              <div className="lg:col-span-7 relative flex">
                <Tape
                  kind="washi-dots"
                  color="tangerine"
                  length={50}
                  height={15}
                  angle={-14}
                  seed="hermes-card-tape"
                  className="absolute -top-2 left-5 z-20 calm:hidden"
                />
                <Paper
                  stock="sticky-orange"
                  rules="index"
                  fastener="pin"
                  fastenerTone="tomato"
                  tilt={-0.5}
                  seed="win-hermes-peachcard"
                  style={{ maxWidth: "none", minHeight: 0, paddingTop: "16px", paddingBottom: "14px" }}
                  className="w-full px-5 flex flex-col justify-between gap-2.5 bg-[#fde5cc] border border-[#e0a370]/85 shadow-[0_12px_28px_rgba(26,23,21,0.16)] transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-[0_18px_36px_rgba(26,23,21,0.22)]"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center justify-center size-5 rounded-full bg-[#b23a28]/15 border border-[#b23a28]/40 font-type text-[10px] font-bold text-[#9c2b1b]">
                          01
                        </span>
                        <span className="font-type text-[10.5px] font-bold uppercase tracking-wider text-[#3f3830]">
                          2026 • BUILDATHON
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Sticker
                          name="party-popper"
                          size={34}
                          peel
                          seed="hermes-popper"
                          className="hidden sm:block calm:hidden -my-2"
                        />
                        <Stamp
                          text="WINNER"
                          sub="$5,800"
                          shape="rect"
                          ink="red"
                          tilt={-4}
                          w={76}
                          h={30}
                          seed="nb-hermes-stamp"
                        />
                      </div>
                    </div>

                    <h3 className="font-sans font-black text-[18px] sm:text-[19px] text-[#0f0e0c] leading-snug tracking-tight">
                      Hermes × GrowthX Buildathon
                    </h3>

                    <p className="font-sans text-[14.5px] sm:text-[15px] font-medium text-[#151311] leading-[1.55]">
                      Built{" "}
                      <Highlight tone="yellow" cover="under" seed="nb-hl-lazyclip" className="font-bold text-[#0f0e0c] px-0.5">
                        LazyClip.buzz
                      </Highlight>{" "}
                      in 8 hours, generated every demo live on stage, and reached{" "}
                      <Annotate type="brackets" color="blue" seed="nb-ann-signups" className="font-bold text-[#0f0e0c] px-1">
                        100+ signups
                      </Annotate>{" "}
                      in one day.
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#1a1715]/18 flex items-center justify-between gap-2 flex-wrap font-type text-[10.5px]">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[2px] bg-[#b23a28]/14 border border-[#b23a28]/35 font-bold text-[#8f2416]">
                      <span>$5,800 CREDITS</span>
                      <span className="opacity-45">•</span>
                      <span>8H SHIP</span>
                      <span className="opacity-45">•</span>
                      <span>100+ USERS</span>
                    </div>
                    <Link
                      to="/evidence"
                      onClick={handleAudioClick}
                      className="text-[#163a7a] hover:text-[#b23a28] hover:underline inline-flex items-center gap-0.5 font-bold"
                    >
                      <span>PROOF</span>
                      <ArrowUpRight className="size-3.5" />
                    </Link>
                  </div>
                </Paper>
              </div>

              {/* Win 2: PromptWars | Innerve 2026 — Taped Sunny StickyNote */}
              <div className="lg:col-span-5 relative flex">
                <Tape
                  kind="washi-stripes"
                  color="teal"
                  length={56}
                  height={16}
                  angle={3}
                  seed="promptwars-sticky-tape"
                  className="absolute -top-2 left-1/2 -translate-x-1/2 z-20 calm:hidden"
                />
                <StickyNote
                  color="green"
                  tilt={0.8}
                  seed="win-promptwars-sticky"
                  style={{ width: "100%", maxWidth: "none", minHeight: 0, paddingTop: "18px", paddingBottom: "14px" }}
                  className="px-5 flex flex-col justify-between gap-2.5 bg-[#dff2c8] border border-[#9fc472]/70 shadow-[0_12px_26px_rgba(26,23,21,0.12)] transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-[0_18px_36px_rgba(26,23,21,0.18)]"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="inline-flex items-center justify-center size-5 rounded-full bg-[#2f6b45]/18 border border-[#2f6b45]/40 font-type text-[10px] font-bold text-[#235435]">
                          02
                        </span>
                        <span className="font-type text-[10.5px] font-bold uppercase tracking-wider text-[#3a342c]">
                          MAR 2026 • IGDTUW
                        </span>
                      </div>
                      <Stamp
                        text="1ST PLACE"
                        sub="CHAMPION"
                        shape="rect"
                        ink="green"
                        tilt={3}
                        w={78}
                        h={30}
                        seed="nb-promptwars-stamp"
                      />
                    </div>

                    <h3 className="font-sans font-black text-[18px] sm:text-[19px] text-[#0f0e0c] leading-snug tracking-tight">
                      PromptWars | Innerve 2026
                    </h3>

                    <p className="font-sans text-[14.5px] sm:text-[15px] font-medium text-[#151311] leading-[1.55]">
                      Claimed 1st Place nationally by engineering{" "}
                      <Underline kind="single" tone="green" seed="nb-ul-devcation">
                        <span className="font-bold text-[#0f0e0c]">Devcation</span>
                      </Underline>{" "}
                      — an interactive suite for prompt chaining &amp; live code eval.
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#1a1715]/20 flex items-center justify-between gap-2 flex-wrap font-type text-[10.5px]">
                    <span className="px-2.5 py-0.5 rounded-[2px] bg-[#2f6b45]/15 border border-[#2f6b45]/35 font-bold text-[#1e4d30]">
                      1ST PLACE • NATIONAL ARENA
                    </span>
                    <Link
                      to="/evidence"
                      onClick={handleAudioClick}
                      className="text-[#163a7a] hover:text-[#b23a28] hover:underline inline-flex items-center gap-0.5 font-bold"
                    >
                      <span>PROOF</span>
                      <ArrowUpRight className="size-3.5" />
                    </Link>
                  </div>
                </StickyNote>
              </div>
            </div>

            {/* Row 2: Wide Perforated Ticket Stub (7 cols) + Sunny Yellow StickyNote (5 cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
              <div className="lg:col-span-7 relative flex">
                <Doodle
                  name="arrow-swoop"
                  size={42}
                  accent="sky"
                  rotate={18}
                  seed="paranox-arrow-doodle"
                  className="hidden md:block calm:hidden absolute -top-5 right-28 z-20 opacity-75"
                />
                <Ticket
                  stock="sticky-blue"
                  stub="end"
                  stubWidth={136}
                  punched
                  tilt={-0.25}
                  seed="win-paranox-ticket"
                  style={{ maxWidth: "none", width: "100%", minHeight: 0, "--ll-sticky-blue": "#e2f1fd" } as React.CSSProperties}
                  className="w-full bg-[#e2f1fd] border border-[#9fc8ed]/80 shadow-[0_12px_28px_rgba(26,23,21,0.15)] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(26,23,21,0.2)]"
                >
                  <TicketBody className="py-3.5 px-4 sm:px-5 bg-[#e2f1fd]/85">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="inline-flex items-center justify-center size-5 rounded-full bg-[#1f4488]/15 border border-[#1f4488]/40 font-type text-[10px] font-bold text-[#163a7a]">
                        03
                      </span>
                      <span className="font-type text-[10.5px] font-bold uppercase tracking-wider text-[#3f3830]">
                        NOV 2025 • NATIONAL HACKATHON • AUTOMATION TRACK
                      </span>
                    </div>
                    <h3 className="font-sans font-black text-[18px] sm:text-[19px] text-[#0f0e0c] leading-snug tracking-tight">
                      Paranox 2.0 Hackathon
                    </h3>
                    <p className="font-sans text-[14.5px] sm:text-[15px] font-medium text-[#151311] leading-[1.55] mt-1">
                      Qualified in the{" "}
                      <Circled tone="blue" shape="circle" seed="nb-circ-top10" className="px-1.5 py-0.5 font-bold text-[#0f0e0c]">
                        Top 10
                      </Circled>{" "}
                      national finalists (out of 200+ teams nationwide) for intelligent automation tracking platforms.
                    </p>
                  </TicketBody>

                  <TicketStub className="border-l border-dashed border-[#7aa8d6]/70 bg-[#d5ebfc]/75 px-3 py-2.5 gap-1.5">
                    <TicketNumber className="text-[10.5px] font-bold">
                      TOP 10 / 200+
                    </TicketNumber>
                    <Stamp
                      text="TOP 10"
                      sub="FINALIST"
                      shape="rect"
                      ink="ink-you"
                      tilt={-4}
                      w={82}
                      h={32}
                      seed="nb-paranox-stamp"
                    />
                    <Link
                      to="/evidence"
                      onClick={handleAudioClick}
                      className="font-type text-[10.5px] text-[#163a7a] hover:text-[#b23a28] hover:underline inline-flex items-center gap-0.5 font-bold"
                    >
                      <span>PROOF</span>
                      <ArrowUpRight className="size-3.5" />
                    </Link>
                  </TicketStub>
                </Ticket>
              </div>

              {/* Win 4: Syndicate by Maximor — Taped Sunny Yellow StickyNote */}
              <div className="lg:col-span-5 relative flex">
                <Tape
                  kind="washi-dots"
                  color="tangerine"
                  length={54}
                  height={16}
                  angle={-4}
                  seed="syndicate-sticky-tape"
                  className="absolute -top-2 left-1/2 -translate-x-1/2 z-20 calm:hidden"
                />
                <StickyNote
                  color="yellow"
                  tilt={0.6}
                  seed="win-syndicate-sticky"
                  style={{ width: "100%", maxWidth: "none", minHeight: 0, paddingTop: "18px", paddingBottom: "14px" }}
                  className="px-5 flex flex-col justify-between gap-2.5 bg-[#fef2b8] border border-[#e3ca62]/80 shadow-[0_12px_26px_rgba(26,23,21,0.12)] transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-[0_18px_36px_rgba(26,23,21,0.18)]"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="inline-flex items-center justify-center size-5 rounded-full bg-[#92580a]/15 border border-[#92580a]/40 font-type text-[10px] font-bold text-[#784605]">
                          04
                        </span>
                        <span className="font-type text-[10.5px] font-bold uppercase tracking-wider text-[#3a342c]">
                          HACKATHON WIN
                        </span>
                      </div>
                      <Stamp
                        text="WINNER"
                        sub="$100 GPU"
                        shape="rect"
                        ink="red"
                        tilt={3}
                        w={78}
                        h={30}
                        seed="nb-syndicate-stamp"
                      />
                    </div>

                    <h3 className="font-sans font-black text-[18px] sm:text-[19px] text-[#0f0e0c] leading-snug tracking-tight">
                      Syndicate by Maximor
                    </h3>

                    <p className="font-sans text-[14.5px] sm:text-[15px] font-medium text-[#151311] leading-[1.55]">
                      Won the Syndicate hackathon hosted by Maximor, earning{" "}
                      <Highlight tone="pink" cover="under" seed="nb-hl-syndicate" className="font-bold text-[#0f0e0c] px-0.5">
                        $100 GPU credits
                      </Highlight>
                      .
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#1a1715]/20 flex items-center justify-between gap-2 flex-wrap font-type text-[10.5px]">
                    <span className="px-2.5 py-0.5 rounded-[2px] bg-[#92580a]/15 border border-[#92580a]/35 font-bold text-[#6e3f04]">
                      $100 GPU CREDITS • MAXIMOR
                    </span>
                    <Link
                      to="/evidence"
                      onClick={handleAudioClick}
                      className="text-[#163a7a] hover:text-[#b23a28] hover:underline inline-flex items-center gap-0.5 font-bold"
                    >
                      <span>PROOF</span>
                      <ArrowUpRight className="size-3.5" />
                    </Link>
                  </div>
                </StickyNote>
              </div>
            </div>
          </div>

          {/* Notebook Bottom Margin Summary Bar */}
          <div className="relative z-10 mt-4 pt-2.5 border-t border-[#8fb0d4]/50 flex items-center justify-end gap-2 flex-wrap">
            <Link
              to="/evidence"
              onClick={handleAudioClick}
              className="font-type text-[10px] font-bold text-[#1f4488] hover:text-[#b23a28] hover:underline inline-flex items-center gap-1 transition-colors"
            >
              <span>INSPECT CERTIFICATES &amp; EVIDENCE</span>
              <ArrowUpRight className="size-3" />
            </Link>
          </div>
        </Notebook>
      </div>
    </section>
  );
}
