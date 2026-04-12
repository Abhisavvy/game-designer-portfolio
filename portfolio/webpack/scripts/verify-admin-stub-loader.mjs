#!/usr/bin/env node
/**
 * Smoke-test for admin-feature-prod-stub-loader export parsing (no webpack required).
 */
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const loaderPath = path.join(__dirname, "..", "admin-feature-prod-stub-loader.cjs");
const { __test } = require(loaderPath);
const { extractRuntimeExports, emitStubModule } = __test;

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

const sample = `
export type Foo = string;
export interface Bar {}
export const useThing = () => 1;
export function run() { return 2; }
export async function load() {}
export class Box {}
export { a as b, c };
export default function Page() { return null; }
`;

const map = extractRuntimeExports(sample);
assert(map.get("useThing") === "const", "useThing kind");
assert(map.get("run") === "function", "run kind");
assert(map.get("load") === "function", "load kind");
assert(map.get("Box") === "class", "Box kind");
assert(map.get("b") === "const", "b kind");
assert(map.get("c") === "const", "c kind");
assert(map.has("__defaultExport"), "default export");

const out = emitStubModule(map);
assert(out.includes("export default function AdminFeatureStubDefault"), "default stub");
assert(out.includes("export function run"), "named fn stub");
assert(out.includes("export const useThing = undefined"), "const stub");

console.log("admin-feature-prod-stub-loader verification OK");
