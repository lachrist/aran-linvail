import { compileIntrinsicRecord } from "aran/runtime";
import { dir } from "node:console";
import {
  createMembrane,
  createRegion,
  createStandardAdvice,
  registerAranIntrinsicRecord,
} from "linvail/runtime";
import {
  advice_global_variable,
  intrinsic_global_variable,
} from "./bridge.mjs";

let counter = 0;

const region = createRegion(globalThis, {
  wrapPrimitive: (primitive) => ({
    type: "primitive",
    inner: primitive,
    index: counter++,
  }),
});

const { apply } = createMembrane(region);

const intrinsics = compileIntrinsicRecord(globalThis);

registerAranIntrinsicRecord(region, intrinsics);

/** @type {import("linvail").StandardAdvice<string>} */
const advice = {
  ...createStandardAdvice(region),
  "apply@around": (_state, callee, that, input, location) => {
    const result = apply(callee, that, input);
    dir({ callee, that, input, result, location });
    return result;
  },
};

/** @type {any} */ (globalThis)[intrinsic_global_variable] = intrinsics;
/** @type {any} */ (globalThis)[advice_global_variable] = advice;
