import { transpile, retropile, weaveStandard } from "aran";
import { weave as weaveCustom } from "linvail/instrument";
import { readFile, writeFile } from "node:fs/promises";
import { parse } from "acorn";
import { generate } from "astring";
import {
  analysis_advice_global_variable,
  provenance_advice_global_variable,
  intrinsic_global_variable,
  analysis_pointcut,
} from "./bridge.mjs";

/**
 * @type {(
 *   input: URL,
 *   output: URL,
 * ) => Promise<void>}
 */
export const instrumentBase = async (input, output) => {
  await writeFile(
    output,
    "// @ts-nocheck\n" +
      generate(
        retropile(
          weaveCustom(
            weaveStandard(
              transpile({
                path: input.pathname.split("/").at(-1),
                kind: "module",
                root: parse(await readFile(input, "utf8"), {
                  ecmaVersion: "latest",
                  sourceType: "module",
                }),
              }),
              {
                pointcut: analysis_pointcut,
                advice_global_variable: analysis_advice_global_variable,
              },
            ),
            { advice_global_variable: provenance_advice_global_variable },
          ),
          { intrinsic_global_variable },
        ),
      ),
  );
};

/**
 * @type {(
 *   input: URL,
 *   output: URL,
 * ) => Promise<void>}
 */
export const instrumentMeta = async (input, output) => {
  await writeFile(
    output,
    "// @ts-nocheck\n" +
      generate(
        retropile(
          weaveCustom(
            transpile({
              path: input.pathname.split("/").at(-1),
              kind: "module",
              root: parse(await readFile(input, "utf8"), {
                ecmaVersion: "latest",
                sourceType: "module",
              }),
            }),
            { advice_global_variable: provenance_advice_global_variable },
          ),
          { intrinsic_global_variable },
        ),
      ),
  );
};
