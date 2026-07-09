import { brandOg, OG_SIZE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Pricing: Honest about what exists.";

export default function Image() {
  return brandOg("Honest about what exists.", "Pricing");
}
