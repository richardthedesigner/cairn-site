import type { Metadata } from "next";
import { Suspense } from "react";
import { DemoApp } from "@/components/demo/DemoApp";

export const metadata: Metadata = {
  title: "Live demo",
  description:
    "Use Cairn right now, in your browser, no signup. Search a real corpus, diff versions, approve drafts, and watch an agent work through MCP.",
  alternates: { canonical: "/demo" },
};

export default function DemoPage() {
  return (
    <main className="flex flex-1 flex-col">
      <Suspense fallback={null}>
        <DemoApp />
      </Suspense>
    </main>
  );
}
