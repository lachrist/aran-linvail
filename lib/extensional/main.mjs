import { instrumentBase, instrumentMeta } from "./instrument.mjs";

Error.stackTraceLimit = Infinity;

await instrumentBase(
  new URL("./target.mjs", import.meta.url),
  new URL("./target.instr.mjs", import.meta.url),
);

await instrumentMeta(
  new URL("./advice.mjs", import.meta.url),
  new URL("./advice.instr.mjs", import.meta.url),
);

await import("./setup.mjs");

await import("./target.instr.mjs");
