import { compileIntrinsicRecord } from "aran/runtime";
import {
  createRegion,
  createLibrary,
  exposeLibrary,
  registerAranIntrinsicRecord,
  createCustomAdvice,
} from "linvail/runtime";
import {
  analysis_advice_global_variable,
  intrinsic_global_variable,
  provenance_advice_global_variable,
} from "./bridge.mjs";

let counter = 0;

const region = createRegion(globalThis, {
  wrapPrimitive: (primitive) => ({
    type: "primitive",
    inner: primitive,
    index: counter++,
  }),
});

exposeLibrary(createLibrary(region), { global: globalThis });

const intrinsics = compileIntrinsicRecord(globalThis);

registerAranIntrinsicRecord(region, intrinsics);

/** @type {any} */ (globalThis)[intrinsic_global_variable] = intrinsics;

/** @type {any} */ (globalThis)[provenance_advice_global_variable] =
  createCustomAdvice(region);

/** @type {{advice: unknown}} */
const { advice } = await import("./advice.instr.mjs");

/** @type {any} */ (globalThis)[analysis_advice_global_variable] = advice;
