"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { buildReplay, type ReplayFrame } from "@/demo/replay";
import type { EventKind } from "@/demo/types";
import { getStore } from "@/demo/store";
import { useStore } from "./useStore";
import { timeAgo } from "./bits";

const KIND_META: Record<EventKind, { icon: string; label: string }> = {
  "asset.created": { icon: "＋", label: "captured" },
  "version.added": { icon: "↺", label: "versioned" },
  "asset.retrieved": { icon: "→", label: "retrieved" },
  "search.performed": { icon: "⌕", label: "searched" },
  "duplicate.warned": { icon: "≈", label: "duplicate stopped" },
  "status.changed": { icon: "✓", label: "status changed" },
};

function TypeLine({ text, speed = 14, onDone }: { text: string; speed?: number; onDone?: () => void }) {
  const [n, setN] = useState(0);
  const done = useRef(false);
  useEffect(() => {
    setN(0);
    done.current = false;
    const step = Math.max(1, Math.ceil(text.length / 60)); // cap total duration
    const t = setInterval(() => {
      setN((prev) => {
        const next = Math.min(text.length, prev + step);
        if (next === text.length && !done.current) {
          done.current = true;
          clearInterval(t);
          onDone?.();
        }
        return next;
      });
    }, speed);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);
  return (
    <span>
      {text.slice(0, n)}
      {n < text.length && <span className="animate-pulse">▌</span>}
    </span>
  );
}

interface PlayedFrame {
  frame: ReplayFrame;
  result?: { result: string; ok: boolean };
}

function ReplayConsole({ onDone }: { onDone: () => void }) {
  const [played, setPlayed] = useState<PlayedFrame[]>([]);
  const framesRef = useRef<ReplayFrame[]>([]);
  const idx = useRef(0);
  const endRef = useRef<HTMLDivElement>(null);

  const advance = useCallback(() => {
    const frames = framesRef.current;
    const i = idx.current;
    if (i >= frames.length) {
      onDone();
      return;
    }
    idx.current++;
    setPlayed((prev) => [...prev, { frame: frames[i] }]);
  }, [onDone]);

  useEffect(() => {
    framesRef.current = buildReplay();
    advance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [played]);

  // when the last frame's args finish typing, execute it, pause, then advance
  const runCurrent = useCallback(() => {
    setTimeout(() => {
      setPlayed((prev) => {
        const next = [...prev];
        const last = next[next.length - 1];
        if (last && !last.result) {
          next[next.length - 1] = { ...last, result: last.frame.run(getStore()) };
        }
        return next;
      });
      setTimeout(advance, 1400);
    }, 400);
  }, [advance]);

  return (
    <div className="rounded-lg bg-[#17171c] p-4 font-mono text-xs leading-relaxed text-[#d6d6dd]">
      <p className="mono-label text-[#93939f]">mcp session: claude-code → cairn</p>
      <div className="mt-3 max-h-80 space-y-4 overflow-y-auto pr-1">
        {played.map((p, i) => (
          <div key={i}>
            <p className="text-[#eeece7]">
              <span className="text-[#ffad9b]">tool</span>{" "}
              <TypeLine
                text={`${p.frame.tool}(${JSON.stringify(p.frame.args)})`}
                onDone={i === played.length - 1 && !p.result ? runCurrent : undefined}
              />
            </p>
            {p.result && (
              <>
                <p className={`mt-1 ${p.result.ok ? "text-[#7fc8ad]" : "text-[#e6a23c]"}`}>
                  {p.result.ok ? "✓" : "✗"} {p.result.result}
                </p>
                <p className="mt-1 text-[#93939f]">// {p.frame.narration}</p>
              </>
            )}
          </div>
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
}

export function Activity({ replayOnMount = false }: { replayOnMount?: boolean }) {
  const store = useStore();
  const [playing, setPlaying] = useState(replayOnMount);
  const [playedOnce, setPlayedOnce] = useState(false);
  const events = store.events(60);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div>
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-display text-base font-medium tracking-tight">Agent console</h3>
          {!playing && (
            <button type="button" onClick={() => setPlaying(true)} className="pill-primary !px-4 !py-2 text-xs">
              {playedOnce ? "Replay the agent session" : "Watch an agent use Cairn"}
            </button>
          )}
        </div>
        <p className="mt-1 text-xs text-muted">
          A scripted-but-real MCP session: every call below actually executes against this
          sandbox. Watch the feed and the review queue react.
        </p>
        <div className="mt-4">
          {playing ? (
            <ReplayConsole
              onDone={() => {
                setPlaying(false);
                setPlayedOnce(true);
              }}
            />
          ) : (
            <div className="flex h-40 items-center justify-center rounded-lg bg-[#17171c] font-mono text-xs text-[#93939f]">
              {playedOnce ? "session ended. Press replay to run it again" : "no session running"}
            </div>
          )}
        </div>
      </div>

      <div>
        <h3 className="font-display text-base font-medium tracking-tight">Activity feed</h3>
        <p className="mt-1 text-xs text-muted">Append-only. The audit trail is the product.</p>
        <ul className="mt-4 max-h-[26rem] divide-y divide-line overflow-y-auto border-y border-line pr-1">
          {events.map((e) => {
            const meta = KIND_META[e.kind];
            let detail = "";
            try {
              const p = JSON.parse(e.payload) as Record<string, unknown>;
              if (typeof p.title === "string") detail = p.title;
              else if (typeof p.query === "string")
                detail = `“${p.query}” · ${p.hits} hit${p.hits === 1 ? "" : "s"}`;
              if (e.kind === "duplicate.warned") detail = `“${p.attempted_title}”`;
              if (e.kind === "status.changed") detail = `${p.from} → ${p.to}`;
            } catch {
              /* leave detail blank */
            }
            return (
              <li key={e.id} className="flex items-center gap-3 py-2.5 text-xs">
                <span
                  className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md font-mono ${
                    e.kind === "duplicate.warned" ? "bg-[color-mix(in_oklab,var(--copper)_14%,transparent)] text-copper" : "bg-sunken text-muted"
                  }`}
                  aria-hidden
                >
                  {meta.icon}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="text-body">{meta.label}</span>
                  {detail && <span className="text-muted"> · {detail}</span>}
                </span>
                <span className="shrink-0 font-mono text-[10px] text-faint">{e.actor.split(":")[0]}</span>
                <span className="w-14 shrink-0 text-right text-faint">{timeAgo(e.ts)}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
