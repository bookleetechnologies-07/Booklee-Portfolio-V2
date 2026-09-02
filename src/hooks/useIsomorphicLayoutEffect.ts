"use client";

import { useEffect, useLayoutEffect } from "react";

/**
 * GSAP set-up has to run before paint, otherwise elements flash in at their
 * natural position and then jump to the animation's start state. `useEffect` on
 * the server keeps React from warning during SSR.
 */
export const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;
