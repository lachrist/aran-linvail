import { createRegion, createMembrane } from "linvail";
import { log } from "node:console";

let counter = 0;

const region = createRegion(globalThis, {
  wrapPrimitive: (primitive) => ({
    type: "primitive",
    inner: primitive,
    index: counter++,
  }),
});

const { apply, wrap } = createMembrane(region);

const wrapper = apply(
  wrap(/** @type {any} */ (globalThis.Array.of)),
  wrap(null),
  [wrap(789), wrap(456), wrap(123)],
);

/** @type {number[]} */ (/** @type {unknown} */ (wrapper.inner)).sort();

log(wrapper);
