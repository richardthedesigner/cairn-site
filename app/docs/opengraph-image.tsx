import { brandOg, OG_SIZE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Docs: Quickstart.";

export default function Image() {
  return brandOg("Quickstart.", "Docs");
}
