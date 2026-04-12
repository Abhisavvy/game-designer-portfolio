/**
 * Node-only: reads/writes `site-content.ts` via the TypeScript AST.
 * Do not import from Client Components.
 *
 * ## String-literal limitation (read + merge paths)
 *
 * When **reading** existing values from object literals (e.g. merging a project patch),
 * only **string literals** and **no-substitution template literals** (`\`like this\``)
 * are interpreted. Other expressions are **ignored on read** (value treated as absent)
 * unless {@link readObjectStringFields} is called with `strictKeys`, in which case a
 * **known** field using e.g. identifiers, template strings with `${…}`, or arbitrary
 * expressions causes a **thrown error** so merges do not silently drop data.
 *
 * **Writes** always emit `factory.createStringLiteral(...)`.
 */

import * as fs from "fs";
import * as ts from "typescript";

import type { AdminPersonalInfo } from "../types/admin";
import type { ProjectItem } from "@/features/portfolio/data/site-content";

const DEFAULT_CONTENT_VAR = "defaultPortfolioContent";

const PROJECT_ITEM_STRING_KEYS = [
  "slug",
  "title",
  "tag",
  "blurb",
  "href",
  "externalUrl",
] as const satisfies readonly (keyof ProjectItem)[];

const PERSON_SCALAR_KEYS = [
  "name",
  "role",
  "tagline",
  "email",
  "phone",
  "location",
] as const satisfies readonly (keyof AdminPersonalInfo)[];

type ReadStringFieldsOptions = {
  /**
   * If set, any of these property names on the object must use a string literal or
   * no-substitution template literal, or this function throws (see module doc).
   */
  strictKeys?: readonly string[];
  /** Shown in strict-mode errors (file path, “project slug …”, etc.). */
  strictContext?: string;
};

function getStringLiteralText(node: ts.Expression): string | undefined {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    return node.text;
  }
  return undefined;
}

function readObjectStringFields(
  obj: ts.ObjectLiteralExpression,
  options?: ReadStringFieldsOptions,
): Record<string, string> {
  const out: Record<string, string> = {};
  const ctx = options?.strictContext ?? "object literal";

  for (const prop of obj.properties) {
    if (!ts.isPropertyAssignment(prop)) continue;
    const nameNode = prop.name;
    if (!ts.isIdentifier(nameNode) && !ts.isStringLiteral(nameNode)) continue;
    const key = ts.isIdentifier(nameNode) ? nameNode.text : nameNode.text;
    const text = getStringLiteralText(prop.initializer);
    if (options?.strictKeys?.includes(key) && text === undefined) {
      throw new Error(
        `ASTManipulator: cannot read "${key}" in ${ctx}: only string literals and ` +
          `no-substitution template literals are supported (see ast-manipulator.ts module doc).`,
      );
    }
    if (text !== undefined) out[key] = text;
  }
  return out;
}

function readProjectItemFieldsFromLiteral(
  el: ts.ObjectLiteralExpression,
  slugForErrors: string,
): Partial<ProjectItem> {
  const raw = readObjectStringFields(el, {
    strictKeys: PROJECT_ITEM_STRING_KEYS as readonly string[],
    strictContext: `projects[] entry (slug "${slugForErrors}")`,
  });
  const out: Partial<ProjectItem> = {};
  for (const k of PROJECT_ITEM_STRING_KEYS) {
    const v = raw[k];
    if (v !== undefined) {
      out[k] = v;
    }
  }
  return out;
}

function createStringProp(
  factory: ts.NodeFactory,
  key: string,
  value: string,
): ts.PropertyAssignment {
  return factory.createPropertyAssignment(
    key,
    factory.createStringLiteral(value),
  );
}

function projectDataToObjectLiteral(
  factory: ts.NodeFactory,
  data: ProjectItem,
): ts.ObjectLiteralExpression {
  return factory.createObjectLiteralExpression(
    PROJECT_ITEM_STRING_KEYS.map((k) => createStringProp(factory, k, data[k])),
    true,
  );
}

