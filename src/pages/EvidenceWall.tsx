import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { PageTransition } from '../components/PageTransition';
import { ClassifiedStamp } from '../components/Stamps';
import { DailyBugle } from '../components/DailyBugle';
import { Highlight } from '../components/Highlight';
import { 
  Trophy, Medal, BookOpen, ExternalLink, X, HelpCircle, 
  Sparkles, Award, Pin as PinIcon, RefreshCw, FileText,
  Monitor, Music, Pause, Play, Film
} from 'lucide-react';
import { PdfViewer } from '../components/PdfViewer';
import { audioEngine } from '../lib/audio';
import { MUSIC_TRACKS, musicEngine } from '../lib/music';

interface NodeItem {
  id: string;
  type: 'subject' | 'project' | 'achievement' | 'sticky';
  label: string;
  title: string;
  desc: string;
  tech?: string;
  imageUrl?: string;
  pdfUrl?: string;
  links?: {
    x?: string;
    linkedin?: string;
    site?: string;
    ieee?: string;
  };
  width: number;
  height: number;
  rotation?: number;
  stickyColor?: 'yellow' | 'pink' | 'cyan';
  // Enhanced Dossier Info
  status?: string;
  codeName?: string;
  briefing?: string;
  technicalBreakdown?: string[];
  metrics?: string[];
  fieldNotes?: string;
  relatedEntities?: string[];
}

