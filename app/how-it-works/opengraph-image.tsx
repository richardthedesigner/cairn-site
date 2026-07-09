import { brandOg, OG_SIZE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "How it works: Local-first. One daemon. Two doors.";

export default function Image() {
  return brandOg("Local-first. One daemon. Two doors.", "How it works");
}
