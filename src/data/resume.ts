export const profile = {
  name: 'Reza Gholizadeh',
  handle: 'reza',
  host: 'portfolio',
  role: 'Senior Software Engineer (Frontend & AI)',
  stack: 'Frontend Architecture · TypeScript · React · AI Agents · RAG',
  location: 'Tehran, Iran',
  available:
    'Currently at SnappFood · Open to exceptional senior, staff and AI-driven engineering opportunities',
  interests:
    'Outside of work, I enjoy playing chess, following football, exploring emerging AI technologies and spending time with family and friends.',
  summary:
    'Front-end engineer with 5+ years of experience building and scaling production web applications with TypeScript, React and Next.js for consumer products serving 5M+ active users and 500K+ daily orders. Passionate about building scalable frontend systems and exploring how AI can transform the way software is built and products are delivered. Experienced in AI agents, RAG systems and AI-powered developer tools, with a focus on translating AI capabilities into practical engineering improvements and measurable business impact.',
} as const;

export const contact = [
  { label: 'email', value: 'reza.viand1374@gmail.com', href: 'mailto:reza.viand1374@gmail.com' },
  {
    label: 'linkedin',
    value: 'linkedin.com/in/reza-gholizadeh-dev',
    href: 'https://linkedin.com/in/reza-gholizadeh-dev',
  },
  { label: 'location', value: 'Tehran, Iran', href: null },
] as const;

export type ExperienceBlock = { tag: string; body: string };

export type Experience = {
  role: string;
  company: string;
  period: string;
  location: string;
  /** Untagged lead paragraph, before the tagged blocks. */
  summary: string;
  blocks: ExperienceBlock[];
};

export const experience: Experience[] = [
  {
    role: 'Front-End Engineer',
    company: 'SnappFood',
    period: '2021 — Present',
    location: 'Tehran, Iran · Hybrid',
    summary:
      "Build and scale production web applications for Iran's leading food-delivery platform, serving 5M+ active users and 500K+ daily orders across desktop and mobile browsers.",
    blocks: [
      {
        tag: 'Frontend Platform',
        body: "Contributed to the full rewrite of SnappFood on Bonyan, the company's proprietary frontend platform and design system, using Turborepo, Next.js, TypeScript, React Query and Styled Components.",
      },
      {
        tag: 'Architecture',
        body: 'Decomposed the Menu domain from the Core application into an independently releasable application using build-time composition, reducing cross-domain coupling, limiting change blast radius and enabling more autonomous ownership and release cycles.',
      },
      {
        tag: 'Observability',
        body: 'Established frontend observability practices using Sentry and Grafana Faro, covering error tracking, performance monitoring and user-session visibility to improve production issue detection, diagnosis and resolution.',
      },
      {
        tag: 'Reliability',
        body: 'Strengthened frontend reliability through unit and end-to-end testing, automated quality gates and regression prevention across critical user flows and edge cases.',
      },
      {
        tag: 'AI Engineering',
        body: 'Built an AI-powered developer assistant using Claude Agent SDK, RAG, hybrid search and Qdrant, turning internal engineering knowledge and development workflows into an agentic interface and reducing friction in accessing technical knowledge and project context.',
      },
      {
        tag: 'Internal Tools',
        body: 'Built Bordar Panel to streamline order-assignment workflows for 2,000+ vendors, improving operational efficiency for vendor-facing teams.',
      },
      {
        tag: 'Internal Tools',
        body: 'Built a biker support ticketing platform that replaced 1,500+ daily inbound support calls with structured digital workflows, improving support scalability and reducing reliance on manual operations.',
      },
    ],
  },
];

export type Project = {
  name: string;
  period: string;
  url: string | null;
  blocks: ExperienceBlock[];
};

