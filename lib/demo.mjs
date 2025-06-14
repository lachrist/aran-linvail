import { parse } from "acorn";
import { generate } from "astring";
import { setupile, instrument } from "aran";
import {
  createRegion,
  createStandardAdvice,
  createReflect,
} from "linvail/runtime";
import { standard_pointcut as pointcut } from "linvail/instrument";
import { dir } from "node:console";

const { eval: evalGlobal } = globalThis;

const advice_global_variable = "__advice__";

const intrinsics = evalGlobal(generate(setupile()));

const options = {
  showHidden: true,
  showProxy: true,
  depth: 2,
  colors: true,
};

let counter = 0;

const region = createRegion(intrinsics, {
  dir: (value) => {
    dir(value, options);
  },
  wrapPrimitive: (primitive) => ({
    type: "primitive",
    inner: primitive,
    index: counter++,
  }),
});

const { apply } = createReflect(region);

/** @type {import("linvail").StandardAdvice<string>} */
const advice = {
  ...createStandardAdvice(region),
  "apply@around": (state, callee, that, input, hash) => {
    const result = apply(callee, that, input);
    dir({ state, callee, that, input, hash, result }, options);
    return result;
  },
};

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
        { pointcut, advice_global_variable },
      ),
    ),
  ),
});
