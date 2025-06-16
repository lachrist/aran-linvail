import { instrument } from "./instrument.mjs";

Error.stackTraceLimit = Infinity;

await instrument(
  new URL("./target.mjs", import.meta.url),
  new URL("./target.instr.mjs", import.meta.url),
);

await import("./setup.mjs");

await import("./target.instr.mjs");