export const projects: Project[] = [
  {
    name: 'SnappFood Contact Center — AI Call Quality Assurance',
    period: '2026',
    url: null,
    blocks: [
      {
        tag: 'AI Pipeline',
        body: 'Automated QA auditor for recorded contact-centre calls: audio → speech-to-text → diarization → transcript → rule engine + RAG + LLM → guardrails → deterministic scoring. Agents are scored against a versioned QA framework and the policies retrieved for that specific call.',
      },
      {
        tag: 'Architecture',
        body: 'Modular monolith on Node.js 22, TypeScript and Fastify with BullMQ background workers; PostgreSQL 16 with pgvector serving as both relational store and vector index, and MinIO holding audio outside the database.',
      },
      {
        tag: 'Reliability',
        body: 'Every provider — STT, diarization, LLM, embeddings, vector store — sits behind an interface with a deterministic local fallback, so the pipeline completes end to end without a GPU and records a degraded run rather than silently fabricating output.',
      },
    ],
  },
  {
    name: 'Hamfekr — Codebase Agent for Grooming and Planning',
    period: '2026',
    url: null,
    blocks: [
      {
        tag: 'AI Agent',
        body: "Answers the questions a team would otherwise put to a front-end engineer during grooming: what a change requires and whether it is light or heavy. Reads the product's real repository per question rather than answering from memory.",
      },
      {
        tag: 'Product',
        body: 'Replies in product language rather than code, and deliberately refuses to give time estimates — it reports effort and reasoning, leaving the estimate to the team.',
      },
      {
        tag: 'Constraints',
        body: "Strictly read-only: the agent never modifies a file. Conversations stay in the asker's own browser, so planning talk about a private codebase never leaves the machine.",
      },
    ],
  },
  {
    name: 'Vanda — English Practice Partner Platform',
    period: '2024 — Present',
    url: 'https://vanda.my',
    blocks: [
      {
        tag: 'Frontend',
        body: 'Leading an incremental React + TypeScript + Vite rewrite of a server-rendered Blade UI, migrating one route at a time behind an nginx boundary so any page can be reverted without a deploy.',
      },
      {
        tag: 'Real-time',
        body: 'Built the real-time chat surface — voice notes with transcription, photos, reactions, read receipts, typing and presence — over self-hosted WebSockets.',
      },
    ],
  },
  {
    name: 'Kamargardan — Medical Content Platform',
    period: '2023 — 2024',
    url: 'https://kamargardan.com',
    blocks: [
      {
        tag: 'Performance',
        body: 'Raised the home page performance score from 30% to over 90% and reached a 100% SEO score through Core Web Vitals work, SSR improvements, code-splitting and bundle optimization.',
      },
    ],
  },
  {
    name: 'Macan Dental — Medical Content Platform',
    period: '2024',
    url: 'https://macandental.com',
    blocks: [
      {
        tag: 'Performance',
        body: 'Raised the Lighthouse performance score from 45 to over 95, and repaired the broken server-side rendering so pages ship server-rendered HTML instead of leaving the client to paint them.',
      },
    ],
  },
];

/** Skills are listed, not scored — a self-assigned proficiency number tells a
    reader nothing they can verify. */
export type SkillGroup = { category: string; skills: string[] };

export const skillGroups: SkillGroup[] = [
  { category: 'Languages', skills: ['TypeScript', 'JavaScript (ES2023)', 'HTML & CSS'] },
  { category: 'Frameworks', skills: ['React', 'Next.js', 'React Query', 'Redux'] },
  {
    category: 'AI',
    skills: [
      'LLMs',
      'AI Agents',
      'Claude Agent SDK',
      'RAG',
      'Hybrid Search',
      'Qdrant',
      'Embeddings',
      'TEI',
      'Prompt Engineering',
    ],
  },
  { category: 'Styling', skills: ['Styled Components', 'Tailwind CSS', 'Design Systems'] },
  {
    category: 'Architecture',
    skills: ['Monorepo (Turborepo)', 'Module Federation', 'Micro-frontends'],
  },
  { category: 'Quality', skills: ['Jest', 'Playwright', 'Core Web Vitals'] },
  { category: 'Tooling', skills: ['Git', 'CI/CD', 'Docker'] },
];

export type Education = { degree: string; institution: string; period: string };

export const education: Education[] = [
  {
    degree: 'M.A. Business Administration',
    institution: 'Islamic Azad University, Central Tehran Branch',
    period: '2021 — 2024',
  },
  {
    degree: 'B.Sc. Electrical Engineering',
    institution: 'Islamic Azad University, West Tehran Branch',
    period: '2014 — 2020',
  },
];