function mergeProject(
  existingLiteral: ts.ObjectLiteralExpression,
  slug: string,
  patch: Partial<ProjectItem>,
): ProjectItem {
  const fromFile = readProjectItemFieldsFromLiteral(existingLiteral, slug);
  const base: ProjectItem = {
    slug: fromFile.slug ?? slug,
    title: fromFile.title ?? "",
    tag: fromFile.tag ?? "",
    blurb: fromFile.blurb ?? "",
    href: fromFile.href ?? "",
    externalUrl: fromFile.externalUrl ?? "",
  };
  return { ...base, ...patch, slug };
}

function findDefaultPortfolioContentRoot(
  sourceFile: ts.SourceFile,
): ts.ObjectLiteralExpression | undefined {
  const visit = (node: ts.Node): ts.ObjectLiteralExpression | undefined => {
    if (ts.isVariableStatement(node)) {
      for (const decl of node.declarationList.declarations) {
        if (
          ts.isIdentifier(decl.name) &&
          decl.name.text === DEFAULT_CONTENT_VAR &&
          decl.initializer &&
          ts.isObjectLiteralExpression(decl.initializer)
        ) {
          return decl.initializer;
        }
      }
    }
    return ts.forEachChild(node, visit);
  };
  return visit(sourceFile);
}

function findIdentifierPropertyAssignment(
  obj: ts.ObjectLiteralExpression,
  key: string,
): ts.PropertyAssignment | undefined {
  for (const prop of obj.properties) {
    if (!ts.isPropertyAssignment(prop)) continue;
    if (ts.isIdentifier(prop.name) && prop.name.text === key) {
      return prop;
    }
  }
  return undefined;
}

/**
 * Ensures the AST contains the structures we can patch before running the transformer.
 * Throws with actionable messages instead of silently skipping (see `updateProject`).
 */
function assertPersonalInfoPatchable(
  root: ts.ObjectLiteralExpression,
  data: Partial<AdminPersonalInfo>,
  filePath: string,
): void {
  const prefix = `ASTManipulator.updatePersonalInfo:`;
  const wantsBio = data.bio !== undefined;
  const wantsLinkedin = data.linkedin !== undefined;
  const wantedScalars = PERSON_SCALAR_KEYS.filter((k) => data[k] !== undefined);

  if (!wantsBio && wantedScalars.length === 0 && !wantsLinkedin) {
    return;
  }

  if (wantsBio) {
    const about = findIdentifierPropertyAssignment(root, "about");
    if (!about || !ts.isObjectLiteralExpression(about.initializer)) {
      throw new Error(
        `${prefix} cannot patch bio: missing "about" object in default portfolio content (${filePath})`,
      );
    }
    const body = findIdentifierPropertyAssignment(about.initializer, "body");
    if (!body) {
      throw new Error(
        `${prefix} cannot patch bio: missing "about.body" property in default portfolio content (${filePath})`,
      );
    }
  }

  if (wantedScalars.length > 0 || wantsLinkedin) {
    const person = findIdentifierPropertyAssignment(root, "person");
    if (!person || !ts.isObjectLiteralExpression(person.initializer)) {
      throw new Error(
        `${prefix} cannot patch person fields: missing "person" object in default portfolio content (${filePath})`,
      );
    }
    const personObj = person.initializer;
    for (const k of wantedScalars) {
      const prop = findIdentifierPropertyAssignment(personObj, k);
      if (!prop) {
        throw new Error(
          `${prefix} cannot patch "${k}": missing person.${String(k)} property in default portfolio content (${filePath})`,
        );
      }
    }
    if (wantsLinkedin) {
      const links = findIdentifierPropertyAssignment(personObj, "links");
      if (!links || !ts.isObjectLiteralExpression(links.initializer)) {
        throw new Error(
          `${prefix} cannot patch linkedin: missing person.links object in default portfolio content (${filePath})`,
        );
      }
      const linkedin = findIdentifierPropertyAssignment(links.initializer, "linkedin");
      if (!linkedin) {
        throw new Error(
          `${prefix} cannot patch linkedin: missing person.links.linkedin property in default portfolio content (${filePath})`,
        );
      }
    }
  }
}

export class ASTManipulator {
  private sourceFile: ts.SourceFile;
  private readonly filePath: string;

  constructor(filePath: string) {
    this.filePath = filePath;
    const sourceCode = fs.readFileSync(filePath, "utf-8");
    this.sourceFile = ts.createSourceFile(
      filePath,
      sourceCode,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TS,
    );
  }

