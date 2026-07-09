"use client";

import { marked } from "marked";
import { useMemo } from "react";

/* Renders seed/demo content only, authored in this repo, not user input. */
export function Markdown({ content }: { content: string }) {
  const html = useMemo(() => marked.parse(content, { async: false }), [content]);
  return <div className="prose-cairn text-sm" dangerouslySetInnerHTML={{ __html: html }} />;
}

export function CodeBlock({ content }: { content: string }) {
  return (
    <pre className="overflow-x-auto rounded-lg border border-line bg-sunken p-4 font-mono text-xs leading-relaxed">
      <code>{content}</code>
    </pre>
  );
}

export function ImagePreview({ content, title }: { content: string; title: string }) {
  if (content.startsWith("data:image/")) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- data URI from seed corpus
      <img src={content} alt={title} className="w-full max-w-md rounded-media border border-line" />
    );
  }
  return <CodeBlock content={content} />;
}
