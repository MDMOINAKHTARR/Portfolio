export interface CaseEvidence {
  problem: string;
  investigation: string;
  solution: string;
  result: string;
}

export interface Project {
  id: string;
  title: string;
  tagline: string;
  category: 'ai' | 'web3' | 'fullstack' | 'ml';
  categoryLabel: string;
  status: 'ACTIVE' | 'DEPLOYED' | 'SUCCESS' | '1ST PLACE' | 'VERIFIED';
  statusColor: string;
  tech: string[];
  imageUrl: string;
  githubUrl?: string;
  liveUrl?: string;
  youtubeUrl?: string;
  xUrl?: string;
  linkedinUrl?: string;
  featured?: boolean;
  bentoSpan: string;
  /** Height of the image in px — drives masonry card height variety */
  imageHeight?: number;
  desc: string;
  caseEvidence: CaseEvidence;
  metrics?: string;
}

export const PROJECTS: Project[] = [
  {
    id: 'OP-410',
    title: 'LEDGERFORGE',
    tagline: 'Governed AI platform for auditable bank-to-ledger reconciliation and accountant-led exception review.',
    category: 'fullstack',
    categoryLabel: 'FINTECH & AI GOVERNANCE',
    status: 'ACTIVE',
    statusColor: 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/25',
    tech: ['React', 'FastAPI', 'Supabase', 'OpenAI', 'Python'],
    imageUrl: '/ledgerforge-landing.webp',
    githubUrl: 'https://github.com/MDMOINAKHTARR/LedgerForge',
    youtubeUrl: 'https://www.youtube.com/watch?v=G-fjDaS-v9s&feature=youtu.be',
    xUrl: 'https://x.com/Moincrafted/status/2097019500835311787?s=20',
    featured: true,
    bentoSpan: 'lg:col-span-7',
    imageHeight: 225,
    metrics: '112-Test Safety Suite',
    desc: 'An enterprise-grade bank reconciliation platform that combines deterministic matching, controlled advisory AI, and human exception handling. Hard financial guardrails prevent the system from auto-reconciling currency mismatches, material variances, duplicate claims, or ambiguous matches.',
    caseEvidence: {
      problem: 'Accounting teams reconcile high-volume bank and general-ledger transactions through error-prone manual spreadsheets, leaving ambiguous cases difficult to audit.',
      investigation: 'A dependable workflow needs more than model confidence: it requires deterministic matching, currency isolation, evidence capture, and clear escalation paths for exceptions.',
      solution: 'Built a React and FastAPI platform with a multi-tier matching engine, policy-enforced decision layer, structured precedent memory, and accountant review flows backed by Supabase.',
      result: 'Created a governed reconciliation workflow with immutable audit records and a 112-test suite covering matching, safety boundaries, policy optimization, and exception handling.'
    }
  },
  {
    id: 'OP-001',
    title: 'LAZYCLIP.BUZZ',
    tagline: 'Natural-language AI video editing pipeline turning longform content into vertical shorts.',
    category: 'ai',
    categoryLabel: 'AI & VIDEO PIPELINE',
    status: 'ACTIVE',
    statusColor: 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/25',
    tech: ['Open Source', 'Video Editing', 'Natural Language', 'Captions', 'Voice-over'],
    imageUrl: '/lazyclip.buzz mock.png',
    githubUrl: 'https://github.com/JAYATIAHUJA/LAZYCLIP.BUZZ',
    liveUrl: 'https://lazyclip.buzz',
    xUrl: 'https://x.com/Moincrafted/status/2076235594209042859?s=20',
    featured: true,
    bentoSpan: 'lg:col-span-7',
    imageHeight: 240,
    metrics: '100+ Users on Day 1',
    desc: 'An open-source video editing system controlled through natural-language instructions. It accepts a prompt, an uploaded video, or a YouTube segment and returns a vertical video with auto-captions, visual reframing, and synthetic voice-over.',
    caseEvidence: {
      problem: 'Creating a polished short required several disconnected editing tools and roughly 40 minutes of manual framing and caption work.',
      investigation: 'Creator workflows repeatedly broke at clipping, captions, reframing, and voice-over handoffs between heavy desktop software.',
      solution: 'Engineered an end-to-end natural-language editing pipeline that accepts video inputs and automatically compiles vertical-ready video with synced subtitles.',
      result: 'Unified 4 separate software workflows into one single interface and attracted 100+ creators within 24 hours of launch.'
    }
  },
  {
    id: 'OP-317',
    title: 'RELAY VAULT',
    tagline: 'Decentralized autonomous AI agent marketplace with smart contract escrow on Monad.',
    category: 'web3',
    categoryLabel: 'ON-CHAIN & SMART CONTRACTS',
    status: 'ACTIVE',
    statusColor: 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/25',
    tech: ['Monad Testnet', 'Smart Contracts', 'AI Agents', 'Escrow', 'Solidity'],
    imageUrl: '/RelayVault landing page.png',
    githubUrl: 'https://github.com/MDMOINAKHTARR/Relay_Vault',
    youtubeUrl: 'https://youtu.be/IpkW9Zmbb7s?si=qtM8zDWlvqMVsKKQ',
    featured: true,
    bentoSpan: 'lg:col-span-5',
    imageHeight: 190,
    metrics: 'High-throughput On-Chain Escrow',
    desc: 'A decentralized agent marketplace and workflow execution protocol deployed on the high-throughput Monad Testnet. Leverages smart contracts for automated negotiation, conditional escrow, and verifiable proof of work between autonomous AI agents.',
    caseEvidence: {
      problem: 'Autonomous AI agents lacked a trustless protocol to discover one another, negotiate task pricing, and safely exchange value with guaranteed settlement.',
      investigation: 'Existing agent architectures relied on centralized API keys with high counterparty risk, lack of execution verification, and no atomic escrow.',
      solution: 'Deployed Solidity escrow contracts on Monad that hold payment until cryptographically verifiable task execution records are committed on-chain.',
      result: 'Delivered an on-chain coordination layer for discoverable agents and protected multi-agent transactions with sub-second finality.'
    }
  },
  {
    id: 'OP-081',
    title: 'UPSTART',
    tagline: 'Startup blueprint engine converting raw ideas into validated MVPs and roadmaps.',
    category: 'ai',
    categoryLabel: 'GEN-AI & MARKET FEASIBILITY',
    status: 'DEPLOYED',
    statusColor: 'text-cyan-700 dark:text-cyan-400 bg-cyan-500/10 border-cyan-500/25',
    tech: ['Next.js', 'Google Gen AI', 'Node.js', 'SQLite', 'Trends API'],
    imageUrl: '/upstart-mockup.png',
    githubUrl: 'https://github.com/MDMOINAKHTARR',
    youtubeUrl: 'https://youtu.be/mIntn3mUa50?si=7fvye7ZSGPpWbKM6',
    bentoSpan: 'lg:col-span-4',
    imageHeight: 155,
    metrics: '4-Week Feasibility Blueprint',
    desc: 'An AI-powered co-founder platform transforming startup ideas into validated business models and structured 4-week build roadmaps. Integrates Google Generative AI and Google Trends API for real-time market viability signals.',
    caseEvidence: {
      problem: 'Early-stage founders had raw concepts but lacked a structured, data-backed methodology to test market viability before writing code.',
      investigation: 'Customer validation, competitor intelligence, feasibility scoring, and sprint planning were fragmented across disconnected tools and spreadsheets.',
      solution: 'Architected a unified blueprint engine that pulls real-time search volume, runs automated competitive analysis, and synthesizes a 4-week execution roadmap.',
      result: 'Compresses days of manual market research into a 5-minute interactive intelligence briefing with feasibility scores.'
    }
  },
  {
    id: 'OP-109',
    title: 'HALO AI',
    tagline: 'High-responsiveness contextual assistant with real-time streaming task execution.',
    category: 'ai',
    categoryLabel: 'CONVERSATIONAL & STREAMING',
    status: 'ACTIVE',
    statusColor: 'text-indigo-700 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/25',
    tech: ['React', 'Next.js', 'Streaming API', 'Node.js', 'Tailwind'],
    imageUrl: '/haloai mockup.png',
    githubUrl: 'https://github.com/MDMOINAKHTARR',
    youtubeUrl: 'https://youtu.be/x34yyyCvm3E?si=KWrS3WjbGiywp3Ai',
    bentoSpan: 'lg:col-span-4',
    imageHeight: 210,
    metrics: 'Sub-100ms Stream Latency',
    desc: 'A responsive AI assistant platform designed to maintain context across multi-turn sessions while streaming structured task outcomes. Features resilient socket streaming, local memory caching, and tool execution integration.',
    caseEvidence: {
      problem: 'Standard chat interfaces frequently drop contextual nuances when transitioning from conversational exploration into executing multi-step operations.',
      investigation: 'High-latency round trips and rigid prompt patterns caused user friction and disjointed responses during heavy data synthesis.',
      solution: 'Developed an event-driven streaming interface with optimistic local UI updates and contextual memory threading.',
      result: 'Achieved seamless real-time token streaming with resilient state recovery and consistent task execution continuity.'
    }
  },
  {
    id: 'OP-012',
    title: 'DEVCATION',
    tagline: 'Physics-driven interactive hackathon environment securing 1st Place at PromptWars.',
    category: 'fullstack',
    categoryLabel: 'INTERACTIVE & 2D PHYSICS',
    status: '1ST PLACE',
    statusColor: 'text-amber-700 dark:text-amber-400 bg-amber-500/10 border-amber-500/25',
    tech: ['Next.js 15', 'Matter.js', 'React', 'Canvas Physics'],
    imageUrl: '/devacation-mockup.jpg',
    githubUrl: 'https://github.com/MDMOINAKHTARR',
    bentoSpan: 'lg:col-span-4',
    imageHeight: 165,
    metrics: 'PromptWars Winner (IGDTUW)',
    desc: 'An unconventional, high-energy hackathon web environment featuring real-time 2D physics interactions driven by Matter.js. The interface turns conventional static event schedules into an interactive playground.',
    caseEvidence: {
      problem: 'Hackathon landing pages are overwhelmingly generic and fail to communicate the competitive, playful character of tech buildathons.',
      investigation: 'Passive text-heavy pages suffer from quick drop-offs and poor brand recall among student builders.',
      solution: 'Created an interactive canvas world using Matter.js where schedule blocks, team tags, and sponsors are tangible physical bodies subject to gravity.',
      result: 'Directly supported the team in winning 1st Place at PromptWars (IGDTUW 2026) for best creative execution.'
    }
  },
  {
    id: 'OP-044',
    title: 'EMOTION RECOMMENDER',
    tagline: 'Computer vision cinema recommender matching films to real-time detected facial emotion.',
    category: 'ml',
    categoryLabel: 'COMPUTER VISION & ML',
    status: 'SUCCESS',
    statusColor: 'text-purple-700 dark:text-purple-400 bg-purple-500/10 border-purple-500/25',
    tech: ['Python', 'DeepFace', 'OpenCV', 'TMDB API', 'TF-IDF'],
    imageUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=1000',
    githubUrl: 'https://github.com/MDMOINAKHTARR',
    bentoSpan: 'lg:col-span-6',
    imageHeight: 200,
    metrics: 'Real-time Facial Emotion Sync',
    desc: 'Real-time computer vision recommendation system using DeepFace and OpenCV for live emotion detection. Maps dominant facial emotions via webcam to TMDB genres and employs TF-IDF cosine similarity for mood-aligned content filtering.',
    caseEvidence: {
      problem: 'Movie discovery algorithms rely almost exclusively on past viewing history, completely ignoring how a user actually feels in the present moment.',
      investigation: 'Users spend 15+ minutes endlessly scrolling because their historical watch history does not match their current emotional state.',
      solution: 'Built a webcam facial-analysis pipeline that classifies dominant emotions into psychological mood profiles mapped to cinematic genre distributions.',
      result: 'Delivered instant, mood-tailored recommendations with high satisfaction scores and zero manual search friction.'
    }
  },
  {
    id: 'OP-256',
    title: 'CASSENDRA',
    tagline: 'High-performance dataset exploration engine with schema mapping and live analytics.',
    category: 'fullstack',
    categoryLabel: 'BIG DATA & VISUALIZATION',
    status: 'VERIFIED',
    statusColor: 'text-blue-700 dark:text-blue-400 bg-blue-500/10 border-blue-500/25',
    tech: ['React', 'Data Analysis', 'Next.js', 'Tailwind', 'Schema Viz'],
    imageUrl: '/cassendra-dashboard.png',
    githubUrl: 'https://github.com/MDMOINAKHTARR',
    bentoSpan: 'lg:col-span-6',
    imageHeight: 175,
    metrics: 'Instant Multi-Table Schema Viz',
    desc: 'A dataset inspection workspace and querying engine designed for data engineers and analysts. Provides real-time metrics, foreign-key relationship graph visualizers, and interactive filters for rapid insight extraction.',
    caseEvidence: {
      problem: 'Inspectors and analysts wasted significant time writing exploratory boilerplate SQL queries just to understand nested table structures and distributions.',
      investigation: 'Traditional database GUIs are slow, visually cluttered, and require extensive manual query composition for basic statistical distributions.',
      solution: 'Constructed an intuitive graphical query engine that automatically infers schema relationships and plots dynamic visual distributions on load.',
      result: 'Reduced the cycle from raw CSV/SQL ingestion to structural architectural understanding from 30 minutes to under 60 seconds.'
    }
  },
];
