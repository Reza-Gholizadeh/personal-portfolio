export const profile = {
  name: 'Reza Gholizadeh',
  handle: 'reza',
  host: 'portfolio',
  role: 'Senior Front-End Engineer',
  stack: 'TypeScript · React · Next.js',
  location: 'Tehran, Iran',
  available: 'Open to senior / staff front-end roles',
  summary:
    'Front-end engineer with 5+ years building and scaling production web applications with TypeScript, React and Next.js for consumer products serving 5M+ active users and 500K+ daily orders. Focused on frontend architecture, design systems, monorepos and micro-frontends — with performance, state management and reliability as first-class concerns.',
} as const;

export const contact = [
  { label: 'email', value: 'reza.viand1374@gmail.com', href: 'mailto:reza.viand1374@gmail.com' },
  { label: 'linkedin', value: 'linkedin.com/in/reza-gholizadeh-dev', href: 'https://linkedin.com/in/reza-gholizadeh-dev' },
  { label: 'location', value: 'Tehran, Iran', href: null },
] as const;

export const stats = [
  { value: '5M+', label: 'active users served' },
  { value: '500K+', label: 'daily orders handled' },
  { value: '2,000+', label: 'vendors on Bordar Panel' },
  { value: '1,500+', label: 'daily support calls replaced' },
  { value: '30% → 90%', label: 'Lighthouse perf lift (Kamargardan)' },
  { value: '5+', label: 'years shipping production front-end' },
] as const;

export type ExperienceBlock = { tag: string; body: string };

export type Experience = {
  role: string;
  company: string;
  period: string;
  location: string;
  blocks: ExperienceBlock[];
};

export const experience: Experience[] = [
  {
    role: 'Front-End Engineer',
    company: 'SnappFood',
    period: '2021 — Present',
    location: 'Tehran, Iran · Hybrid',
    blocks: [
      {
        tag: 'Platform',
        body: "Build and maintain production web applications for Iran's leading food-delivery platform, serving 5M+ active users and 500K+ daily orders across desktop and mobile browsers.",
      },
      {
        tag: 'Design System',
        body: "Contributed to the full rewrite of SnappFood on Bonyan, the company's proprietary design system and frontend platform, built with Turborepo, Next.js, TypeScript, React Query and Styled Components.",
      },
      {
        tag: 'Architecture',
        body: 'Decomposed the Menu domain out of the Core application into an independently releasable micro-frontend using Webpack Module Federation, reducing cross-domain coupling and increasing team ownership.',
      },
      {
        tag: 'Reliability',
        body: 'Improved frontend reliability through unit and end-to-end testing and automated quality checks, focused on critical user flows, edge cases and regression prevention.',
      },
      {
        tag: 'Internal Tools',
        body: 'Built the Bordar Panel to streamline order-assignment workflows for 2,000+ vendors.',
      },
      {
        tag: 'Internal Tools',
        body: 'Built a biker support ticketing platform that replaced 1,500+ daily inbound support calls with structured digital workflows.',
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
    name: 'Kamargardan — Medical Content Platform',
    period: '2023 — 2024',
    url: 'https://kamargardan.com',
    blocks: [
      {
        tag: 'Performance',
        body: 'Raised the home page performance score from 30% to over 90% and reached a 100% SEO score through Core Web Vitals work, SSR improvements, code-splitting and bundle optimization.',
      },
      {
        tag: 'Frontend',
        body: 'Refactored core pages in Next.js and built responsive, mobile-first interfaces with Tailwind CSS for consistent experiences across devices.',
      },
    ],
  },
  {
    name: 'Vanda — English Practice Partner Platform',
    period: '2024 — Present',
    url: 'https://vanda.my',
    blocks: [
      {
        tag: 'Product',
        body: 'Platform where English learners find a practice partner by level, interests and availability, send practice invitations, and then talk in text and voice with an AI coach available on any message.',
      },
      {
        tag: 'Frontend',
        body: 'Leading an incremental React + TypeScript + Vite rewrite of a server-rendered Blade UI, migrating one route at a time behind an nginx boundary so any page can be reverted without a deploy.',
      },
      {
        tag: 'Real-time',
        body: 'Built the real-time chat surface — voice notes with transcription, photos, reactions, replies, read receipts, typing and presence — over self-hosted WebSockets.',
      },
      {
        tag: 'Design System',
        body: 'Established the shared token layer and component set driving the rewrite, keeping the migrated React routes visually identical to the Blade pages still in production.',
      },
    ],
  },
  {
    name: 'Macan Dental — Medical Content Platform',
    period: '2024',
    url: 'https://macandental.com',
    blocks: [
      // TODO(reza): re-run Lighthouse and replace this qualitative line with the real
      // before/after figures, matching the shape of the Kamargardan entry above —
      // e.g. 'Raised the performance score from XX% to YY% ...'. Numbers on a résumé
      // get asked about in interviews, so these should be measured, not estimated.
      {
        tag: 'Performance',
        body: 'Reworked the front-end delivery path — image optimization, render-blocking asset removal, caching strategy and Core Web Vitals work — to cut load time on the pages that drive appointment bookings.',
      },
      {
        tag: 'Frontend',
        body: 'Tightened the responsive layout and mobile rendering path so the booking flow holds up on low-end devices and slower networks.',
      },
    ],
  },
];

/** level is 0–10 and drives the ASCII proficiency bar. */
export type Skill = { name: string; level: number };
export type SkillGroup = { category: string; skills: Skill[] };

export const skillGroups: SkillGroup[] = [
  {
    category: 'Languages',
    skills: [
      { name: 'TypeScript', level: 9 },
      { name: 'JavaScript (ES2023)', level: 9 },
      { name: 'HTML & CSS', level: 9 },
    ],
  },
  {
    category: 'Frameworks',
    skills: [
      { name: 'React', level: 9 },
      { name: 'Next.js', level: 9 },
      { name: 'React Query', level: 8 },
      { name: 'Redux', level: 7 },
    ],
  },
  {
    category: 'Styling',
    skills: [
      { name: 'Styled Components', level: 8 },
      { name: 'Tailwind CSS', level: 8 },
      { name: 'Design Systems', level: 8 },
    ],
  },
  {
    category: 'Architecture',
    skills: [
      { name: 'Monorepo (Turborepo)', level: 8 },
      { name: 'Module Federation', level: 7 },
      { name: 'Micro-frontends', level: 7 },
    ],
  },
  {
    category: 'Quality',
    skills: [
      { name: 'Jest', level: 8 },
      { name: 'Playwright', level: 7 },
      { name: 'Core Web Vitals', level: 8 },
    ],
  },
  {
    category: 'Tooling',
    skills: [
      { name: 'Git', level: 9 },
      { name: 'CI/CD', level: 7 },
      { name: 'Docker', level: 6 },
    ],
  },
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