  private requireDefaultPortfolioRoot(operation: string): ts.ObjectLiteralExpression {
    const root = findDefaultPortfolioContentRoot(this.sourceFile);
    if (!root) {
      throw new Error(
        `${operation}: expected const ${DEFAULT_CONTENT_VAR} = { ... } object literal in ${this.filePath}`,
      );
    }
    return root;
  }

  /**
   * Shared skeleton: walk the AST and replace the initializer of `defaultPortfolioContent`
   * when `patchRoot` returns a new object literal.
   */
  private createDefaultContentRootTransformer(
    patchRoot: (
      root: ts.ObjectLiteralExpression,
      factory: ts.NodeFactory,
    ) => ts.ObjectLiteralExpression,
  ): ts.TransformerFactory<ts.SourceFile> {
    return (context: ts.TransformationContext) => {
      const { factory } = context;
      const visit: ts.Visitor = (node) => {
        if (ts.isVariableStatement(node)) {
          const decls = node.declarationList.declarations.map((decl) => {
            if (
              !ts.isIdentifier(decl.name) ||
              decl.name.text !== DEFAULT_CONTENT_VAR ||
              !decl.initializer ||
              !ts.isObjectLiteralExpression(decl.initializer)
            ) {
              return decl;
            }
            const nextRoot = patchRoot(decl.initializer, factory);
            if (nextRoot === decl.initializer) return decl;
            return factory.updateVariableDeclaration(
              decl,
              decl.name,
              decl.exclamationToken,
              decl.type,
              nextRoot,
            );
          });
          const anyChange = decls.some(
            (d, i) => d !== node.declarationList.declarations[i],
          );
          if (!anyChange) return ts.visitEachChild(node, visit, context);
          return factory.updateVariableStatement(
            node,
            ts.getModifiers(node),
            factory.updateVariableDeclarationList(node.declarationList, decls),
          );
        }
        return ts.visitEachChild(node, visit, context);
      };
      return (sf) => {
        const out = ts.visitNode(sf, visit);
        if (!out || !ts.isSourceFile(out)) {
          throw new Error("AST internal error: transform did not return a SourceFile");
        }
        return out;
      };
    };
  }

  updateProject(slug: string, projectData: Partial<ProjectItem>): void {
    this.requireDefaultPortfolioRoot("ASTManipulator.updateProject");
    const transformer = this.createDefaultContentRootTransformer((root, factory) =>
      this.patchProjectsArray(root, slug, projectData, factory),
    );
    const result = ts.transform(this.sourceFile, [transformer]);
    try {
      const next = result.transformed[0];
      if (!next || !ts.isSourceFile(next)) {
        throw new Error("AST transform did not return a SourceFile");
      }
      this.writeTransformedFile(next);
      this.sourceFile = next;
    } finally {
      result.dispose();
    }
  }

  updatePersonalInfo(personalData: Partial<AdminPersonalInfo>): void {
    const root = this.requireDefaultPortfolioRoot("ASTManipulator.updatePersonalInfo");
    assertPersonalInfoPatchable(root, personalData, this.filePath);
    const transformer = this.createDefaultContentRootTransformer((r, factory) =>
      this.patchPersonAndAbout(r, personalData, factory),
    );
    const result = ts.transform(this.sourceFile, [transformer]);
    try {
      const next = result.transformed[0];
      if (!next || !ts.isSourceFile(next)) {
        throw new Error("AST transform did not return a SourceFile");
      }
      this.writeTransformedFile(next);
      this.sourceFile = next;
    } finally {
      result.dispose();
    }
  }

  private patchProjectsArray(
    rootObj: ts.ObjectLiteralExpression,
    slug: string,
    projectData: Partial<ProjectItem>,
    factory: ts.NodeFactory,
  ): ts.ObjectLiteralExpression {
    const props = rootObj.properties.map((p) => {
      if (!ts.isPropertyAssignment(p) || !ts.isIdentifier(p.name)) return p;
      if (p.name.text !== "projects" || !ts.isArrayLiteralExpression(p.initializer)) {
        return p;
      }
      const arr = p.initializer;
      let found = false;
      const elements = arr.elements.map((el) => {
        if (!ts.isObjectLiteralExpression(el)) return el;
        const fields = readObjectStringFields(el, {
          strictKeys: ["slug"],
          strictContext: `projects[] entry while matching slug "${slug}"`,
        });
        if (fields.slug !== slug) return el;
        found = true;
        const merged = mergeProject(el, slug, projectData);
        return projectDataToObjectLiteral(factory, merged);
      });
      if (!found) {
        throw new Error(
          `ASTManipulator.updateProject: no project with slug "${slug}" in ${this.filePath}`,
        );
      }
      return factory.updatePropertyAssignment(
        p,
        p.name,
        factory.updateArrayLiteralExpression(arr, elements),
      );
    });
    return factory.updateObjectLiteralExpression(rootObj, props);
  }

