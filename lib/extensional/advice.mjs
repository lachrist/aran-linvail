import { WeakMap } from "linvail/library";
import { log } from "node:console";

let counter = 0;

const indexing = new WeakMap();

/**
 * @type {import("aran").StandardAdvice}
 */
export const advice = {
  "apply@around": (_state, callee, that, input, location) => {
    if (callee === log && input.length > 0) {
      const arg0 = input[0];
      if (typeof arg0 === "number" && isNaN(arg0)) {
        log(`Logging NaN#${indexing.get(arg0) ?? "???"}`);
      }
    }
    /** @type {unknown} */
    const result = Reflect.apply(/** @type {function} */ (callee), that, input);
    if (typeof result === "number" && isNaN(result)) {
      const index = indexing.get(result) ?? counter++;
      indexing.set(result, index);
      log(
        `NaN#${index} := ${
          /** @type {function} */ (callee).name
        }(${input.map(String).join(", ")}) @${location}`,
      );
    }
    return result;
  },
};
