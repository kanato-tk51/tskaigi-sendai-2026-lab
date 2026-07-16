declare module "@tskaigi-lab/adapter-vite-plugin/plugin" {
  import type { Plugin } from "vite";

  export function createViteProbePlugin(): Promise<Plugin>;
}
