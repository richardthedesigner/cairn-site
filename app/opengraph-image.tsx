import { brandOg, OG_SIZE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Home: Your AI makes great work. Cairn keeps it.";

export default function Image() {
  return brandOg("Your AI makes great work. Cairn keeps it.", "Home");
}
