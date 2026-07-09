"use client";

import { useSyncExternalStore } from "react";
import { getStore } from "@/demo/store";

/** Subscribes the component to store mutations. Client-only (guarded by DemoApp's mount gate). */
export function useStore() {
  const store = getStore();
  useSyncExternalStore(store.subscribe, store.snapshot, () => 0);
  return store;
}
