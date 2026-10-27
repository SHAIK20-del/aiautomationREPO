"use client";
import dynamic from "next/dynamic";
import { Fallback } from "./fallback";
const Core = dynamic(() => import("./core"), {
  ssr: false,
  loading: () => (
    <div
      className="core-stage"
      role="img"
      aria-label="Intelligence Core: an architectural sculpture loading"
    >
      <Fallback />
    </div>
  ),
});
export function Scene() {
  return <Core />;
}
