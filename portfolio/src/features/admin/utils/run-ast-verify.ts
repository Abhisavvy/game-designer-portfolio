/**
 * Smoke test for ASTManipulator (run from repo: npm run verify:ast-manipulator in portfolio/).
 */
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { fileURLToPath } from "url";

import { ASTManipulator } from "./ast-manipulator";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const siteContent = path.join(__dirname, "../../portfolio/data/site-content.ts");
const tmp = path.join(os.tmpdir(), `portfolio-ast-verify-${process.pid}.ts`);

function cleanup() {
  try {
    fs.unlinkSync(tmp);
  } catch {
    /* ignore */
  }
}

cleanup();
fs.copyFileSync(siteContent, tmp);

try {
  const m = new ASTManipulator(tmp);
  m.updateProject("tiles", { title: "Tiles (AST verify)" });
  const text = fs.readFileSync(tmp, "utf8");
  if (!text.includes("Tiles (AST verify)")) {
    throw new Error("updateProject did not write expected title");
  }

  m.updatePersonalInfo({ name: "AST Verify Name" });
  const text2 = fs.readFileSync(tmp, "utf8");
  if (!text2.includes("AST Verify Name")) {
    throw new Error("updatePersonalInfo did not write expected name");
  }

  const emptyPath = path.join(os.tmpdir(), `portfolio-ast-empty-${process.pid}.ts`);
  fs.writeFileSync(emptyPath, "export const x = 1;\n", "utf8");
  try {
    const empty = new ASTManipulator(emptyPath);
    empty.updatePersonalInfo({ name: "n" });
    throw new Error(
      "expected updatePersonalInfo to throw on missing defaultPortfolioContent",
    );
  } catch (e) {
    if (
      !(e instanceof Error) ||
      !e.message.includes("defaultPortfolioContent")
    ) {
      throw e;
    }
  } finally {
    fs.unlinkSync(emptyPath);
  }

  console.log("verify-ast-manipulator: ok");
} finally {
  cleanup();
}
