import { brandOg, OG_SIZE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Live demo: Use it right now. No signup.";

export default function Image() {
  return brandOg("Use it right now. No signup.", "Live demo");
}