  private patchPersonAndAbout(
    rootObj: ts.ObjectLiteralExpression,
    personalData: Partial<AdminPersonalInfo>,
    factory: ts.NodeFactory,
  ): ts.ObjectLiteralExpression {
    const bioText = personalData.bio;
    const {
      name,
      role,
      tagline,
      location,
      email,
      phone,
      linkedin,
    } = personalData;
    const hasPersonPatch =
      name !== undefined ||
      role !== undefined ||
      tagline !== undefined ||
      location !== undefined ||
      email !== undefined ||
      phone !== undefined ||
      linkedin !== undefined;
    const hasBio = bioText !== undefined;
    if (!hasPersonPatch && !hasBio) return rootObj;

    const props = rootObj.properties.map((p) => {
      if (!ts.isPropertyAssignment(p) || !ts.isIdentifier(p.name)) return p;

      if (p.name.text === "about" && hasBio && ts.isObjectLiteralExpression(p.initializer)) {
        const aboutObj = p.initializer;
        const aboutProps = aboutObj.properties.map((ap) => {
          if (
            !ts.isPropertyAssignment(ap) ||
            !ts.isIdentifier(ap.name) ||
            ap.name.text !== "body"
          ) {
            return ap;
          }
          return factory.updatePropertyAssignment(
            ap,
            ap.name,
            factory.createStringLiteral(bioText),
          );
        });
        return factory.updatePropertyAssignment(
          p,
          p.name,
          factory.updateObjectLiteralExpression(aboutObj, aboutProps),
        );
      }

      if (p.name.text === "person" && hasPersonPatch && ts.isObjectLiteralExpression(p.initializer)) {
        const personObj = p.initializer;
        const personProps = personObj.properties.map((pp) => {
          if (!ts.isPropertyAssignment(pp) || !ts.isIdentifier(pp.name)) return pp;
          if (pp.name.text === "links" && linkedin !== undefined && ts.isObjectLiteralExpression(pp.initializer)) {
            const linksObj = pp.initializer;
            const linkProps = linksObj.properties.map((lp) => {
              if (
                !ts.isPropertyAssignment(lp) ||
                !ts.isIdentifier(lp.name) ||
                lp.name.text !== "linkedin"
              ) {
                return lp;
              }
              return factory.updatePropertyAssignment(
                lp,
                lp.name,
                factory.createStringLiteral(linkedin),
              );
            });
            return factory.updatePropertyAssignment(
              pp,
              pp.name,
              factory.updateObjectLiteralExpression(linksObj, linkProps),
            );
          }
          if (
            PERSON_SCALAR_KEYS.includes(pp.name.text as (typeof PERSON_SCALAR_KEYS)[number]) &&
            personalData[pp.name.text as keyof AdminPersonalInfo] !== undefined
          ) {
            const key = pp.name.text as keyof AdminPersonalInfo;
            const val = personalData[key];
            if (typeof val !== "string") return pp;
            return factory.updatePropertyAssignment(
              pp,
              pp.name,
              factory.createStringLiteral(val),
            );
          }
          return pp;
        });
        return factory.updatePropertyAssignment(
          p,
          p.name,
          factory.updateObjectLiteralExpression(personObj, personProps),
        );
      }

      return p;
    });

    return factory.updateObjectLiteralExpression(rootObj, props);
  }

  private writeTransformedFile(transformedNode: ts.SourceFile): void {
    const printer = ts.createPrinter({
      newLine: ts.NewLineKind.LineFeed,
      removeComments: false,
    });
    const text = printer.printFile(transformedNode);
    fs.writeFileSync(this.filePath, text);
  }
}
