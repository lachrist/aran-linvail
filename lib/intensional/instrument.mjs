import { transpile, retropile, weaveStandard } from "aran";
import { readFile, writeFile } from "node:fs/promises";
import { parse } from "acorn";
import { generate } from "astring";
import {
  advice_global_variable,
  intrinsic_global_variable,
  pointcut,
} from "./bridge.mjs";

/**
 * @type {(
 *   input: URL,
 *   output: URL,
 * ) => Promise<void>}
 */
export const instrument = async (input, output) => {
  await writeFile(
    output,
    "// @ts-nocheck\n" +
      generate(
        retropile(
          weaveStandard(
            transpile({
              path: input.pathname.split("/").at(-1),
              kind: "module",
              root: parse(await readFile(input, "utf8"), {
                ecmaVersion: "latest",
                sourceType: "module",
              }),
            }),
            { pointcut, advice_global_variable },
          ),
          { intrinsic_global_variable },
        ),
      ),
  );
};
