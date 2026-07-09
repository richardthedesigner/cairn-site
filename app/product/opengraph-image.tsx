import { brandOg, OG_SIZE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Product: The shelf behind the workshop.";

export default function Image() {
  return brandOg("The shelf behind the workshop.", "Product");
}
