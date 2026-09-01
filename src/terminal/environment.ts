/**
 * A snapshot of what the browser tells us about this visit.
 *
 * Reading these APIs is a side effect, so it happens here at the boundary and
 * the result is handed to the reducer as plain data — `sessionReducer` stays a
 * pure function of (state, action).
 *
 * What this deliberately does NOT read: the Battery API (dropped by Firefox and
 * Safari precisely because it enabled fingerprinting), geolocation, and the
 * user-agent string. Everything below is either a preference the page already
 * honours or a coarse capability hint, and none of it leaves the browser.
 */
export type Environment = {
  viewport: string;
  display: string;
  motion: string;
  language: string;
  timezone: string;
  platform: string | null;
  network: string | null;
};

const ask = (query: string) => window.matchMedia(query).matches;

/** Chromium's structured replacement for UA sniffing; absent elsewhere. */
type UserAgentData = { brands?: { brand: string; version: string }[]; platform?: string };
type NetworkInformation = { effectiveType?: string; saveData?: boolean };

/** The brand list carries decoy entries; the real engine is the longest name. */
function describePlatform(): string | null {
  const data = (navigator as Navigator & { userAgentData?: UserAgentData }).userAgentData;
  if (!data?.brands?.length) return null;

  const brand = data.brands
    .map((entry) => entry.brand)
    .filter((name) => !/not.a.brand/i.test(name))
    .sort((a, b) => b.length - a.length)[0];

  if (!brand) return null;
  return data.platform ? `${brand} on ${data.platform}` : brand;
}

function describeNetwork(): string | null {
  const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
  if (!connection?.effectiveType) return null;
  return connection.saveData ? `${connection.effectiveType} · data saver on` : connection.effectiveType;
}

export function readEnvironment(): Environment {
  return {
    // Orientation is derived from the viewport rather than read from
    // screen.orientation: that reports the physical screen, which can disagree
    // with the box the page is actually laying out against.
    viewport: `${window.innerWidth} × ${window.innerHeight} css px · ${
      window.innerWidth >= window.innerHeight ? 'landscape' : 'portrait'
    }`,
    display: `${window.devicePixelRatio}× dpr · ${ask('(prefers-color-scheme: dark)') ? 'dark' : 'light'}`,
    motion: ask('(prefers-reduced-motion: reduce)') ? 'reduced — animations disabled for you' : 'full',
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    platform: describePlatform(),
    network: describeNetwork(),
  };
}