const INITIAL_NODES: NodeItem[] = [
  {
    id: 'subject',
    type: 'subject',
    label: 'SUBJECT PROFILE',
    title: 'MD MOIN AKHTAR',
    desc: 'AI Full-Stack Developer. Builds high-performance applications bridging machine learning pipelines with production-grade web systems.',
    imageUrl: '/portrait.jpg',
    width: 280,
    height: 340,
    rotation: -1.5,
    status: 'ACTIVE DEVELOPER / SYSTEM ARCHITECT',
    codeName: 'ARCHITECT-09',
    briefing: 'Welcome to Moin Akhtar\'s Evidence Wall. This board is designed as an interactive portfolio archive. Each card pinned to the corkboard represents a verified milestone, coding project, award, or certification achieved during his development career. Double-click any card to view detailed specifications, technical summaries, and logs.',
    technicalBreakdown: [
      'Orchestrated complex LLM interaction layers utilizing local state tracking and event-driven architectures.',
      'Designed fully-responsive micro-interaction layouts with hardware-accelerated CSS and Framer Motion.',
      'Spearheaded low-latency web layouts featuring retro terminals, hardware styling, and multi-threaded Web Workers.'
    ],
    metrics: [
      'Core clearance: Level 5 (EYES ONLY)',
      'Languages: TypeScript, Rust, Python, Go, Solidity',
      'Clearance Level: Max Operational Autonomy',
      'Active Stations: New Delhi Operations Core'
    ],
    fieldNotes: 'Subject exhibits intense focus during critical build sequences. Heavy ginger-cardamom chai dependency logged during late-night cycles (2300 - 0400 hours). Tends to optimize layout padding to pixel perfection.',
    relatedEntities: ['p-lazyclip', 'p-relay', 'p-upstart', 'p-devcation', 'a-ieee']
  },
  {
    id: 'p-lazyclip',
    type: 'project',
    label: 'OPERATION LAZYCLIP',
    title: 'LAZYCLIP.BUZZ',
    desc: 'Open-source natural-language video editor built in 8 hours. Generated 100+ signups on launch day.',
    tech: 'React, Node, ElevenLabs, OpenAI, Cloudflare',
    imageUrl: '/lazyclip.buzz mock.png',
    links: {
      site: 'https://lazyclip.buzz',
      x: 'https://lnkd.in/g-hDZPUq',
      linkedin: 'https://www.linkedin.com/posts/mdmoinakhtar_we-won-the-growthx-buildathon-%F0%9D%9F%B1%F0%9D%9F%B4%F0%9D%9F%AC%F0%9D%9F%AC-ugcPost-7482699137520513025-Rubs/'
    },
    width: 250,
    height: 285,
    rotation: 2.2,
    status: 'DEPLOYED / SUCCESSFUL OUTPOST',
    codeName: 'PROJECT LAZYCLIP',
    briefing: 'An open-source video editor that allows users to edit video files by simply typing text instructions (for example, deleting a sentence from the transcription). Created and launched in under 8 hours for a global buildathon.',
    technicalBreakdown: [
      'Integrated ElevenLabs speech synthesis with OpenAI whisper models for real-time text-to-voice transcription.',
      'Implemented serverless workflow orchestration on Cloudflare Workers and Node.js backend middleware.',
      'Designed state management in React for fluid, multi-track timeline visualization and real-time previews.'
    ],
    metrics: [
      'Growth Hackathon: 1st Place Win',
      'Signups: 100+ active users in first 24 hours of public release',
      'Build Time: Exactly 8 hours from ideation to production deploy',
      'Revenue Potential: High-density interest registered from creator economy'
    ],
    fieldNotes: 'An outstanding sprint of rapid prototyping. The speed of execution surprised global competition. Recommending further investment into AI audio/video sync loops.',
    relatedEntities: ['subject', 'a-hermes']
  },
  {
    id: 'p-relay',
    type: 'project',
    label: 'OPERATION RELAY',
    title: 'RELAY VAULT',
    desc: 'Decentralized agent negotiation & escrow coordination platform built on Monad Testnet.',
    tech: 'Solidity, Smart Contracts, AI Agents, Ethers.js',
    imageUrl: '/RelayVault landing page.png',
    links: {
      site: 'https://github.com/MDMOINAKHTARR/Relay_Vault'
    },
    width: 250,
    height: 285,
    rotation: -2.8,
    status: 'TESTNET ACTIVE / SECURITY REVIEW',
    codeName: 'OPERATION RELAY',
    briefing: 'A secure decentralized vault built on the Monad blockchain testnet. It allows automated programs (AI agents) to securely transfer and lock financial resources during negotiations without needing human intervention.',
    technicalBreakdown: [
      'Wrote secure Solidity smart contracts managing state machines for multi-signature escrow triggers.',
      'Engineered client-side agent integration layers using Ethers.js and asynchronous polling loops.',
      'Configured high-performance Web3 connection brokers to handle Monad\'s 10,000+ transaction per second throughput.'
    ],
    metrics: [
      'Blockchain Engine: Monad EVM Testnet Core',
      'Transaction Latency: < 1.2 seconds end-to-end',
      'Escrow Integrity: 100% security coverage in unit simulation suites',
      'Agent Compatibility: Multi-standard web agents (OpenAI, Anthropic)'
    ],
    fieldNotes: 'Pushes the boundaries of decentralized autonomous agent economies. A critical component in the machine-to-machine financial infrastructure layer.',
    relatedEntities: ['subject']
  },
  {
    id: 'p-upstart',
    type: 'project',
    label: 'OPERATION UPSTART',
    title: 'UPSTART BLUEPRINT',
    desc: 'AI tool generating validated startup roadmaps from ideas. Employs Google GenAI and Trends API.',
    tech: 'Next.js, SQLite, Gemini API',
    imageUrl: '/upstart-mockup.png',
    links: {
      site: 'https://github.com/MDMOINAKHTARR'
    },
    width: 250,
    height: 285,
    rotation: 1.4,
    status: 'ACTIVE DEVELOPMENT / PROTOTYPE V2',
    codeName: 'PROJECT UPSTART',
    briefing: 'An intelligent planning tool that takes startup business ideas and automatically generates complete development roadmaps, competitor analysis, suggested tech stacks, and step-by-step launch plans.',
    technicalBreakdown: [
      'Utilized Gemini Pro API for high-context structured JSON generation representing complete milestone timelines.',
      'Implemented client-side caching with SQLite and IndexedDB to ensure zero-latency offline plan editing.',
      'Integrated real-time search trends API to fetch live competitor keywords and validate market demand.'
    ],
    metrics: [
      'Generation Speed: < 4 seconds for full multi-page blueprint',
      'Validation Accuracy: 92% user satisfaction score on initial cohort',
      'Data Points Indexed: 10k+ API specifications and market guides'
    ],
    fieldNotes: 'Simplifies the complex task of initial ideation and technical planning. Designed to decrease failure rates of early stage builders by highlighting existing dependencies.',
    relatedEntities: ['subject']
  },
  {
    id: 'p-devcation',
    type: 'project',
    label: 'OPERATION DEVCATION',
    title: 'DEVCATION EVENT',
    desc: 'Matter.js physics-based dynamic event dashboard. Placed 1st at PromptWars hackathon.',
    tech: 'Next.js 15, Matter.js, physics engine',
    imageUrl: '/devacation-mockup.jpg',
    width: 250,
    height: 285,
    rotation: -1.6,
    status: 'COMPLETED / RECON FORWARDED',
    codeName: 'OPERATION DEVCATION',
    briefing: 'An interactive developer event dashboard utilizing dynamic 2D physics. Users can drag, drop, throw, and play with the elements on the screen, creating an engaging and playful layout for tutorial events.',
    technicalBreakdown: [
      'Orchestrated interactive 2D physics world with Matter.js, mapping DOM nodes to canvas rigid bodies.',
      'Connected React components state to the physics engine loops to update UI position dynamically.',
      'Optimized mobile render performance by throttling canvas repaint events and using CSS transforms.'
    ],
    metrics: [
      'Physics Bodies: 50+ simultaneous interactive elements',
      'Render Frame Rate: Solid 60 FPS on high-density mobile screens',
      'Hackathon Standing: Placed 1st at PromptWars 2026'
    ],
    fieldNotes: 'An incredibly immersive interface that bridges visual whimsy with real analytical performance. The physics engine logic is a standout technical showcase.',
    relatedEntities: ['subject', 'a-promptwars']
  },
  {
    id: 'a-hermes',
    type: 'achievement',
    label: 'MISSION ARCHIVE',
    title: 'HERMES HACKATHON',
    desc: 'Placed 1st out of global teams at the Hermes x GrowthX Buildathon. Winner credits of $5,800.',
    imageUrl: '/hermeswin2-optimized.jpg',
    links: {
      x: 'https://lnkd.in/g-hDZPUq',
      linkedin: 'https://www.linkedin.com/posts/mdmoinakhtar_we-won-the-growthx-buildathon-%F0%9D%9F%B1%F0%9D%9F%B4%F0%9D%9F%AC%F0%9D%9F%AC-ugcPost-7482699137520513025-Rubs/'
    },
    width: 240,
    height: 240,
    rotation: 3.1,
    status: 'AWARDS CONCLUDED / GOLD REGISTERED',
    codeName: 'MISSION HERMES',
    briefing: 'First place victory at the prestigious Hermes x GrowthX Buildathon. Global teams competed to build high-growth potential software utilities under strict time parameters.',
    technicalBreakdown: [
      'Designed initial system blueprint and frontend core for the winning video-editing platform LazyClip.',
      'Implemented real-time speech processing and ElevenLabs audio generation pipelines under extreme pressure.',
      'Presented live system demonstration to an elite panel of GrowthX judges and venture partners.'
    ],
    metrics: [
      'Hackathon Standing: 1st Place (Winner out of global dev squads)',
      'Prize Credits Allocated: $5,800 in developer API credits and serverless infra',
      'Launch Success: Generated 100+ organic user signups within 24 hours of presentation'
    ],
    fieldNotes: 'Demonstrated exceptional team leadership and engineering speed under a direct 24-hour sprint. The prototype was lauded for both design appeal and actual functional depth.',
    relatedEntities: ['subject', 'p-lazyclip']
  },
  {
    id: 'a-promptwars',
    type: 'achievement',
    label: 'MISSION ARCHIVE',
    title: 'PROMPTWARS 1ST PLACE',
    desc: 'Won 1st prize at IGDTUW PromptWars 2026. Featured prompt templates & Devcation playground.',
    imageUrl: 'https://plain-apac-prod-public.komododecks.com/202606/08/UetCU2yFfO1yPU1VnGh7/image.jpg',
    pdfUrl: '/Team%20Kaizenn.pdf',
    links: {
      x: 'https://x.com/___moinn_/status/2034662071808508329?s=20',
      linkedin: 'https://www.linkedin.com/posts/mdmoinakhtar_promptengineering-promptwars-innerve2026-ugcPost-7440279761559576576-iRby/'
    },
    width: 240,
    height: 240,
    rotation: -2.4,
    status: 'MISSION SUCCESS / TROPHY SECURED',
    codeName: 'MISSION PROMPTWARS',
    briefing: 'Won 1st prize at the IGDTUW PromptWars 2026. The hackathon challenged developers to engineer robust prompt templates and interactive applications using generative AI API orchestration.',
    technicalBreakdown: [
      'Developed state-of-the-art system prompts targeting LLM instruction consistency and formatting constraints.',
      'Built the Devcation physical canvas dashboard within a compressed time frame to serve as the project interface.',
      'Analyzed model responses to prevent token drift and structure output schemas using JSON schema validation.'
    ],
    metrics: [
      'Hackathon Standing: 1st Place Champion',
      'Event Date: Innerve Hackathon Series 2026',
      'Target Frameworks: Gemini API, Matter.js Physics Engine'
    ],
    fieldNotes: 'Strong showing of advanced prompt-engineering capabilities combined with stellar UI presentation. The combination of physics and AI generated strong interest from organizers.',
    relatedEntities: ['subject', 'p-devcation']
  },
  {
    id: 'a-ieee',
    type: 'achievement',
    label: 'PUBLICATION RECORD',
    title: 'IEEE RESEARCH PAPER',
    desc: 'Published paper proposing a Sentence-Level Risk Estimator to detect hallucinations in LLM outputs.',
    tech: 'BERT Similarity, QA Factuality, NLI Entailment',
    links: {
      ieee: 'https://ieeexplore.ieee.org/document/11441054',
      x: 'https://x.com/___moinn_/status/2038219385077375293?s=20',
      linkedin: 'https://www.linkedin.com/posts/mdmoinakhtar_ai-machinelearning-generativeai-share-7444005556559794176-z_Ot/'
    },
    width: 280,
    height: 195,
    rotation: 1.8,
    status: 'PUBLISHED / CANONICAL RECORD',
    codeName: 'RESEARCH RECORD // IEEE-1144',
    briefing: 'Published scientific paper titled "A Sentence-Level Risk Estimator for Identifying Hallucinations in Generative AI". Proposes a novel metric pipeline to prevent factual failures in AI.',
    technicalBreakdown: [
      'Formulated a mathematical model combining semantic embedding drift (BERT) with Factuality Risk Scoring.',
      'Designed entailment matrices comparing source context against generated response sentences.',
      'Validated performance on custom benchmarks, achieving a 22% improvement in hallucination catch rate.'
    ],
    metrics: [
      'Publisher: IEEE Xplore Digital Library',
      'Conference: International Conference on AI-Driven Smart Systems & Ubiquitous Computing (ICAUC), 2026',
      'Primary Research Focus: Hallucination mitigation in LLM pipelines'
    ],
    fieldNotes: 'Critical reference material for agent-based pipelines. The proposed sentence-level risk estimator is being evaluated for inclusion in the portfolio\'s core reasoning engine.',
    relatedEntities: ['subject', 's-warn']
  },
  {
    id: 's-chai',
    type: 'sticky',
    label: 'MEMO: CHAI PROTOCOL',
    title: 'TEA CONFIGURATION',
    desc: 'Ginger-cardamom brew level: CRITICAL. Deploy fresh honey infusion before mainnet commits.',
    width: 190,
    height: 190,
    rotation: -3.5,
    stickyColor: 'yellow',
    status: 'MEMO FILE // LOGGED',
    codeName: 'MEMO CHAI',
    briefing: 'Internal operational guidelines regarding Moin\'s ginger-cardamom tea configuration. Crucial for developer focus.',
    technicalBreakdown: [
      'Cardamom pods: 3 crushed, boiled during initial water heating cycle.',
      'Ginger: 1-inch fresh root, grated to maximize flavor extraction.',
      'Milk ratio: 1:3 ratio with water, boiled twice to create a rich texture.'
    ],
    metrics: [
      'Brew Time: Exactly 7 minutes',
      'Consumption Rate: 2-3 cups per high-intensity build cycle',
      'Sugar Tolerance: Redacted / Logged as low'
    ],
    fieldNotes: 'Essential for maintaining peak logical synthesis speed. If chai supply drops, debug latency increases by up to 40%.',
    relatedEntities: ['subject']
  },
  {
    id: 's-intel',
    type: 'sticky',
    label: 'INTELLIGENCE MEMO',
    title: 'HUMAN INTERCEPTS',
    desc: 'Clearance Level 5 verified: Access Moin\'s top tracks, setup specs, and book stack inside Classified file.',
    width: 190,
    height: 190,
    rotation: 4.2,
    stickyColor: 'pink',
    status: 'MEMO FILE // LOGGED',
    codeName: 'MEMO INTEL',
    briefing: 'Internal intelligence intercepts regarding personal characteristics. Detail includes workstation preferences and music intercepts.',
    technicalBreakdown: [
      'Mechanical Keyboard: Custom-lubed linear switches (sound dampening foam installed).',
      'Preferred Audio: Post Malone, David Bowie, and Hans Zimmer (Interstellar soundtrack).',
      'Reading Stack: High-density books covering distributed systems and API interface architecture.'
    ],
    metrics: [
      'Workstation Station: New Delhi Base',
      'Preferred Lights: Warm 3000K LED spots',
      'Clearance Level: Max (Level 5 Eyes Only)'
    ],
    fieldNotes: 'Subject tends to block out distractions by playing the Starman audio intercept on repeat during deployment stages.',
    relatedEntities: ['subject']
  },
  {
    id: 's-warn',
    type: 'sticky',
    label: 'THREAT WARNING',
    title: 'HALLUCINATIONS',
    desc: 'Sentence-Level Risk Estimator successfully deployed to filter LLM logic failures. Reference IEEE paper.',
    width: 190,
    height: 190,
    rotation: -2.0,
    stickyColor: 'cyan',
    status: 'MEMO FILE // WARNING',
    codeName: 'MEMO WARN',
    briefing: 'Intelligence warning regarding AI hallucination vectors and defensive framework mitigations.',
    technicalBreakdown: [
      'Hallucination vector: Context window drift during prolonged conversational loops.',
      'Mitigation: Implement real-time sentence risk scores before outsourcing response buffer.',
      'Reference: IEEE-1144 publication on factuality entailment checking.'
    ],
    metrics: [
      'Risk Rating: CRITICAL without estimator',
      'Defensive Deployed: Factuality Entailment',
      'Target Frameworks: LangChain, custom agent loops'
    ],
    fieldNotes: 'Crucial defense. The paper\'s mathematical pipeline has been integrated into the portfolio\'s mock server endpoints to validate input consistency.',
    relatedEntities: ['subject', 'a-ieee']
  }
];

