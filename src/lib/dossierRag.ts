import { PROJECTS } from '../data/projectsData';

export type RagCategory =
  | 'overview'
  | 'projects'
  | 'research'
  | 'hackathons'
  | 'skills'
  | 'education'
  | 'contact';

export interface RagAction {
  label: string;
  href?: string;
  route?: string;
  copyText?: string;
  trackId?: string;
  toggleTheme?: boolean;
}

export interface RagChunk {
  id: string;
  title: string;
  badge: string;
  category: RagCategory;
  keywords: string[];
  summary: string;
  details: string[];
  metrics?: string;
  actions: RagAction[];
}

export interface RagRetrievedChunk {
  chunk: RagChunk;
  score: number;
  bm25Score: number;
  semanticScore: number;
}

export interface RagResponse {
  query: string;
  intent: RagCategory | 'general';
  headline: string;
  answer: string;
  bullets: string[];
  citations: RagRetrievedChunk[];
  actions: RagAction[];
  latencyMs: number;
}

// Semantic concept clusters for dense concept-vector cosine similarity
const CONCEPT_CLUSTERS: Record<string, string[]> = {
  overview: ['who', 'moin', 'akhtar', 'about', 'bio', 'summary', 'introduce', 'profile', 'background', 'overview', 'tldr', 'recruiter', 'himself'],
  projects: ['project', 'built', 'build', 'portfolio', 'work', 'app', 'application', 'system', 'platform', 'operations', 'code', 'repo', 'github', 'ship', 'best', 'featured'],
  research: ['research', 'paper', 'ieee', 'publication', 'published', 'hallucination', 'icauc', 'sentence', 'risk', 'estimator', 'academic', 'journal', 'conference', 'citation', '11441054'],
  hackathons: ['hackathon', 'win', 'winner', 'won', 'award', 'prize', 'trophy', 'competition', 'buildathon', 'hermes', 'growthx', 'promptwars', 'innerve', 'igdtuw', 'syndicate', 'maximor', 'paranox', 'algosquest', 'podium', 'first', 'place', 'credits', 'gpu'],
  skills: ['skill', 'stack', 'tech', 'technology', 'language', 'framework', 'tool', 'know', 'proficient', 'experience', 'react', 'typescript', 'python', 'nextjs', 'fastapi', 'nodejs', 'tailwind', 'supabase', 'sql', 'neo4j', 'solidity', 'opencv', 'deepface', 'ml', 'ai', 'agent', 'frontend', 'backend', 'fullstack'],
  education: ['education', 'college', 'university', 'degree', 'btech', 'cgpa', 'gpa', 'grade', 'score', 'student', 'study', 'vips', 'ggsipu', 'certificate', 'certification', 'course'],
  contact: ['contact', 'email', 'reach', 'hire', 'hiring', 'available', 'availability', 'internship', 'job', 'role', 'freelance', 'collab', 'location', 'delhi', 'india', 'linkedin', 'twitter', 'leetcode', 'message', 'call'],
  resume: ['resume', 'cv', 'pdf', 'download', 'dossier', 'curriculum', 'vitae'],
  fintech: ['ledgerforge', 'bank', 'reconciliation', 'accounting', 'accountant', 'ledger', 'finance', 'fintech', 'audit', 'fastapi', 'supabase', '112'],
  video: ['lazyclip', 'video', 'short', 'clip', 'editing', 'caption', 'subtitle', 'voiceover', 'youtube', 'creator', '8h'],
  web3: ['relay', 'vault', 'web3', 'blockchain', 'crypto', 'smart', 'contract', 'escrow', 'monad', 'solidity', 'onchain', 'decentralized'],
  startup: ['upstart', 'startup', 'mvp', 'blueprint', 'roadmap', 'founder', 'feasibility', 'trends', 'market'],
  streaming: ['halo', 'assistant', 'chat', 'streaming', 'latency', 'socket', 'context', 'conversational'],
  physics: ['devcation', 'matterjs', 'physics', 'canvas', '2d', 'interactive', 'gravity'],
  vision: ['emotion', 'recommender', 'movie', 'cinema', 'film', 'webcam', 'facial', 'face', 'opencv', 'deepface', 'tmdb', 'mood'],
  data: ['cassendra', 'dataset', 'schema', 'database', 'sql', 'csv', 'visualization', 'analytics', 'query', 'table'],
};

