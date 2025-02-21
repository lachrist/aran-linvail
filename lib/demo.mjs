import { parse } from "acorn";
import { generate } from "astring";
import { setupile, instrument } from "aran";
import { createRuntime, toStandardAdvice } from "linvail/runtime";
import { dir as dirInner } from "node:console";

const {
  eval: evalGlobal,
  Object: { getOwnPropertyNames },
} = globalThis;

/**
 * @type {<O extends object>(record: O) => (keyof O)[]}
 */
const listKey = /** @type {any} */ (getOwnPropertyNames);

/**
 * @type {(value: unknown) => void}
 */
const dir = (value) => {
  dirInner(value, {
    showHidden: true,
    showProxy: true,
    depth: 2,
    colors: true,
  });
};

const advice_global_variable = "__advice__";

const intrinsics = evalGlobal(generate(setupile()));

const { library: _library, advice: linvail_specific_advice } = createRuntime(
  intrinsics,
  { dir },
);

const advice = toStandardAdvice(linvail_specific_advice);

const pointcut = listKey(advice);

// Update the standard advice here to include analysis-specific behavior
{
  const apply = advice["apply@around"];
  advice["apply@around"] = (state, callee, that, input, hash) => {
    dir({
      state,
      callee,
      that,
      input,
      hash,
    });
    return apply(state, callee, that, input, hash);
  };
}

/** @type {any} */ (globalThis)[advice_global_variable] = advice;

const content = `
  "use strict";
  const fac = (n) => n === 0 ? 1 : n * fac(n - 1);
  fac(3);
`;

dir({
  result: evalGlobal(
    generate(
      instrument(
        {
          path: "fac.mjs",
          kind: "eval",
          situ: { type: "global" },
          root: parse(content, { sourceType: "script", ecmaVersion: 2024 }),
        },
        {
          pointcut,
          advice_global_variable,
        },
      ),
    ),
  ),
});
