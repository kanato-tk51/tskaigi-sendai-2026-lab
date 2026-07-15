import type { FixedProvidedContext } from "./types.js";

declare module "vitest" {
  export interface ProvidedContext {
    readonly m2cVitestContext: FixedProvidedContext;
  }
}