const CONCEPT_KEYS = Object.keys(CONCEPT_CLUSTERS);

const STOPWORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'about',
  'as', 'into', 'like', 'through', 'after', 'over', 'between', 'out',
  'and', 'or', 'but', 'so', 'if', 'than', 'too', 'very', 'can', 'will',
  'just', 'should', 'now', 'what', 'which', 'who', 'whom', 'this', 'that',
  'these', 'those', 'am', 'do', 'does', 'did', 'doing', 'have', 'has',
  'had', 'having', 'he', 'him', 'his', 'me', 'my', 'you', 'your', 'tell',
  'show', 'give', 'please', 'any', 'how', 'many', 'much', 'where', 'when',
]);

function stemToken(token: string): string {
  let w = token.toLowerCase().replace(/[^a-z0-9+#.-]/g, '');
  if (w.length <= 3) return w;
  if (w.endsWith('ies') && w.length > 4) return w.slice(0, -3) + 'y';
  if (w.endsWith('ing') && w.length > 5) return w.slice(0, -3);
  if (w.endsWith('ed') && w.length > 4) return w.slice(0, -2);
  if (w.endsWith('es') && w.length > 4) return w.slice(0, -2);
  if (w.endsWith('s') && !w.endsWith('ss') && !w.endsWith('js')) return w.slice(0, -1);
  return w;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+.#-\s]/g, ' ')
    .split(/\s+/)
    .map(stemToken)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

function computeConceptVector(tokens: string[], rawText: string): number[] {
  const lower = rawText.toLowerCase();
  return CONCEPT_KEYS.map((key) => {
    const terms = CONCEPT_CLUSTERS[key];
    let weight = 0;
    for (const term of terms) {
      const stemmed = stemToken(term);
      if (tokens.includes(stemmed)) weight += 1.5;
      else if (lower.includes(term)) weight += 1.0;
    }
    return weight;
  });
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

const CORE_CHUNKS: RagChunk[] = [
  {
    id: 'DOSSIER-BIO',
    title: 'Md Moin Akhtar — Executive Profile',
    badge: 'SUBJECT // MMA-2026',
    category: 'overview',
    keywords: ['who', 'moin', 'akhtar', 'about', 'bio', 'summary', 'profile', 'recruiter', 'overview', 'developer', 'delhi', 'engineer'],
    summary:
      'Md Moin Akhtar is an AI & Full-Stack Software Developer based in New Delhi, India, pursuing a B.Tech in AI & Data Science at VIPS-TC (CGPA: 8.27). He is a published IEEE researcher and multi-hackathon winner.',
    details: [
      'Core focus: Full-stack web architecture (React, TypeScript, Next.js, FastAPI, Node.js) fused with applied AI agents, RAG pipelines, and computer vision.',
      'Published first-author IEEE research on sentence-level hallucination risk estimation in Generative AI (IEEE Xplore #11441054, ICAUC 2026).',
      'Won multiple hackathons including Hermes × GrowthX ($5,800 credits, 100+ Day-1 users), PromptWars | Innerve 2026 (1st Place at IGDTUW), Syndicate by Maximor ($100 GPU credits), and Paranox 2.0 (Top 10 National Finalist out of 200+ teams).',
    ],
    metrics: 'IEEE Author · 8.27 CGPA · Multi-Hackathon Winner',
    actions: [
      { label: 'Download Resume PDF', href: '/MdMoinAkhtar_Resume.pdf' },
      { label: 'View Projects', route: '/operations' },
      { label: 'View Awards & Proof', route: '/evidence' },
    ],
  },
  {
    id: 'DOSSIER-IEEE',
    title: 'Published IEEE Research — Hallucination Risk Estimator',
    badge: 'IEEE XPLORE // #11441054',
    category: 'research',
    keywords: ['research', 'paper', 'ieee', 'publication', 'hallucination', 'icauc', 'sentence', 'risk', 'estimator', 'generative', 'ai', '11441054', 'xplore'],
    summary:
      'Published "A Sentence-Level Risk Estimator for Identifying Hallucinations in Generative AI" at ICAUC 2026 (indexed in IEEE Xplore, Document #11441054).',
    details: [
      'Problem solved: Document-level hallucination checks miss localized fabrications (fake quotes, dates, or citations buried inside otherwise accurate paragraphs).',
      'Architecture: A Three-Signal Fusion Pipeline combining token-level uncertainty, semantic entailment consistency, and claim-level verification to score each sentence independently.',
      'Venue: 2026 International Conference on AI-Driven Smart Systems and Ubiquitous Computing (ICAUC).',
    ],
    metrics: 'IEEE Xplore Doc #11441054 · ICAUC 2026',
    actions: [
      { label: 'Read on IEEE Xplore', href: 'https://ieeexplore.ieee.org/document/11441054' },
      { label: 'View Research Evidence', route: '/evidence' },
    ],
  },
  {
    id: 'DOSSIER-HACKATHONS',
    title: 'Verified Hackathon Wins & National Placements',
    badge: 'COMPETITION ARCHIVE',
    category: 'hackathons',
    keywords: ['hackathon', 'wins', 'winner', 'won', 'awards', 'prizes', 'hermes', 'growthx', 'lazyclip', 'promptwars', 'innerve', 'igdtuw', 'devcation', 'syndicate', 'maximor', 'paranox', 'gpu', 'credits'],
    summary:
      'Moin has won and placed in multiple national hackathons and high-speed AI buildathons across 2025–2026:',
    details: [
      '1. Hermes × GrowthX Buildathon (2026) — WINNER ($5,800 Prize Credits): Built LazyClip.buzz in 8 hours, ran every demo live on stage, and reached 100+ signups on Day 1.',
      '2. PromptWars | Innerve 2026 (IGDTUW, Mar 2026) — 1ST PLACE CHAMPION: Engineered Devcation, a physics-driven interactive prompt chaining and live evaluation arena.',
      '3. Syndicate by Maximor — WINNER ($100 GPU Credits): Won the Syndicate hackathon hosted by Maximor, earning $100 in GPU compute credits.',
      '4. Paranox 2.0 National Hackathon (Nov 2025) — TOP 10 FINALIST: Qualified in the Top 10 national finalists out of 200+ teams nationwide in the Automation Track.',
    ],
    metrics: '$5,800+ Credits · $100 GPU · 1st Place IGDTUW · Top 10 Paranox',
    actions: [
      { label: 'Inspect Awards & Certificates', route: '/evidence' },
      { label: 'Open Evidence Wall', route: '/evidence-wall' },
    ],
  },
  {
    id: 'DOSSIER-SKILLS',
    title: 'Technical Arsenal & Engineering Stack',
    badge: 'CAPABILITIES // ARSENAL',
    category: 'skills',
    keywords: ['skills', 'tech', 'stack', 'languages', 'frameworks', 'tools', 'react', 'typescript', 'python', 'nextjs', 'fastapi', 'nodejs', 'tailwind', 'supabase', 'neo4j', 'solidity', 'opencv', 'deepface', 'ai', 'ml'],
    summary:
      'Full-stack TypeScript/Python engineer specializing in production AI systems, agentic workflows, and tactile frontend interfaces.',
    details: [
      'Frontend & UI Craft: React 19, TypeScript, Next.js 15, Tailwind CSS, Framer Motion, Matter.js 2D Physics, Vite.',
      'Backend & Databases: Python, FastAPI, Node.js, Express, Supabase (PostgreSQL), SQLite, Neo4j Graph DB, Upstash Redis, REST & WebSocket streaming.',
      'AI / ML & Computer Vision: LLM Orchestration, RAG Architectures, Hallucination Detection, OpenAI & Google Gemini SDKs, OpenCV, DeepFace, Scikit-Learn, TF-IDF.',
      'Web3 & Smart Contracts: Solidity, Monad Testnet, On-chain Escrow Protocols.',
    ],
    metrics: 'React · TypeScript · Python · FastAPI · AI Agents',
    actions: [
      { label: 'Explore Skills Page', route: '/capabilities' },
      { label: 'View GitHub Profile', href: 'https://github.com/MDMOINAKHTARR' },
    ],
  },
  {
    id: 'DOSSIER-EDUCATION',
    title: 'Education, Academic Standing & Certifications',
    badge: 'VIPS-TC // CGPA 8.27',
    category: 'education',
    keywords: ['education', 'college', 'university', 'degree', 'btech', 'vips', 'ggsipu', 'cgpa', 'gpa', 'grades', 'certificates', 'certification', 'data', 'science'],
    summary:
      'Pursuing a B.Tech in Artificial Intelligence & Data Science at VIPS-TC (Vivekananda Institute of Professional Studies - Technical Campus), New Delhi, with an 8.27 CGPA.',
    details: [
      'Degree: Bachelor of Technology (B.Tech) in Artificial Intelligence & Data Science at VIPS-TC, New Delhi.',
      'Academic Performance: 8.27 CGPA alongside published IEEE research and national hackathon wins.',
      'Verified Certifications: The Ultimate Job Ready Data Science Course & Data Science Foundations (2024).',
    ],
    metrics: 'B.Tech AI & Data Science · 8.27 CGPA',
    actions: [
      { label: 'Download Resume PDF', href: '/MdMoinAkhtar_Resume.pdf' },
      { label: 'View Certificates', route: '/evidence' },
    ],
  },
  {
    id: 'DOSSIER-CONTACT',
    title: 'Direct Contact, Resume & Hiring Availability',
    badge: 'COMMS // ACTIVE',
    category: 'contact',
    keywords: ['contact', 'email', 'hire', 'hiring', 'resume', 'cv', 'pdf', 'available', 'availability', 'internship', 'job', 'freelance', 'delhi', 'linkedin', 'github', 'leetcode', 'twitter', 'x'],
    summary:
      'Moin is actively open to software engineering, full-stack, and AI/ML roles, internships, and high-impact collaborations. Based in New Delhi, India.',
    details: [
      'Direct Email: mohdmoinakhtar081@gmail.com',
      'Resume / CV: Available immediately as a downloadable PDF (/MdMoinAkhtar_Resume.pdf).',
      'Public Profiles: GitHub (@MDMOINAKHTARR), LinkedIn (in/mdmoinakhtar), LeetCode (__moinn_), and X (@Moincrafted).',
    ],
    metrics: 'mohdmoinakhtar081@gmail.com · New Delhi, India',
    actions: [
      { label: 'Email Moin Directly', href: 'mailto:mohdmoinakhtar081@gmail.com' },
      { label: 'Open Resume PDF', href: '/MdMoinAkhtar_Resume.pdf' },
      { label: 'Go to Contact Page', route: '/comms' },
    ],
  },
];

// Convert all 8 projects in projectsData.ts into rich RAG chunks automatically
const PROJECT_CHUNKS: RagChunk[] = PROJECTS.map((p) => {
  const actions: RagAction[] = [{ label: `Inspect ${p.title}`, route: '/operations' }];
  if (p.liveUrl) actions.push({ label: 'Live Demo', href: p.liveUrl });
  if (p.githubUrl) actions.push({ label: 'GitHub Repo', href: p.githubUrl });
  if (p.youtubeUrl) actions.push({ label: 'Watch Video Demo', href: p.youtubeUrl });

  return {
    id: p.id,
    title: `${p.title} (${p.id}) — ${p.categoryLabel}`,
    badge: `${p.id} // ${p.status}`,
    category: 'projects',
    keywords: [
      p.id.toLowerCase(),
      ...p.title.toLowerCase().split(/\s+/),
      p.category,
      ...p.tech.map((t) => t.toLowerCase()),
      ...tokenize(`${p.tagline} ${p.desc} ${p.metrics || ''}`),
    ],
    summary: `${p.title}: ${p.tagline} ${p.desc}`,
    details: [
      `Tech Stack: ${p.tech.join(', ')}${p.metrics ? ` · Key Metric: ${p.metrics}` : ''}`,
      `Problem & Solution: ${p.caseEvidence.problem} ${p.caseEvidence.solution}`,
      `Outcome: ${p.caseEvidence.result}`,
    ],
    metrics: p.metrics || p.status,
    actions,
  };
});

export const ALL_DOSSIER_CHUNKS: RagChunk[] = [...CORE_CHUNKS, ...PROJECT_CHUNKS];

// Precompute BM25 document frequencies and dense concept vectors once at module load
interface IndexedChunk {
  chunk: RagChunk;
  tokens: string[];
  termFreq: Map<string, number>;
  conceptVec: number[];
  rawSearchText: string;
}

const DOC_FREQ = new Map<string, number>();
const INDEXED_CHUNKS: IndexedChunk[] = ALL_DOSSIER_CHUNKS.map((chunk) => {
  const rawSearchText = [
    chunk.title,
    chunk.badge,
    chunk.keywords.join(' '),
    chunk.summary,
    chunk.details.join(' '),
    chunk.metrics || '',
  ]
    .join(' ')
    .toLowerCase();

  const tokens = [
    ...tokenize(chunk.title),
    ...tokenize(chunk.title), // title 2x weight
    ...chunk.keywords.map(stemToken),
    ...tokenize(chunk.summary),
    ...tokenize(chunk.details.join(' ')),
  ];

  const termFreq = new Map<string, number>();
  for (const t of tokens) {
    termFreq.set(t, (termFreq.get(t) || 0) + 1);
  }

  for (const uniqueTerm of termFreq.keys()) {
    DOC_FREQ.set(uniqueTerm, (DOC_FREQ.get(uniqueTerm) || 0) + 1);
  }

  const conceptVec = computeConceptVector(tokens, rawSearchText);
  return { chunk, tokens, termFreq, conceptVec, rawSearchText };
});

const AVG_DOC_LEN =
  INDEXED_CHUNKS.reduce((sum, item) => sum + item.tokens.length, 0) / INDEXED_CHUNKS.length;

function computeBm25(queryTokens: string[], doc: IndexedChunk): number {
  const k1 = 1.5;
  const b = 0.75;
  const N = INDEXED_CHUNKS.length;
  let score = 0;

  for (const q of queryTokens) {
    const tf = doc.termFreq.get(q) || 0;
    if (tf === 0) continue;
    const df = DOC_FREQ.get(q) || 0.5;
    const idf = Math.log(1 + (N - df + 0.5) / (df + 0.5));
    const num = tf * (k1 + 1);
    const denom = tf + k1 * (1 - b + b * (doc.tokens.length / AVG_DOC_LEN));
    score += idf * (num / denom);
  }
  return score;
}

export const SUGGESTED_RAG_PROMPTS = [
  'Summarize Moin in 30 seconds',
  'Tell me about his IEEE hallucination paper',
  'What hackathons has Moin won?',
  'What are his best AI & full-stack projects?',
  'What is his tech stack & CGPA?',
  'How can I contact him or get his resume?',
] as const;

export function queryDossierRag(rawQuery: string, topK = 3): RagResponse {
  const t0 = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const query = rawQuery.trim();
  const lower = query.toLowerCase();
  const queryTokens = tokenize(query);
  const queryVec = computeConceptVector(queryTokens, lower);

  // Score every chunk with Hybrid BM25 + Concept Vector Cosine Similarity + Fuzzy Substring Boost
  const scored: RagRetrievedChunk[] = INDEXED_CHUNKS.map((doc) => {
    const rawBm25 = computeBm25(queryTokens, doc);
    const bm25Norm = Math.min(1, rawBm25 / 8.5);
    const semanticScore = cosineSimilarity(queryVec, doc.conceptVec);

    let phraseBoost = 0;
    for (const kw of doc.chunk.keywords) {
      if (kw.length >= 3 && lower.includes(kw.toLowerCase())) {
        phraseBoost += 0.14;
      }
    }
    if (lower.includes(doc.chunk.title.toLowerCase().split(' ')[0])) {
      phraseBoost += 0.25;
    }

    const total = bm25Norm * 0.52 + semanticScore * 0.48 + Math.min(0.45, phraseBoost);
    return {
      chunk: doc.chunk,
      score: Number(total.toFixed(3)),
      bm25Score: Number(bm25Norm.toFixed(3)),
      semanticScore: Number(semanticScore.toFixed(3)),
    };
  }).sort((a, b) => b.score - a.score);

  const topMatches = scored.filter((s) => s.score > 0.08).slice(0, topK);
  const effectiveMatches = topMatches.length > 0 ? topMatches : [scored[0], scored[1]].filter(Boolean);
  const primary = effectiveMatches[0].chunk;

  // Detect if user asked for all projects or a list of projects
  const wantsProjectList =
    /\b(projects|built|portfolio|apps|work|best|featured|show)\b/i.test(lower) &&
    !PROJECTS.some((p) => lower.includes(p.title.toLowerCase().split('.')[0]));

  let headline = primary.title;
  let answer = primary.summary;
  let bullets = [...primary.details];
  const actions: RagAction[] = [...primary.actions];

  if (wantsProjectList && primary.category === 'projects') {
    headline = 'Selected Field Operations — Featured Projects';
    answer =
      'Moin has engineered 8 full-stack, AI, computer vision, and Web3 systems. Here are the top highlights from the dossier:';
    bullets = [
      'LedgerForge (OP-410): Governed AI bank-to-ledger reconciliation platform with React, FastAPI & Supabase (112-Test Safety Suite).',
      'LazyClip.buzz (OP-001): Natural-language AI video editing pipeline turning longform video into vertical shorts (100+ Day-1 users; Hermes × GrowthX Winner).',
      'Relay Vault (OP-317): Decentralized AI agent marketplace with Solidity smart-contract escrow on Monad Testnet.',
      'Devcation (OP-012) & Halo AI (OP-109): 1st Place PromptWars physics arena (Matter.js) and sub-100ms streaming AI assistant.',
    ];
    actions.splice(
      0,
      actions.length,
      { label: 'Open Projects Page', route: '/operations' },
      { label: 'View GitHub (@MDMOINAKHTARR)', href: 'https://github.com/MDMOINAKHTARR' },
      { label: 'Download Resume PDF', href: '/MdMoinAkhtar_Resume.pdf' }
    );
  } else if (effectiveMatches.length > 1 && effectiveMatches[1].score >= effectiveMatches[0].score * 0.72) {
    // Multi-intent synthesis: weave second chunk's key detail and actions in if closely scored
    const secondary = effectiveMatches[1].chunk;
    if (secondary.id !== primary.id) {
      bullets = [...primary.details.slice(0, 2), `${secondary.title}: ${secondary.summary}`];
      for (const act of secondary.actions) {
        if (!actions.some((a) => a.label === act.label) && actions.length < 4) {
          actions.push(act);
        }
      }
    }
  }

  const t1 = typeof performance !== 'undefined' ? performance.now() : Date.now();
  return {
    query,
    intent: primary.category,
    headline,
    answer,
    bullets,
    citations: effectiveMatches,
    actions: actions.slice(0, 4),
    latencyMs: Math.max(1, Math.round(t1 - t0)),
  };
}
