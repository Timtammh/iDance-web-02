import { useEffect, useState } from "react";

// IntroGate keeps pages mounted for video preloading, but their layout is hidden.
// Never measure ScrollTriggers until that entrance has completed.
export function useSiteEntered() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const sync = () => {
      const gate = document.querySelector<HTMLElement>("[data-site-phase]");
      if (!gate || gate.dataset.sitePhase === "entered") setReady(true);
    };
    sync();
    window.addEventListener("idance:entered", sync);
    return () => window.removeEventListener("idance:entered", sync);
  }, []);
  return ready;
}
