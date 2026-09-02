"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * A media query is an external store, so it is read with the hook React
 * provides for external stores. Subscribing this way avoids the extra render
 * pass (and the cascading-render warning) that comes from setting state inside
 * an effect, and it gives a defined value on the server.
 */
export function useMediaQuery(query: string, serverValue: boolean): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const media = window.matchMedia(query);
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    },
    [query],
  );

  const getSnapshot = useCallback(
    () => window.matchMedia(query).matches,
    [query],
  );

  return useSyncExternalStore(subscribe, getSnapshot, () => serverValue);
}
