"use client";

import { useEffect, useState } from "react";

/**
 * `true` only for mouse/trackpad-class pointers (`pointer: fine`). Used to
 * gate the holographic tilt/foil effects, which are meaningless on touch.
 * Defaults to `false` so server-rendered/first-paint markup never assumes a
 * fine pointer is present.
 */
export function useFinePointer(): boolean {
  const [fine, setFine] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    const update = () => setFine(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return fine;
}
