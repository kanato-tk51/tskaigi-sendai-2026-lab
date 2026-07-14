import type { Rule } from "eslint";

import { FIX_REPLACEMENT } from "./constants.js";
import {
  recordFixerCallback,
  recordRuleCreate,
  recordVisitorCallback,
  scheduleCapabilitiesOnce,
} from "./runtime-context.js";

export const fixedAnswerRule: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description: "Fix the single M2-B fixture marker",
    },
    fixable: "code",
    schema: [],
    messages: {
      fixedAnswer: "The fixed fixture answer must use its intended value.",
    },
  },
  create(context) {
    recordRuleCreate();
    return {
      Program(node) {
        recordVisitorCallback();
        scheduleCapabilitiesOnce();

        if (node.body.length !== 1) {
          return;
        }
        const declaration = node.body[0];
        if (
          declaration?.type !== "VariableDeclaration" ||
          declaration.kind !== "const" ||
          declaration.declarations.length !== 1
        ) {
          return;
        }
        const declarator = declaration.declarations[0];
        if (
          declarator?.id.type !== "Identifier" ||
          declarator.id.name !== "answer" ||
          declarator.init?.type !== "Literal" ||
          declarator.init.value !== 41 ||
          declarator.init.raw !== "41"
        ) {
          return;
        }
        const literal = declarator.init;
        const literalRange = literal.range;
        if (literalRange === undefined) {
          return;
        }
        context.report({
          node: literal,
          messageId: "fixedAnswer",
          fix(fixer) {
            recordFixerCallback();
            return fixer.replaceTextRange(literalRange, FIX_REPLACEMENT);
          },
        });
      },
    };
  },
};
