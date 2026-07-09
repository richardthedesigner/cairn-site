"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { site } from "@/lib/site";

/**
 * Primary header CTA. Probes the local Cairn daemon; if it answers, this is a
 * power user, so send them to their real app. Otherwise fall back to the sandbox.
 * http://localhost is exempt from mixed-content blocking, so the probe works
 * from the https site.
 */
export function OpenApp({ className = "pill-primary" }: { className?: string }) {
  const router = useRouter();
  const [probing, setProbing] = useState(false);

  async function open() {
    if (probing) return;
    setProbing(true);
    try {
      // targetAddressSpace opts into Chrome's Local Network Access flow: the
      // browser shows a one-time permission prompt before allowing a public
      // site to reach loopback.
      const res = await fetch(site.healthEndpoint, {
        signal: AbortSignal.timeout(2500),
        targetAddressSpace: "loopback",
      } as RequestInit);
      const body = (await res.json()) as { ok?: boolean };
      if (body.ok) {
        window.location.href = site.localApp;
        return;
      }
    } catch {
      /* no local daemon; sandbox it is */
    } finally {
      setProbing(false);
    }
    router.push("/demo?fallback=1");
  }

  return (
    <button type="button" onClick={open} className={className} disabled={probing}>
      {probing ? "Looking for Cairn…" : "Open app"}
    </button>
  );
}