const CONNECTIONS = [
  { from: 'subject', to: 'p-lazyclip' },
  { from: 'subject', to: 'p-relay' },
  { from: 'subject', to: 'p-upstart' },
  { from: 'subject', to: 'p-devcation' },
  { from: 'subject', to: 'a-ieee' },
  { from: 'a-hermes', to: 'p-lazyclip' },
  { from: 'a-promptwars', to: 'p-devcation' }
];

const Pin = () => (
  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center pointer-events-none">
    <div className="w-3.5 h-3.5 rounded-full bg-rose-600 shadow-[0_2px_4px_rgba(0,0,0,0.5),inset_-1px_-1px_3px_rgba(0,0,0,0.5),inset_1px_1px_3px_rgba(255,255,255,0.7)]" />
    <div className="w-1 h-3.5 bg-neutral-900/40 -mt-1 blur-[1px] rotate-[15deg] transform origin-top" />
  </div>
);

const Tape = ({ rotate = 0 }: { rotate?: number }) => (
  <div 
    className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-20 h-5 bg-[#eae4d3]/70 border-x border-[#c4ba9c]/40 shadow-xs backdrop-blur-xs select-none pointer-events-none mix-blend-multiply opacity-80 z-30"
    style={{
      transform: `rotate(${rotate}deg)`,
      backgroundImage: 'radial-gradient(rgba(0,0,0,0.02) 0.5px, transparent 0.5px)',
      backgroundSize: '3px 3px',
      clipPath: 'polygon(0% 12%, 8% 2%, 18% 10%, 25% 1%, 38% 9%, 47% 0%, 58% 8%, 68% 1%, 82% 10%, 91% 2%, 100% 12%, 98% 88%, 89% 98%, 80% 90%, 68% 99%, 55% 91%, 43% 100%, 30% 90%, 22% 98%, 11% 89%, 0% 97%)'
    }}
  />
);

const NODE_OFFSETS: Record<string, { x: number; y: number }> = {
  subject: { x: 660, y: 330 },
  'p-lazyclip': { x: 160, y: 40 },
  'p-relay': { x: 120, y: 680 },
  'p-upstart': { x: 1190, y: 40 },
  'p-devcation': { x: 1230, y: 680 },
  'a-hermes': { x: 40, y: 360 },
  'a-promptwars': { x: 1320, y: 360 },
  'a-ieee': { x: 660, y: 40 },
  's-chai': { x: 440, y: 40 },
  's-intel': { x: 980, y: 680 },
  's-warn': { x: 440, y: 680 }
};

export function EvidenceWall() {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [flippedNodeId, setFlippedNodeId] = useState<string | null>(null);
  const [showPubDetails, setShowPubDetails] = useState(false);
  const [activePdf, setActivePdf] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const boardRef = useRef<HTMLDivElement>(null);
  
  // Tab control state for high-density side drawer
  const [activeTab, setActiveTab] = useState<'overview' | 'tech' | 'metrics' | 'notes'>('overview');
  
  // Simulated decryption matrix state
  const [decryptProgress, setDecryptProgress] = useState(15);
  const [decryptStatus, setDecryptStatus] = useState('ANALYZING...');

  // Audio state synchronized with the global musicEngine
  const [playbackState, setPlaybackState] = useState({
    isPlaying: false,
    trackIndex: 0
  });

  useEffect(() => {
    return musicEngine.subscribe((snapshot) => {
      setPlaybackState({
        isPlaying: snapshot.isPlaying,
        trackIndex: snapshot.trackIndex
      });
    });
  }, []);

  // Simulating live decryption timeline when Tech specs is opened
  useEffect(() => {
    if (activeTab === 'tech' && selectedNodeId) {
      setDecryptProgress(15);
      setDecryptStatus('ANALYZING SIGNATURES...');
      const interval = setInterval(() => {
        setDecryptProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setDecryptStatus('DECRYPTION COMPLETE // TARGET RECON OK');
            return 100;
          }
          const next = prev + Math.floor(Math.random() * 12) + 4;
          const capped = Math.min(next, 100);
          if (capped === 100) {
            clearInterval(interval);
            setDecryptStatus('DECRYPTION COMPLETE // TARGET RECON OK');
          } else if (capped > 75) {
            setDecryptStatus('DECRYPTING CORRELATION MATRIX...');
          } else if (capped > 45) {
            setDecryptStatus('RESOLVING SYMBOLIC ABSTRACTS...');
          } else if (capped > 30) {
            setDecryptStatus('EXTRACTING HEURISTICS...');
          }
          return capped;
        });
      }, 350);
      return () => clearInterval(interval);
    }
  }, [activeTab, selectedNodeId]);

  // Whenever selectedNodeId changes, default tab back to overview and toggle body class for Exit button slide
  useEffect(() => {
    if (selectedNodeId) {
      setActiveTab('overview');
      document.body.classList.add('details-drawer-open');
    } else {
      document.body.classList.remove('details-drawer-open');
    }
    return () => {
      document.body.classList.remove('details-drawer-open');
    };
  }, [selectedNodeId]);

  // Resize listener to fit desktop board on medium and small viewports smoothly
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      if (width < 640) {
        // Mobile view: set a fixed readable scale, let scrollbar handle exploration
        setScale(0.52);
      } else {
        // Desktop/Tablet view: dynamically scale to fit window dimensions exactly
        const isDrawerOpen = !!selectedNodeId;
        const hasLeftPanel = width >= 1280; // xl screens
        const leftPanelWidth = hasLeftPanel ? 280 : 0;
        const availableWidth = isDrawerOpen 
          ? (width - 550 - leftPanelWidth - 48) 
          : (width - leftPanelWidth - 64);
        const widthScale = availableWidth / 1620;
        const heightScale = (height - 32) / 1020; // 32px top margin (no top header)
        let newScale = Math.min(widthScale, heightScale);
        newScale = Math.max(isDrawerOpen ? 0.52 : 0.65, Math.min(newScale, 1.05)); // Allow scale down to 0.52 with open drawer
        setScale(newScale);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [selectedNodeId]);

  const handleCardClick = (id: string) => {
    const node = INITIAL_NODES.find(n => n.id === id);
    if (!node) return;
    
    audioEngine.init();
    audioEngine.playClick();
    
    if (selectedNodeId) {
      // Side-drawer/sidebar is active
      if (selectedNodeId === id) {
        // Clicking the currently inspected node closes the sidebar
        setSelectedNodeId(null);
      } else {
        // Clicking another node updates the inspected node
        setSelectedNodeId(id);
      }
    } else {
      // Sidebar is closed
      if (node.type === 'sticky') {
        setSelectedNodeId(id);
      } else {
        // Toggle flip state for regular card
        setFlippedNodeId(prev => (prev === id ? null : id));
      }
    }
  };

  const activeNodeId = hoveredNodeId || selectedNodeId || 'subject';
  const selectedNode = INITIAL_NODES.find(n => n.id === selectedNodeId);

  return (
    <PageTransition className="relative h-full w-full bg-texture select-none flex flex-row items-stretch overflow-hidden">
      {/* Return to Awards Button */}
      <Link
        to="/evidence"
        onClick={() => {
          audioEngine.init();
          audioEngine.playClick();
        }}
        className="fixed top-3 right-4 z-50 inline-flex items-center gap-1.5 border border-stone-950 bg-stone-950 px-2.5 py-1 font-mono text-[9px] font-black text-amber-200 shadow-md hover:bg-rose-700 hover:text-white transition-colors"
      >
        <span>➔ RETURN TO AWARDS DOSSIER</span>
      </Link>

      {/* LEFT SIDEBAR — Daily Bugle */}
      <DailyBugle />

      {/* Main Board Container */}
      <div className="flex-1 h-full flex flex-col items-center justify-between py-1 relative overflow-hidden">
        {/* Simple Typewriter header for mobile/tablet screens (< xl) */}
        <div className="xl:hidden z-40 w-full px-6 py-2 shrink-0 select-none border-b border-ink/10 flex flex-col sm:flex-row items-center justify-between gap-1 text-ink/80">
          <div className="flex items-center gap-2 font-mono text-[10px]">
            <div className="w-2 h-2 rounded-full bg-emerald-700 animate-pulse" />
            <span className="font-bold tracking-widest uppercase text-ink">
              EVIDENCE WALL // CASE: RECON_26
            </span>
          </div>
          <div className="flex items-center gap-2.5 font-mono text-[9px]">
            <span className="text-ink/65 uppercase">
              🖱 Dbl-click to open file
            </span>
            <span className="bg-rose-900/10 text-rose-900 px-1.5 py-0.5 rounded font-black border border-rose-900/25 text-[8px]">
              CONNECTED
            </span>
          </div>
        </div>

        {/* RESPONSIVE SCROLLABLE BOARD VIEW */}
        <div 
          className="flex-1 w-full max-w-full overflow-x-auto overflow-y-hidden px-4 flex justify-start sm:justify-center items-start sm:items-center scrollbar-none"
        >
        <div 
          style={{ 
            width: 1600 * scale, 
            height: 1000 * scale,
          }} 
          className="relative shrink-0 flex items-center justify-center"
        >
          <motion.div 
            ref={boardRef}
            initial={{ opacity: 0, scale: scale * 0.95, y: 15 }}
            animate={{ 
              opacity: 1,
              scale: selectedNodeId ? scale * 0.90 : scale, 
              x: selectedNodeId ? -160 * scale : 0, 
              y: 0 
            }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="absolute w-[1600px] h-[1000px] rounded-lg border-[14px] border-amber-950 bg-[#88624a] shadow-[0_20px_50px_rgba(0,0,0,0.85),inset_0_0_100px_rgba(0,0,0,0.55)] overflow-hidden"
            style={{
              transformOrigin: 'center center',
              backgroundImage: `
                radial-gradient(circle at 50% 50%, rgba(255,255,255,0.06) 1px, transparent 1px),
                radial-gradient(circle at 0 0, rgba(0,0,0,0.15) 1.5px, transparent 1.5px)
              `,
              backgroundSize: '8px 8px, 16px 16px'
            }}
          >
            {/* Cork Board Wood Trim shadow overlay */}
            <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_30px_rgba(0,0,0,0.8)] z-15" />

            {/* Background Board Dividers & Chalk Markings */}
            <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0 opacity-45">
              {/* Vertical Divider Line 1 */}
              <div className="absolute left-[560px] top-0 bottom-0 border-l border-dashed border-amber-950/20" />
              {/* Vertical Divider Line 2 */}
              <div className="absolute left-[1020px] top-0 bottom-0 border-l border-dashed border-amber-950/20" />

              {/* Horizontal margin rule at top — like a ruled notepad */}
              <div className="absolute top-[60px] left-0 right-0 border-t border-amber-950/10" />
              {/* Horizontal margin rule at bottom */}
              <div className="absolute bottom-[60px] left-0 right-0 border-t border-amber-950/10" />

              {/* Sector Labels */}
              <div className="absolute left-6 top-6 text-amber-950/25 font-stamp text-base tracking-wider font-black uppercase">
                [ REGION 01: PROJECTS ]
              </div>
              <div className="absolute left-6 bottom-6 text-amber-950/20 font-mono text-[10px] font-bold uppercase tracking-widest">
                SYS_DEV_LOG // LAUNCHED_SERVICES
              </div>

              <div className="absolute left-[580px] top-6 text-amber-950/30 font-stamp text-base tracking-wider font-black uppercase">
                [ CENTRAL: MAIN SUBJECT ]
              </div>
              <div className="absolute left-[580px] bottom-6 text-amber-950/20 font-mono text-[10px] font-bold uppercase tracking-widest text-center w-[420px]">
                // ACCESS CLEARANCE: SECURE //
              </div>

              <div className="absolute left-[1040px] top-6 text-amber-950/25 font-stamp text-base tracking-wider font-black uppercase">
                [ REGION 02: AWARDS & CERTS ]
              </div>
              <div className="absolute left-[1040px] bottom-6 text-amber-950/20 font-mono text-[10px] font-bold uppercase tracking-widest">
                FIELD_RECON // VERIFIED_RECORDS
              </div>

              {/* Coffee ring stains */}
              <div className="absolute left-[140px] top-[460px] w-24 h-24 rounded-full border-[3px] border-amber-900/10 rotate-[-15deg] flex items-center justify-center">
                <span className="font-mono text-[8px] text-amber-900/15 font-black uppercase tracking-widest">STATION LOG</span>
              </div>
              <div className="absolute right-[440px] top-[140px] w-32 h-32 rounded-full border-4 border-amber-900/10 rotate-[45deg]" />

              {/* Chalk arrows */}
              <div className="absolute left-[505px] top-[370px] text-rose-900/20 font-mono text-xs font-black uppercase tracking-widest select-none">
                {"TARGET ──>"}
              </div>
              <div className="absolute left-[1040px] top-[260px] text-rose-900/20 font-mono text-xs font-black uppercase tracking-widest select-none">
                {"<── INTEL FILE"}
              </div>

              {/* Handwritten annotation — faint, between sections */}
              <div className="absolute left-[555px] top-[490px] text-amber-950/15 font-mono text-[9px] font-bold uppercase tracking-widest rotate-[-90deg] origin-left select-none whitespace-nowrap">
                SECTION BOUNDARY — CLASSIFIED
              </div>
              <div className="absolute left-[1015px] top-[490px] text-amber-950/15 font-mono text-[9px] font-bold uppercase tracking-widest rotate-[-90deg] origin-left select-none whitespace-nowrap">
                SECTION BOUNDARY — CLASSIFIED
              </div>

              {/* MISSION STATUS angled stamp — top right area */}
              <div className="absolute right-[80px] top-[70px] border-[3px] border-rose-900/25 px-4 py-1.5 rotate-[-8deg] select-none">
                <div className="text-[11px] font-stamp font-black text-rose-900/30 tracking-[0.3em] uppercase leading-tight text-center">
                  MISSION<br/>ACTIVE
                </div>
              </div>

              {/* Compass rose — bottom left corner */}
              <div className="absolute left-[32px] bottom-[80px] w-14 h-14 flex items-center justify-center select-none opacity-30">
                <div className="relative w-full h-full">
                  {/* Compass ring */}
                  <div className="absolute inset-0 rounded-full border border-amber-950/40" />
                  {/* N/S/E/W */}
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 text-[7px] font-black font-mono text-amber-950/70 -translate-y-0.5">N</span>
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[7px] font-black font-mono text-amber-950/70 translate-y-0.5">S</span>
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 text-[7px] font-black font-mono text-amber-950/70 -translate-x-0.5">W</span>
                  <span className="absolute right-0 top-1/2 -translate-y-1/2 text-[7px] font-black font-mono text-amber-950/70 translate-x-0.5">E</span>
                  {/* Cross hairs */}
                  <div className="absolute top-1/2 left-2 right-2 border-t border-amber-950/40 -translate-y-px" />
                  <div className="absolute left-1/2 top-2 bottom-2 border-l border-amber-950/40 -translate-x-px" />
                  {/* Center dot */}
                  <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-amber-900/50 rounded-full -translate-x-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Grid coordinates and location label */}
              <div className="absolute left-1/2 -translate-x-1/2 bottom-2 text-amber-950/15 font-mono text-[9px] tracking-widest font-black uppercase">
                LAT_COORDS: 28.6139° N, 77.2090° E // STATION_NEW_DELHI
              </div>

              {/* Caution tape — top-left corner */}
              <div className="absolute top-0 left-0 w-36 h-8 bg-[#fbbf24] border-b-2 border-black/35 transform rotate-[-45deg] -translate-x-12 -translate-y-4 flex items-center justify-center gap-1 select-none pointer-events-none opacity-75 overflow-hidden z-15 shadow-sm">
                <div className="w-1.5 h-16 bg-black transform rotate-[30deg] shrink-0" />
                <div className="w-1.5 h-16 bg-black transform rotate-[30deg] shrink-0" />
                <div className="w-1.5 h-16 bg-black transform rotate-[30deg] shrink-0" />
                <div className="w-1.5 h-16 bg-black transform rotate-[30deg] shrink-0" />
                <div className="w-1.5 h-16 bg-black transform rotate-[30deg] shrink-0" />
              </div>

              {/* Pinned memo scrap — bottom-right */}
              <div className="absolute right-[50px] bottom-[80px] w-48 h-[120px] bg-[#faf7eb] border border-ink/20 shadow-lg transform rotate-[4deg] p-3.5 font-mono text-[9px] text-ink/80 leading-normal select-none pointer-events-none z-15">
                {/* Red pushpin */}
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 flex flex-col items-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-600 shadow-[0_1px_3px_rgba(0,0,0,0.4)]" />
                  <div className="w-0.5 h-2 bg-neutral-900/40 -mt-0.5" />
                </div>
                <div className="border-b border-dashed border-ink/15 pb-1 mb-1.5 font-bold text-[8px] text-rose-800 uppercase tracking-wider">
                  Portfolio Summary
                </div>
                <p className="text-[8.5px] leading-relaxed">All 11 records verified. Projects, awards, and certifications confirmed active.</p>
                <div className="mt-2 text-right text-[7.5px] font-bold text-ink/35 tracking-widest">MMA · 2026</div>
              </div>

              {/* Second sticky note — top center-right, pinned with yellow pin */}
              <div className="absolute right-[310px] top-[75px] w-36 bg-[#fefce8] border border-yellow-300/60 shadow-md transform rotate-[-3deg] p-3 font-mono text-[9px] text-ink/75 leading-normal select-none pointer-events-none z-15">
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 flex flex-col items-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 shadow-[0_1px_3px_rgba(0,0,0,0.3)]" />
                  <div className="w-0.5 h-2 bg-neutral-900/30 -mt-0.5" />
                </div>
                <div className="font-black text-[8px] text-yellow-700 uppercase tracking-wider mb-1 border-b border-yellow-200 pb-1">Quick Note</div>
                <p className="text-[8.5px] leading-relaxed">Click any card on the board to read more about it.</p>
              </div>
            </div>

            {/* Spider-Man handwritten courtesy note — bottom-center, clear of other notes */}
            <div
              className="absolute w-[152px] bg-white shadow-[4px_6px_22px_rgba(0,0,0,0.45)] transform rotate-[2.5deg] select-none pointer-events-none"
              style={{ padding: '20px 18px 16px', zIndex: 25, left: '680px', bottom: '88px' }}
            >
              {/* Red pushpin */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex flex-col items-center">
                <div className="w-3.5 h-3.5 rounded-full bg-rose-600 shadow-[0_2px_6px_rgba(180,0,0,0.55)]" />
                <div className="w-[2px] h-3 bg-neutral-900/50 -mt-0.5" />
              </div>

              {/* Handwritten blue-ink text */}
              <p
                className="text-[14px] leading-[1.8] text-[#1a3a8a] select-none"
                style={{
                  fontFamily: "'Segoe UI', 'Georgia', cursive",
                  fontWeight: 400,
                  fontStyle: 'italic',
                  letterSpacing: '0.01em',
                }}
              >
                Courtesy,<br />
                Your Friendly<br />
                Neighborhood<br />
                <span style={{ fontWeight: 600 }}>Spider-Man</span>
              </p>
            </div>

            {/* SVG Yarn Connections */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-20">
              <defs>
                <filter id="yarn-shadow" x="-10%" y="-10%" width="120%" height="120%">
                  <feDropShadow dx="2" dy="4" stdDeviation="3" floodOpacity="0.75" />
                </filter>
                <filter id="yarn-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComponentTransfer in="blur" result="glow1">
                    <feFuncA type="linear" slope="3" />
                  </feComponentTransfer>
                  <feMerge>
                    <feMergeNode in="glow1" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {CONNECTIONS.map((conn, idx) => {
                const fromNode = INITIAL_NODES.find((n) => n.id === conn.from);
                const toNode = INITIAL_NODES.find((n) => n.id === conn.to);
                const fromPos = NODE_OFFSETS[conn.from];
                const toPos = NODE_OFFSETS[conn.to];

                if (!fromNode || !toNode || !fromPos || !toPos) return null;

                // Compute center pin positions
                const startX = fromPos.x + fromNode.width / 2;
                const startY = fromPos.y; // Connect at top pin coordinate
                const endX = toPos.x + toNode.width / 2;
                const endY = toPos.y; // Connect at top pin coordinate

                const isRelatedHovered = activeNodeId === conn.from || activeNodeId === conn.to;

                return (
                  <g key={`${conn.from}-${conn.to}-${idx}`}>
                    {isRelatedHovered && (
                      <path
                        d={`M ${startX} ${startY} Q ${(startX + endX) / 2 + 10} ${(startY + endY) / 2 - 15} ${endX} ${endY}`}
                        fill="none"
                        stroke="#dc2626"
                        strokeWidth="6"
                        strokeOpacity="0.8"
                        filter="url(#yarn-glow)"
                      />
                    )}
                    <path
                      d={`M ${startX} ${startY} Q ${(startX + endX) / 2 + 5} ${(startY + endY) / 2 - 10} ${endX} ${endY}`}
                      fill="none"
                      stroke={isRelatedHovered ? '#ff3333' : '#a82020'}
                      strokeWidth="2.5"
                      strokeOpacity={hoveredNodeId ? (isRelatedHovered ? 1.0 : 0.2) : 0.8}
                      filter="url(#yarn-shadow)"
                      className="transition-all duration-300"
                    />
                  </g>
                );
              })}
            </svg>

            {/* Pinned Cards */}
            {INITIAL_NODES.map((node, idx) => {
              const pos = NODE_OFFSETS[node.id];
              if (!pos) return null;

              const isHovered = hoveredNodeId === node.id;
              const isFlipped = flippedNodeId === node.id;
              const isSelected = selectedNodeId === node.id;

              return (
                <div
                  key={node.id}
                  onMouseEnter={() => setHoveredNodeId(node.id)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                  className="absolute pointer-events-auto cursor-pointer z-30"
                  style={{
                    left: pos.x,
                    top: pos.y,
                    width: node.width,
                    height: node.height,
                    zIndex: isHovered || isFlipped || isSelected ? 50 : 30
                  }}
                >
                  <motion.div
                    className="w-full h-full"
                    style={{
                      transform: `rotate(${node.rotation || 0}deg)`
                    }}
                    whileHover={{ scale: 1.03 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    {node.type === 'sticky' ? (
                      <Tape rotate={-3} />
                    ) : node.type === 'project' ? (
                      <Tape rotate={2} />
                    ) : (
                      <Pin />
                    )}

                    <div 
                      className="w-full h-full perspective-1000 cursor-pointer"
                      onClick={() => handleCardClick(node.id)}
                      onDoubleClick={() => {
                        setSelectedNodeId(node.id);
                        audioEngine.init();
                        audioEngine.playSwitch();
                      }}
                    >
                      <div 
                        className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}
                      >
                        {/* Selection highlight glow */}
                        {isSelected && (
                          <div className="absolute -inset-3 bg-rose-600/20 blur-xs rounded-lg pointer-events-none z-0 border-2 border-dashed border-rose-600 shadow-[0_0_25px_rgba(220,38,38,0.6)] animate-pulse" />
                        )}
                        
                        {/* CARD FRONT */}
                        {node.type === 'sticky' ? (
                          <div 
                            className={`absolute inset-0 backface-hidden border border-amber-900/25 p-3.5 shadow-md flex flex-col justify-between overflow-hidden ${
                              node.stickyColor === 'pink' 
                                ? 'bg-[#ffd3e8] text-pink-950' 
                                : node.stickyColor === 'cyan'
                                ? 'bg-[#d0f5fc] text-cyan-950'
                                : 'bg-[#fef3c7] text-amber-950'
                            }`}
                            style={{
                              boxShadow: '3px 8px 16px rgba(0,0,0,0.18)',
                              backgroundImage: 'url("https://www.transparenttextures.com/patterns/cream-paper.png")'
                            }}
                          >
                            <div className="space-y-1.5">
                              <span className="text-[9px] font-black tracking-widest uppercase opacity-65 block">
                                {node.label}
                              </span>
                              <h3 className="font-stamp text-xs sm:text-[13px] font-black uppercase tracking-tight border-b border-black/10 pb-1 leading-none">
                                {node.title}
                              </h3>
                              <p className="font-mono text-[12px] sm:text-[12.5px] font-bold leading-normal italic pt-1.5 text-black/85">
                                "{node.desc}"
                              </p>
                            </div>
                            
                            <div className="mt-auto pt-2 flex flex-col gap-1" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => {
                                  setSelectedNodeId(node.id);
                                  audioEngine.init();
                                  audioEngine.playSwitch();
                                }}
                                className="w-full py-1.5 bg-black/85 hover:bg-black text-white rounded-xs font-mono text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-1 shadow-xs transition-colors"
                              >
                                📂 OPEN FILE
                              </button>
                            </div>

                            {/* Target Lock-On Reticle */}
                            {isSelected && (
                              <div className="absolute inset-0 z-30 pointer-events-none border-2 border-rose-600/90 shadow-[inset_0_0_20px_rgba(220,38,38,0.35)] flex flex-col justify-between p-1.5 animate-pulse">
                                <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-rose-600" />
                                <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-rose-600" />
                                <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-rose-600" />
                                <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-rose-600" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-6 h-6 rounded-full border border-dashed border-rose-600/50 flex items-center justify-center animate-spin-slow">
                                    <div className="w-1.5 h-1.5 bg-rose-600 rounded-full" />
                                  </div>
                                </div>
                                <div className="absolute top-1.5 right-1.5 bg-rose-600 text-white font-mono text-[7px] font-black px-1 py-0.5 rounded tracking-widest uppercase animate-pulse">
                                  LOCK
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div 
                            className={`absolute inset-0 backface-hidden bg-[#fdfaf2] border border-ink/20 p-2.5 pb-4 shadow-lg flex flex-col justify-between overflow-hidden ${
                              node.type === 'subject' 
                                ? 'bg-polaroid' 
                                : node.type === 'achievement' 
                                ? 'bg-amber-50/90 border-amber-900/25' 
                                : 'bg-stone-100/95 border-stone-300'
                            }`}
                            style={{
                              backgroundImage: 'url("https://www.transparenttextures.com/patterns/cardboard-flat.png")'
                            }}
                          >
                            {node.imageUrl ? (
                              <div className="w-full flex-1 border border-zinc-700 bg-neutral-900 overflow-hidden relative select-none">
                                <img 
                                  src={node.imageUrl} 
                                  alt={node.title} 
                                  draggable="false"
                                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-300 select-none pointer-events-none"
                                />
                                <div className="absolute top-1 left-1.5 bg-black/60 text-white font-mono text-[9px] px-1 rounded uppercase tracking-wider">
                                  {node.label}
                                </div>
                              </div>
                            ) : (
                              <div className="w-full flex-1 border border-dashed border-ink/25 flex flex-col items-center justify-center p-3 text-center">
                                <BookOpen className="h-6 w-6 text-rose-800 opacity-60 mb-1" />
                                <span className="font-mono text-[9.5px] font-black text-rose-800 tracking-wider uppercase">
                                  {node.label}
                                </span>
                                <span className="font-stamp text-[13px] font-black text-ink leading-tight mt-1">
                                  {node.title}
                                </span>
                              </div>
                            )}

                            <div className="mt-2.5 px-0.5">
                              {node.imageUrl && (
                                <h3 className="font-stamp text-xs sm:text-[13px] font-black text-ink uppercase tracking-tight leading-none mb-1">
                                  {node.title}
                                </h3>
                              )}
                              <p className="font-mono text-[12px] sm:text-[12.5px] font-semibold leading-normal text-ink/95 line-clamp-3">
                                {node.desc}
                              </p>
                            </div>

                            {/* Small click indicator */}
                            <div className="absolute bottom-1.5 right-2 text-[8px] font-mono text-ink/55 uppercase font-black tracking-widest flex items-center gap-0.5 pointer-events-none">
                              <RefreshCw className="h-2.5 w-2.5 animate-spin-slow text-rose-800" /> FLIP
                            </div>

                            {/* Target Lock-On Reticle */}
                            {isSelected && (
                              <div className="absolute inset-0 z-30 pointer-events-none border-2 border-rose-600/90 shadow-[inset_0_0_20px_rgba(220,38,38,0.35)] flex flex-col justify-between p-1.5 animate-pulse">
                                <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-rose-600" />
                                <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-rose-600" />
                                <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-rose-600" />
                                <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-rose-600" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-6 h-6 rounded-full border border-dashed border-rose-600/50 flex items-center justify-center animate-spin-slow">
                                    <div className="w-1.5 h-1.5 bg-rose-600 rounded-full" />
                                  </div>
                                </div>
                                <div className="absolute top-1.5 right-1.5 bg-rose-600 text-white font-mono text-[7px] font-black px-1 py-0.5 rounded tracking-widest uppercase animate-pulse">
                                  LOCK
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* CARD BACK */}
                        <div 
                          className="absolute inset-0 backface-hidden rotate-y-180 bg-[#fbf8f0] border-[2px] border-rose-900/40 p-3.5 flex flex-col justify-between shadow-2xl"
                          style={{
                            backgroundImage: 'url("https://www.transparenttextures.com/patterns/cream-paper.png")',
                            boxShadow: 'inset 0 0 15px rgba(139, 30, 30, 0.05)'
                          }}
                        >
                          <div className="space-y-2 flex-1">
                            <div className="border-b border-rose-900/25 pb-2">
                              <span className="text-[9px] font-black text-rose-700 tracking-widest uppercase block">
                                CLASSIFIED RECORD FILE
                              </span>
                              <h4 className="font-stamp text-xs sm:text-sm font-black text-ink uppercase leading-none mt-1">
                                {node.title}
                              </h4>
                            </div>

                            <div className="font-mono text-[12px] sm:text-[12.5px] leading-relaxed text-ink font-semibold space-y-1.5">
                              {node.type === 'subject' ? (
                                <>
                                  <div><strong className="text-rose-900 font-black">CODING AGENT:</strong> Moin Akhtar</div>
                                  <div><strong className="text-rose-900 font-black">SPECIALIZATION:</strong> Full-Stack AI Architecture</div>
                                  <div><strong className="text-rose-900 font-black">WEAPON:</strong> Custom LLM frameworks & Smart Contracts</div>
                                </>
                              ) : (
                                <>
                                  <p className="line-clamp-4 leading-normal">{node.desc}</p>
                                  {node.tech && (
                                    <div className="bg-ink/5 p-1 border border-ink/15 font-bold truncate text-[10.5px] text-rose-950">
                                      <span className="text-rose-800 font-black">STACK:</span> {node.tech}
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          </div>

                          {/* Back actions */}
                          <div className="border-t border-ink/15 pt-2 flex flex-col gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button 
                              onClick={() => {
                                setSelectedNodeId(node.id);
                                audioEngine.init();
                                audioEngine.playSwitch();
                              }}
                              className="w-full py-1.5 bg-rose-900 text-white hover:bg-rose-950 rounded-xs font-mono text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1 shadow-sm transition-colors"
                            >
                              📂 OPEN FILE
                            </button>
                            
                            <div className="flex items-center justify-between gap-1 mt-0.5">
                              {node.pdfUrl ? (
                                <button 
                                  onClick={() => setActivePdf(node.pdfUrl!)}
                                  className="px-2.5 py-1 bg-rose-900/10 hover:bg-rose-900/20 border border-rose-900/25 rounded font-mono text-[8.5px] text-rose-900 font-black flex items-center gap-0.5 transition-colors"
                                >
                                  CERTIFICATE
                                </button>
                              ) : node.id === 'a-ieee' ? (
                                <button 
                                  onClick={() => setShowPubDetails(true)}
                                  className="px-2.5 py-1 bg-rose-900/10 hover:bg-rose-900/20 border border-rose-900/25 rounded font-mono text-[8.5px] text-rose-900 font-black flex items-center gap-0.5 transition-colors"
                                >
                                  EXTRACT
                                </button>
                              ) : (
                                <div />
                              )}

                              {node.links?.site && (
                                <a 
                                  href={node.links.site} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  className="px-2.5 py-1 bg-ink hover:bg-ink/90 text-white rounded font-mono text-[8.5px] font-black flex items-center gap-0.5 transition-colors"
                                >
                                  LAUNCH <ExternalLink className="h-2 w-2 text-white" />
                                </a>
                              )}
                            </div>
                          </div>

                          {/* Target Lock-On Reticle */}
                          {isSelected && (
                            <div className="absolute inset-0 z-30 pointer-events-none border-2 border-rose-600/90 shadow-[inset_0_0_20px_rgba(220,38,38,0.35)] flex flex-col justify-between p-1.5 animate-pulse">
                              <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-rose-600" />
                              <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-rose-600" />
                              <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-rose-600" />
                              <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-rose-600" />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-6 h-6 rounded-full border border-dashed border-rose-600/50 flex items-center justify-center animate-spin-slow">
                                  <div className="w-1.5 h-1.5 bg-rose-600 rounded-full" />
                                </div>
                              </div>
                              <div className="absolute top-1.5 right-1.5 bg-rose-600 text-white font-mono text-[7px] font-black px-1 py-0.5 rounded tracking-widest uppercase animate-pulse">
                                LOCK
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>
      </div>

      {/* RIGHT DRAWER — Full detail panel (Portal) */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {selectedNode && (
            <>
              {/* Dark overlay behind drawer */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedNodeId(null)}
                className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 pointer-events-auto"
              />

              {/* Slide-in Drawer */}
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 240 }}
                className="fixed top-0 right-0 h-full w-full max-w-[520px] z-[60] flex flex-col pointer-events-auto overflow-hidden"
                style={{
                  background: 'linear-gradient(180deg, #faf6ee 0%, #f3edd8 100%)',
                  boxShadow: '-8px 0 40px rgba(0,0,0,0.3)',
                  borderLeft: '1px solid rgba(120,80,40,0.12)'
                }}
              >
                {/* ─── HEADER ─── */}
                <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-amber-900/12 shrink-0 gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Category label */}
                    <span className="inline-block text-[9px] font-black font-mono uppercase tracking-widest text-rose-700 border border-rose-700/40 bg-rose-50 px-2 py-0.5 rounded mb-2">
                      {selectedNode.label}
                    </span>
                    {/* Title */}
                    <h2 className="font-stamp text-2xl font-black text-stone-800 leading-tight tracking-wide truncate">
                      {selectedNode.title}
                    </h2>
                    {/* Sub-label */}
                    <p className="text-[10px] text-stone-500 font-mono mt-0.5">
                      ID: {selectedNode.id} &nbsp;·&nbsp; {selectedNode.status || 'Active'}
                    </p>
                  </div>
                  {/* Close */}
                  <button
                    onClick={() => setSelectedNodeId(null)}
                    className="shrink-0 w-8 h-8 flex items-center justify-center rounded border border-ink/20 text-ink hover:bg-rose-700 hover:text-white hover:border-rose-700 transition-all mt-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* ─── TABS ─── */}
                <div className="flex border-b border-amber-900/12 bg-amber-900/5 shrink-0 px-4 pt-3 gap-0.5">
                  {[
                    { id: 'overview', label: 'Overview' },
                    { id: 'tech',     label: 'Tech & Skills' },
                    { id: 'metrics',  label: 'Stats' },
                    { id: 'notes',    label: 'Notes' },
                  ].map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id as any);
                          audioEngine.init();
                          audioEngine.playSwitch();
                        }}
                        className={`px-4 py-2 text-[11px] font-black font-mono uppercase tracking-wide rounded-t transition-all duration-150 ${
                          isActive
                            ? 'bg-[#faf6ee] text-rose-800 border-t border-x border-amber-900/15 -mb-px z-10'
                            : 'text-stone-500 hover:text-stone-700 hover:bg-white/40'
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                {/* ─── BODY ─── */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

                  {/* ══════ OVERVIEW TAB ══════ */}
                  {activeTab === 'overview' && (
                    <div className="space-y-5">

                      {/* Photo */}
                      {selectedNode.imageUrl && (
                        selectedNode.id === 'subject' ? (
                          <div className="flex justify-center pt-1">
                            <div className="bg-white p-3 pb-8 shadow-[4px_8px_24px_rgba(0,0,0,0.18)] border border-stone-200 rotate-[-1deg] max-w-[260px] w-full">
                              <div className="w-full h-52 overflow-hidden bg-stone-900">
                                <img
                                  src={selectedNode.imageUrl}
                                  alt={selectedNode.title}
                                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                                />
                              </div>
                              <p className="mt-3 text-center text-stone-700 font-mono text-[11px]" style={{ fontFamily: 'var(--font-handwritten, "Kalam", cursive)' }}>
                                Moin Akhtar — Developer
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-48 border border-stone-300 overflow-hidden bg-stone-900 shadow-inner">
                            <img
                              src={selectedNode.imageUrl}
                              alt={selectedNode.title}
                              className="w-full h-full object-cover hover:grayscale-0 grayscale transition-all duration-300"
                            />
                          </div>
                        )
                      )}

                      {/* About this file */}
                      <div className="bg-white/60 border border-amber-900/12 rounded p-4 space-y-2">
                        <div className="text-[9px] font-black font-mono tracking-widest text-stone-400 uppercase border-b border-stone-200 pb-1.5 mb-2">About this File</div>
                        <p className="text-sm text-stone-700 leading-relaxed font-mono">
                          {selectedNode.briefing || selectedNode.desc}
                        </p>
                      </div>

                      {/* Quick info row */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-white/60 border border-amber-900/10 rounded p-3">
                          <div className="text-[9px] font-black font-mono text-stone-400 uppercase tracking-wider mb-1">Status</div>
                          <div className="text-[12px] font-black text-stone-800 font-mono">{selectedNode.status || 'Active'}</div>
                        </div>
                        <div className="bg-white/60 border border-amber-900/10 rounded p-3">
                          <div className="text-[9px] font-black font-mono text-stone-400 uppercase tracking-wider mb-1">Code</div>
                          <div className="text-[12px] font-black text-stone-800 font-mono">{selectedNode.codeName || 'N/A'}</div>
                        </div>
                      </div>

                    </div>
                  )}

                  {/* ══════ TECH & SKILLS TAB ══════ */}
                  {activeTab === 'tech' && (
                    <div className="space-y-5">

                      {/* Tech tags */}
                      {selectedNode.tech && (
                        <div className="space-y-2">
                          <div className="text-[9px] font-black font-mono tracking-widest text-stone-400 uppercase border-b border-stone-200 pb-1">Tools & Technologies Used</div>
                          <div className="flex flex-wrap gap-2 pt-1">
                            {selectedNode.tech.split(',').map((t) => (
                              <span key={t} className="text-[11px] font-bold bg-white border border-stone-300 text-stone-700 px-3 py-1 rounded shadow-xs">
                                {t.trim()}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Technical breakdown */}
                      <div className="space-y-2">
                        <div className="text-[9px] font-black font-mono tracking-widest text-stone-400 uppercase border-b border-stone-200 pb-1">How it was built</div>
                        {selectedNode.technicalBreakdown && selectedNode.technicalBreakdown.length > 0 ? (
                          <ul className="space-y-3 pt-1">
                            {selectedNode.technicalBreakdown.map((item, idx) => (
                              <li key={idx} className="flex gap-3 items-start bg-white/50 border border-amber-900/10 rounded p-3">
                                <span className="text-[10px] font-black text-rose-700 font-mono shrink-0 pt-0.5">0{idx + 1}</span>
                                <span className="text-[12px] text-stone-700 leading-snug font-mono">{item}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-[11px] text-stone-400 italic font-mono p-3 border border-dashed border-stone-300 rounded">
                            No technical details recorded for this file.
                          </p>
                        )}
                      </div>

                      {/* File check progress */}
                      <div className="bg-white/60 border border-amber-900/12 rounded p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="text-[9px] font-black font-mono tracking-widest text-stone-400 uppercase">File Verified</div>
                          <span className={`text-[9px] font-black font-mono px-2 py-0.5 rounded border ${decryptProgress === 100 ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-amber-50 text-amber-700 border-amber-300'}`}>
                            {decryptProgress === 100 ? '✓ Done' : 'Checking...'}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-rose-700 rounded-full transition-all duration-500"
                            style={{ width: `${decryptProgress}%` }}
                          />
                        </div>
                        <div className="space-y-1 text-[10.5px] text-stone-500 font-mono">
                          <div>&gt; Checking file for {selectedNode.id}...</div>
                          {decryptProgress > 40 && <div>&gt; Verifying records...</div>}
                          {decryptProgress > 75 && <div>&gt; Almost done...</div>}
                          {decryptProgress === 100 && <div className="text-emerald-700 font-bold">&gt; All good! This file is verified.</div>}
                        </div>
                      </div>

                    </div>
                  )}

                  {/* ══════ STATS TAB ══════ */}
                  {activeTab === 'metrics' && (
                    <div className="space-y-5">

                      {/* Metrics */}
                      <div className="space-y-2">
                        <div className="text-[9px] font-black font-mono tracking-widest text-stone-400 uppercase border-b border-stone-200 pb-1">Key Numbers</div>
                        {selectedNode.metrics && selectedNode.metrics.length > 0 ? (
                          <div className="divide-y divide-stone-200 border border-amber-900/10 rounded bg-white/50 overflow-hidden">
                            {selectedNode.metrics.map((metric, idx) => {
                              const parts = metric.split(':');
                              const name = parts[0]?.trim() || '';
                              const val = parts.slice(1).join(':')?.trim() || '';
                              return (
                                <div key={idx} className="flex items-center px-4 py-3 gap-4">
                                  <div className="w-2/5 text-[11px] font-bold text-rose-800 font-mono">{name}</div>
                                  <div className="flex-1 text-[12px] font-bold text-stone-800 font-mono">{val || '—'}</div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-[11px] text-stone-400 italic font-mono p-3 border border-dashed border-stone-300 rounded">
                            No stats available for this file.
                          </p>
                        )}
                      </div>

                      {/* Visitor log */}
                      <div className="bg-white/60 border border-amber-900/12 rounded p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="text-[9px] font-black font-mono tracking-widest text-stone-400 uppercase">Recent Visitors</div>
                          <span className="text-[9px] font-black font-mono px-2 py-0.5 rounded border bg-emerald-50 text-emerald-700 border-emerald-300">● Online</span>
                        </div>
                        <div className="space-y-2 text-[11px] font-mono">
                          {[
                            { time: '14:02', device: 'Desktop', city: 'New Delhi, IN' },
                            { time: '14:05', device: 'Mobile', city: 'San Francisco, CA' },
                            { time: '14:11', device: 'Tablet', city: 'London, UK' },
                          ].map(({ time, device, city }) => (
                            <div key={city} className="flex items-center justify-between border-b border-stone-100 pb-1.5 last:border-0 last:pb-0">
                              <span className="text-stone-400 w-10">{time}</span>
                              <span className="text-stone-700 font-bold flex-1 px-2">{device}</span>
                              <span className="text-rose-700">{city}</span>
                            </div>
                          ))}
                        </div>
                        <div className="text-[10px] text-stone-400 font-mono pt-1 border-t border-stone-200">Total visits this month: 1,842</div>
                      </div>

                    </div>
                  )}

                  {/* ══════ NOTES TAB ══════ */}
                  {activeTab === 'notes' && (
                    <div className="space-y-5">

                      {/* Handwritten notes card */}
                      <div className="space-y-2">
                        <div className="text-[9px] font-black font-mono tracking-widest text-stone-400 uppercase border-b border-stone-200 pb-1">Personal Notes</div>
                        <div
                          className="p-5 border border-amber-900/15 bg-[#fffdf5] rounded shadow-sm relative"
                          style={{ backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, #ddd7c8 27px, #ddd7c8 28px)' }}
                        >
                          <p
                            style={{ fontFamily: 'var(--font-handwritten, "Kalam", cursive)', lineHeight: '28px' }}
                            className="text-stone-700 text-[15px] font-medium"
                          >
                            "{selectedNode.fieldNotes || 'No notes written yet.'}"
                          </p>
                        </div>
                      </div>

                      {/* Music player — subject only */}
                      {selectedNode.id === 'subject' && (
                        <div className="space-y-4">

                          {/* Music */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-[9px] font-black font-mono tracking-widest text-stone-400 uppercase border-b border-stone-200 pb-1">
                              <Music className="h-3.5 w-3.5 text-rose-700" /> Music I Work To
                            </div>
                            <div className="bg-stone-900 rounded p-3 space-y-2">
                              {/* Now playing */}
                              <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                                <div>
                                  <div className="text-[10px] text-rose-400 font-mono font-bold">Now Playing</div>
                                  <div className="text-[12px] font-bold text-white truncate max-w-[240px]">{MUSIC_TRACKS[playbackState.trackIndex]?.title || '—'}</div>
                                  <div className="text-[10px] text-stone-400">{MUSIC_TRACKS[playbackState.trackIndex]?.artist}</div>
                                </div>
                                <button
                                  onClick={async () => { audioEngine.init(); await musicEngine.toggle(playbackState.trackIndex); }}
                                  className="p-2 bg-stone-800 hover:bg-stone-700 text-white rounded border border-stone-700 transition-all active:scale-95"
                                >
                                  {playbackState.isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                                </button>
                              </div>
                              {/* Track list */}
                              <div className="space-y-1">
                                {[1, 0, 2, 4].map((idx) => {
                                  const track = MUSIC_TRACKS[idx];
                                  if (!track) return null;
                                  const isCurrent = playbackState.trackIndex === idx;
                                  return (
                                    <div
                                      key={track.id}
                                      onClick={async () => { audioEngine.init(); isCurrent ? await musicEngine.toggle(idx) : await musicEngine.play(idx); }}
                                      className={`flex items-center gap-2 p-1.5 rounded cursor-pointer transition-all ${isCurrent ? 'bg-rose-950/60 text-rose-200' : 'text-white/80 hover:text-white hover:bg-neutral-800'}`}
                                    >
                                      <span className="text-[10px] w-3 text-center">{isCurrent && playbackState.isPlaying ? '▶' : '♪'}</span>
                                      <div className="flex-1 min-w-0">
                                        <div className="text-[11px] font-bold truncate">{track.title}</div>
                                        <div className="text-[9px] opacity-60 truncate">{track.artist}</div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>

                          {/* Setup */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-[9px] font-black font-mono tracking-widest text-stone-400 uppercase border-b border-stone-200 pb-1">
                              <Monitor className="h-3.5 w-3.5 text-rose-700" /> My Setup
                            </div>
                            <div className="divide-y divide-stone-200 border border-amber-900/10 rounded bg-white/50 overflow-hidden">
                              {[
                                ['PC', 'Intel i5-12400F · RTX 3060 · 32GB RAM'],
                                ['Screens', 'Acer 27" 165Hz + Samsung 24" Portrait'],
                                ['Keyboard', 'Portronics Hydra 10 (tape modded)'],
                                ['Mouse', 'Razer DeathAdder Essential'],
                                ['OS', 'Windows 11 / WSL2 Ubuntu 22.04'],
                              ].map(([label, val]) => (
                                <div key={label} className="flex items-center px-3 py-2.5 gap-3">
                                  <span className="text-[10px] font-bold text-rose-800 font-mono w-20 shrink-0">{label}</span>
                                  <span className="text-[11px] text-stone-700 font-mono">{val}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Books */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-[9px] font-black font-mono tracking-widest text-stone-400 uppercase border-b border-stone-200 pb-1">
                              <BookOpen className="h-3.5 w-3.5 text-rose-700" /> Books I've Read
                            </div>
                            <div className="space-y-2">
                              {[
                                ['Designing Data-Intensive Applications', 'Martin Kleppmann'],
                                ['The Rust Programming Language', 'Steve Klabnik & Carol Nichols'],
                                ['Eloquent JavaScript', 'Marijn Haverbeke'],
                                ['Clean Code', 'Robert C. Martin'],
                              ].map(([title, author]) => (
                                <div key={title} className="flex flex-col border-l-2 border-rose-700 pl-3 py-0.5 bg-white/40">
                                  <span className="text-[12px] font-bold text-stone-800 font-mono">{title}</span>
                                  <span className="text-[10px] text-stone-500 font-mono">{author}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Films */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-[9px] font-black font-mono tracking-widest text-stone-400 uppercase border-b border-stone-200 pb-1">
                              <Film className="h-3.5 w-3.5 text-rose-700" /> Films I Love
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              {[
                                ['Spider-Verse', 'Visual design inspiration'],
                                ['Interstellar', 'Big-picture thinking'],
                                ['Whiplash', 'Pushing limits'],
                                ['Fight Club', 'Questioning the default'],
                              ].map(([title, why]) => (
                                <div key={title} className="bg-stone-900 text-white p-3 rounded space-y-0.5 border border-stone-800">
                                  <div className="text-[11px] font-bold">{title}</div>
                                  <div className="text-[9px] text-stone-400">{why}</div>
                                </div>
                              ))}
                            </div>
                          </div>

                        </div>
                      )}
                    </div>
                  )}

                </div>

                {/* ─── FOOTER ACTIONS ─── */}
                <div className="shrink-0 px-6 py-4 border-t border-amber-900/12 bg-amber-900/5 space-y-2">
                  {selectedNode.pdfUrl && (
                    <button
                      onClick={() => setActivePdf(selectedNode.pdfUrl!)}
                      className="w-full py-2.5 bg-rose-800 hover:bg-rose-900 text-white rounded font-mono text-[11px] font-black flex items-center justify-center gap-2 transition-colors shadow-sm"
                    >
                      <FileText className="h-4 w-4" /> View Certificate
                    </button>
                  )}
                  {selectedNode.id === 'a-ieee' && (
                    <button
                      onClick={() => setShowPubDetails(true)}
                      className="w-full py-2.5 bg-rose-800 hover:bg-rose-900 text-white rounded font-mono text-[11px] font-black flex items-center justify-center gap-2 transition-colors shadow-sm"
                    >
                      <FileText className="h-4 w-4" /> Read Research Paper
                    </button>
                  )}
                  {selectedNode.links?.site && (
                    <a
                      href={selectedNode.links.site}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2.5 bg-stone-800 hover:bg-stone-900 text-white rounded font-mono text-[11px] font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
                    >
                      Visit Website <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                  {/* Social links */}
                  <div className="flex gap-3 pt-1 justify-center">
                    {selectedNode.links?.x && (
                      <a href={selectedNode.links.x} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-stone-500 hover:text-stone-800 font-mono transition-colors">
                        X / Twitter
                      </a>
                    )}
                    {selectedNode.links?.linkedin && (
                      <a href={selectedNode.links.linkedin} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-stone-500 hover:text-stone-800 font-mono transition-colors">
                        LinkedIn
                      </a>
                    )}
                    {selectedNode.links?.ieee && (
                      <a href={selectedNode.links.ieee} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-stone-500 hover:text-stone-800 font-mono transition-colors">
                        IEEE
                      </a>
                    )}
                  </div>
                </div>

              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Publication Detail Modal */}
      {showPubDetails && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ink/65 backdrop-blur-sm" onClick={() => setShowPubDetails(false)}>
          <div
            className="bg-paper p-6 sm:p-8 max-w-2xl w-full border border-ink/30 shadow-2xl relative font-mono text-ink animate-in fade-in duration-200"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundImage: 'url("https://www.transparenttextures.com/patterns/cream-paper.png")',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), inset 0 0 40px rgba(0,0,0,0.05)'
            }}
          >
            <button
              onClick={() => setShowPubDetails(false)}
              className="absolute top-4 right-4 rounded p-1 opacity-60 transition-colors hover:bg-red-700 hover:text-white hover:opacity-100"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-[10px] font-bold tracking-widest text-stamp mb-4 border-b border-stamp/30 pb-2 inline-block">
              // RESEARCH PAPER — PUBLISHED 2026 //
            </div>

            <h3 className="text-xl font-bold uppercase mb-2 leading-snug">
              A Sentence-Level Risk Estimator for Identifying Hallucinations in Generative AI
            </h3>

            <p className="italic opacity-80 border-l-2 border-ink/30 pl-3 mb-6">
              Presented at: International Conference on AI-Driven Smart Systems and Ubiquitous Computing (ICAUC), 2026
            </p>

            <div className="bg-ink/5 p-4 border border-ink/10 mb-6">
              <span className="text-[10px] font-bold opacity-50 uppercase tracking-wider block mb-2">Summary</span>
              <ul className="space-y-4 text-sm leading-relaxed">
                <li className="flex gap-3">
                  <span className="opacity-50">01</span>
                  <span>Presented a research paper proposing a new way to detect when AI gives wrong or made-up answers — checked sentence by sentence.</span>
                </li>
                <li className="flex gap-3">
                  <span className="opacity-50">02</span>
                  <span>Built a scoring system that combines three checks: meaning similarity (BERT), fact-based QA, and language logic (NLI).</span>
                </li>
                <li className="flex gap-3">
                  <span className="opacity-50">03</span>
                  <span>Goal: Make AI outputs more reliable and accurate in real-world apps.</span>
                </li>
              </ul>
            </div>

            <div className="flex justify-between items-end border-t border-ink/20 pt-4 mt-6">
              <div className="flex flex-col">
                <span className="text-[9px] opacity-50">AUTHOR</span>
                <span className="font-bold">MD MOIN AKHTAR</span>
              </div>
              <div className="text-stamp opacity-40 transform rotate-[-5deg]">
                <ClassifiedStamp />
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* PDF Viewer Modal */}
      {activePdf && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 pb-20 sm:pb-6 bg-ink/80 backdrop-blur-sm" onClick={() => setActivePdf(null)}>
          <div className="relative w-full max-w-5xl h-[85vh] bg-paper border border-ink/30 shadow-2xl flex flex-col z-10 animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center bg-ink text-paper p-3 shrink-0">
               <span className="font-mono text-xs uppercase tracking-widest font-bold">SECURE VIEWER // [ENCRYPTED DATA]</span>
               <button onClick={() => setActivePdf(null)} className="p-1 transition-colors hover:bg-red-700 hover:text-white">
                 <X className="w-5 h-5" />
               </button>
            </div>
            <div className="flex-1 w-full bg-zinc-200 relative overflow-hidden">
               <PdfViewer url={activePdf} />
            </div>
          </div>
        </div>,
        document.body
      )}

    </PageTransition>
  );
}
