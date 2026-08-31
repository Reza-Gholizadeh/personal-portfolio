import { useLayoutEffect, type RefObject } from 'react';

/** Breathing room above the entry parked at the top of the screen. */
const OFFSET_PX = 16;

/**
 * Parks the newest entry at the top of the screen so long output is read from
 * its start, rather than dumping the reader at the tail of it.
 *
 * Scrolls the container directly — scrollIntoView would move the page behind it
 * too.
 */
export function useScrollToLatest(
  container: RefObject<HTMLElement | null>,
  latest: RefObject<HTMLElement | null>,
  trigger: unknown,
  smooth: boolean,
) {
  useLayoutEffect(() => {
    const screen = container.current;
    if (!screen) return;
    screen.scrollTo({
      top: latest.current ? Math.max(0, latest.current.offsetTop - OFFSET_PX) : 0,
      behavior: smooth ? 'smooth' : 'auto',
    });
  }, [container, latest, trigger, smooth]);
}
