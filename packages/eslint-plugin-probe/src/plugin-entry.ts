import type { ESLint } from "eslint";

import { ADAPTER_NAME, ADAPTER_VERSION } from "./constants.js";
import {
  recordPluginInitialization,
  recordPluginModuleEvaluation,
} from "./runtime-context.js";
import { fixedAnswerRule } from "./rule.js";

recordPluginModuleEvaluation();

const plugin = Object.freeze({
  meta: Object.freeze({
    name: ADAPTER_NAME,
    version: ADAPTER_VERSION,
  }),
  rules: Object.freeze({
    "fixed-answer": fixedAnswerRule,
  }),
}) satisfies ESLint.Plugin;

recordPluginInitialization();

export default plugin;
