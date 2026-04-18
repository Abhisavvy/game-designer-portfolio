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

/** `caseStudies` keys use identifiers when valid JS identifiers (e.g. `tiles`), else string literals. */
function caseStudySlugPropertyName(
  factory: ts.NodeFactory,
  slug: string,
): ts.PropertyName {
  if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(slug)) {
    return factory.createIdentifier(slug);
  }
  return factory.createStringLiteral(slug);
}

function readCaseStudySlugFromPropertyName(
  name: ts.PropertyName,
): string | undefined {
  if (ts.isIdentifier(name)) return name.text;
  if (ts.isStringLiteral(name) || ts.isNoSubstitutionTemplateLiteral(name)) {
    return name.text;
  }
  return undefined;
}

/** Draft fields for a new case study row (media block is added automatically). */
export type CaseStudyDraftForAst = {
  title: string;
  subtitle: string;
  problem: string;
  approach: string;
  constraints: string;
  outcome: string;
  contributions?: string;
  links?: { label: string; href: string }[];
};

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
  const wantsAbout = data.aboutTitle !== undefined || data.aboutBody !== undefined || data.aboutImage !== undefined;
  const wantsLinkedin = data.linkedin !== undefined;
  const wantedScalars = PERSON_SCALAR_KEYS.filter((k) => data[k] !== undefined);

  if (!wantsAbout && wantedScalars.length === 0 && !wantsLinkedin) {
    return;
  }

  if (wantsAbout) {
    const about = findIdentifierPropertyAssignment(root, "about");
    if (!about || !ts.isObjectLiteralExpression(about.initializer)) {
      throw new Error(
        `${prefix} cannot patch about: missing "about" object in default portfolio content (${filePath})`,
      );
    }
    const body = findIdentifierPropertyAssignment(about.initializer, "body");
    if (!body) {
      throw new Error(
        `${prefix} cannot patch about: missing "about.body" property in default portfolio content (${filePath})`,
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

  addProject(projectData: ProjectItem): void {
    this.addProjectWithCaseStudy(projectData, {
      title: projectData.title,
      subtitle: "Draft — edit in admin",
      problem: "Describe the problem or opportunity (edit in admin).",
      approach: "Describe your approach (edit in admin).",
      constraints: "List constraints and risks (edit in admin).",
      outcome: "Summarize results and learnings (edit in admin).",
      contributions: "",
      links: [],
    });
  }

  /**
   * Adds a `projects[]` row and matching `caseStudies[slug]` with a media skeleton
   * (hero poster + empty process gallery). Single AST write.
   */
  addProjectWithCaseStudy(
    projectData: ProjectItem,
    caseStudyDraft: CaseStudyDraftForAst,
  ): void {
    this.requireDefaultPortfolioRoot("ASTManipulator.addProjectWithCaseStudy");
    const transformer = this.createDefaultContentRootTransformer((root, factory) => {
      let next = this.addProjectToArray(root, projectData, factory);
      next = this.insertCaseStudyEntry(
        next,
        projectData.slug,
        { ...caseStudyDraft, title: caseStudyDraft.title || projectData.title },
        factory,
      );
      return next;
    });
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

  /** Updates case study copy fields only; leaves `media` and `links` unchanged. */
  updateCaseStudyScalars(
    slug: string,
    patch: {
      title: string;
      subtitle: string;
      problem: string;
      approach: string;
      constraints: string;
      outcome: string;
      contributions?: string;
    },
  ): void {
    this.requireDefaultPortfolioRoot("ASTManipulator.updateCaseStudyScalars");
    const transformer = this.createDefaultContentRootTransformer((root, factory) =>
      this.patchCaseStudyScalarFieldsInRoot(root, slug, patch, factory),
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

  updateProjectImage(slug: string, imagePath: string): void {
    this.requireDefaultPortfolioRoot("ASTManipulator.updateProjectImage");
    const transformer = this.createDefaultContentRootTransformer((root, factory) =>
      this.patchProjectImage(root, slug, imagePath, factory),
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

  addGalleryImage(slug: string, imageData: { path: string; alt: string; label: string }): void {
    this.requireDefaultPortfolioRoot("ASTManipulator.addGalleryImage");
    const transformer = this.createDefaultContentRootTransformer((root, factory) =>
      this.addGalleryImageToProject(root, slug, imageData, factory),
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

  deleteProject(slug: string): void {
    this.requireDefaultPortfolioRoot("ASTManipulator.deleteProject");
    const transformer = this.createDefaultContentRootTransformer((root, factory) => {
      let next = this.removeCaseStudyFromCaseStudies(root, slug, factory);
      next = this.removeProjectFromArray(next, slug, factory);
      return next;
    });
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

  replaceGalleryItems(slug: string, items: Array<{ thumb: string; full: string; alt: string; label: string }>): void {
    this.requireDefaultPortfolioRoot("ASTManipulator.replaceGalleryItems");
    const transformer = this.createDefaultContentRootTransformer((root, factory) =>
      this.replaceGalleryItemsInProject(root, slug, items, factory),
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

  removeImageReferences(imagePath: string): void {
    this.requireDefaultPortfolioRoot("ASTManipulator.removeImageReferences");
    const transformer = this.createDefaultContentRootTransformer((root, factory) =>
      this.removeImageReferencesFromContent(root, imagePath, factory),
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
    const {
      name,
      role,
      tagline,
      location,
      email,
      phone,
      linkedin,
      aboutTitle,
      aboutBody,
      aboutImage,
    } = personalData;
    const hasPersonPatch =
      name !== undefined ||
      role !== undefined ||
      tagline !== undefined ||
      location !== undefined ||
      email !== undefined ||
      phone !== undefined ||
      linkedin !== undefined;
    const hasAboutPatch = 
      aboutTitle !== undefined ||
      aboutBody !== undefined ||
      aboutImage !== undefined;
    if (!hasPersonPatch && !hasAboutPatch) return rootObj;

    const props = rootObj.properties.map((p) => {
      if (!ts.isPropertyAssignment(p) || !ts.isIdentifier(p.name)) return p;

      if (p.name.text === "about" && hasAboutPatch && ts.isObjectLiteralExpression(p.initializer)) {
        const aboutObj = p.initializer;
        const aboutProps = aboutObj.properties.map((ap) => {
          if (!ts.isPropertyAssignment(ap) || !ts.isIdentifier(ap.name)) {
            return ap;
          }
          
          if (ap.name.text === "title" && aboutTitle !== undefined) {
            return factory.updatePropertyAssignment(
              ap,
              ap.name,
              factory.createStringLiteral(aboutTitle),
            );
          }
          
          if (ap.name.text === "body" && aboutBody !== undefined) {
            return factory.updatePropertyAssignment(
              ap,
              ap.name,
              factory.createStringLiteral(aboutBody),
            );
          }
          
          if (ap.name.text === "image" && aboutImage !== undefined) {
            return factory.updatePropertyAssignment(
              ap,
              ap.name,
              factory.createStringLiteral(aboutImage),
            );
          }
          
          return ap;
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

  private addProjectToArray(
    rootObj: ts.ObjectLiteralExpression,
    projectData: ProjectItem,
    factory: ts.NodeFactory,
  ): ts.ObjectLiteralExpression {
    const props = rootObj.properties.map((p) => {
      if (!ts.isPropertyAssignment(p) || !ts.isIdentifier(p.name)) return p;
      if (p.name.text !== "projects" || !ts.isArrayLiteralExpression(p.initializer)) {
        return p;
      }
      
      const arr = p.initializer;
      const newProjectLiteral = projectDataToObjectLiteral(factory, projectData);
      const elements = [...arr.elements, newProjectLiteral];
      
      return factory.updatePropertyAssignment(
        p,
        p.name,
        factory.updateArrayLiteralExpression(arr, elements),
      );
    });
    return factory.updateObjectLiteralExpression(rootObj, props);
  }

  private removeProjectFromArray(
    rootObj: ts.ObjectLiteralExpression,
    slug: string,
    factory: ts.NodeFactory,
  ): ts.ObjectLiteralExpression {
    const props = rootObj.properties.map((p) => {
      if (!ts.isPropertyAssignment(p) || !ts.isIdentifier(p.name)) return p;
      if (p.name.text !== "projects" || !ts.isArrayLiteralExpression(p.initializer)) {
        return p;
      }
      
      const arr = p.initializer;
      let found = false;
      const elements = arr.elements.filter((el) => {
        if (!ts.isObjectLiteralExpression(el)) return true;
        const fields = readObjectStringFields(el, {
          strictKeys: ["slug"],
          strictContext: `projects[] entry while removing slug "${slug}"`,
        });
        if (fields.slug === slug) {
          found = true;
          return false; // Remove this element
        }
        return true;
      });
      
      if (!found) {
        throw new Error(
          `ASTManipulator.deleteProject: no project with slug "${slug}" in ${this.filePath}`,
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

  private patchProjectImage(
    rootObj: ts.ObjectLiteralExpression,
    slug: string,
    imagePath: string,
    factory: ts.NodeFactory,
  ): ts.ObjectLiteralExpression {
    const props = rootObj.properties.map((p) => {
      if (!ts.isPropertyAssignment(p) || !ts.isIdentifier(p.name)) return p;
      if (p.name.text !== "caseStudies" || !ts.isObjectLiteralExpression(p.initializer)) {
        return p;
      }
      const caseStudiesObj = p.initializer;
      let found = false;
      const caseStudyProps = caseStudiesObj.properties.map((csProp) => {
        if (!ts.isPropertyAssignment(csProp)) return csProp;
        const propName = readCaseStudySlugFromPropertyName(csProp.name);
        if (propName !== slug || !ts.isObjectLiteralExpression(csProp.initializer)) {
          return csProp;
        }
        found = true;
        return factory.updatePropertyAssignment(
          csProp,
          csProp.name,
          this.setPosterSrcOnCaseStudyLiteral(
            csProp.initializer,
            imagePath,
            factory,
          ),
        );
      });
      if (!found) {
        throw new Error(
          `ASTManipulator.patchProjectImage: no case study with slug "${slug}" in ${this.filePath}`,
        );
      }
      return factory.updatePropertyAssignment(
        p,
        p.name,
        factory.updateObjectLiteralExpression(caseStudiesObj, caseStudyProps),
      );
    });
    return factory.updateObjectLiteralExpression(rootObj, props);
  }

  private setPosterSrcOnCaseStudyLiteral(
    caseStudy: ts.ObjectLiteralExpression,
    imagePath: string,
    factory: ts.NodeFactory,
  ): ts.ObjectLiteralExpression {
    let hasMedia = false;
    const mapped = caseStudy.properties.map((csField) => {
      if (!ts.isPropertyAssignment(csField) || !ts.isIdentifier(csField.name)) {
        return csField;
      }
      if (csField.name.text !== "media") return csField;
      hasMedia = true;
      if (!ts.isObjectLiteralExpression(csField.initializer)) return csField;
      return factory.updatePropertyAssignment(
        csField,
        csField.name,
        this.setPosterSrcOnMediaLiteral(csField.initializer, imagePath, factory),
      );
    });
    if (!hasMedia) {
      return factory.updateObjectLiteralExpression(caseStudy, [
        ...mapped,
        factory.createPropertyAssignment(
          "media",
          factory.createObjectLiteralExpression(
            [
              factory.createPropertyAssignment(
                "hero",
                factory.createObjectLiteralExpression(
                  [
                    factory.createPropertyAssignment(
                      "posterSrc",
                      factory.createStringLiteral(imagePath),
                    ),
                  ],
                  true,
                ),
              ),
            ],
            true,
          ),
        ),
      ]);
    }
    return factory.updateObjectLiteralExpression(caseStudy, mapped);
  }

  private setPosterSrcOnMediaLiteral(
    mediaObj: ts.ObjectLiteralExpression,
    imagePath: string,
    factory: ts.NodeFactory,
  ): ts.ObjectLiteralExpression {
    let hasHero = false;
    const mediaProps = mediaObj.properties.map((mediaProp) => {
      if (!ts.isPropertyAssignment(mediaProp) || !ts.isIdentifier(mediaProp.name)) {
        return mediaProp;
      }
      if (mediaProp.name.text !== "hero") return mediaProp;
      hasHero = true;
      if (!ts.isObjectLiteralExpression(mediaProp.initializer)) return mediaProp;
      const heroObj = mediaProp.initializer;
      let hasPoster = false;
      const heroProps = heroObj.properties.map((heroProp) => {
        if (!ts.isPropertyAssignment(heroProp) || !ts.isIdentifier(heroProp.name)) {
          return heroProp;
        }
        if (heroProp.name.text !== "posterSrc") return heroProp;
        hasPoster = true;
        return factory.updatePropertyAssignment(
          heroProp,
          heroProp.name,
          factory.createStringLiteral(imagePath),
        );
      });
      const nextHeroProps = hasPoster
        ? heroProps
        : [
            ...heroProps,
            factory.createPropertyAssignment(
              "posterSrc",
              factory.createStringLiteral(imagePath),
            ),
          ];
      return factory.updatePropertyAssignment(
        mediaProp,
        mediaProp.name,
        factory.updateObjectLiteralExpression(heroObj, nextHeroProps),
      );
    });
    if (!hasHero) {
      return factory.updateObjectLiteralExpression(mediaObj, [
        ...mediaProps,
        factory.createPropertyAssignment(
          "hero",
          factory.createObjectLiteralExpression(
            [
              factory.createPropertyAssignment(
                "posterSrc",
                factory.createStringLiteral(imagePath),
              ),
            ],
            true,
          ),
        ),
      ]);
    }
    return factory.updateObjectLiteralExpression(mediaObj, mediaProps);
  }

  private insertCaseStudyEntry(
    rootObj: ts.ObjectLiteralExpression,
    slug: string,
    draft: CaseStudyDraftForAst,
    factory: ts.NodeFactory,
  ): ts.ObjectLiteralExpression {
    const props = rootObj.properties.map((p) => {
      if (!ts.isPropertyAssignment(p) || !ts.isIdentifier(p.name)) return p;
      if (p.name.text !== "caseStudies" || !ts.isObjectLiteralExpression(p.initializer)) {
        return p;
      }
      const csObj = p.initializer;
      for (const cp of csObj.properties) {
        if (!ts.isPropertyAssignment(cp)) continue;
        if (readCaseStudySlugFromPropertyName(cp.name) === slug) {
          throw new Error(
            `ASTManipulator.insertCaseStudyEntry: case study "${slug}" already exists`,
          );
        }
      }
      const newProp = factory.createPropertyAssignment(
        caseStudySlugPropertyName(factory, slug),
        this.createCaseStudyLiteralFromDraft(slug, draft, factory),
      );
      return factory.updatePropertyAssignment(
        p,
        p.name,
        factory.updateObjectLiteralExpression(csObj, [...csObj.properties, newProp]),
      );
    });
    return factory.updateObjectLiteralExpression(rootObj, props);
  }

  private createCaseStudyLiteralFromDraft(
    slug: string,
    draft: CaseStudyDraftForAst,
    factory: ts.NodeFactory,
  ): ts.ObjectLiteralExpression {
    const processGroupId = `${slug}-process`;
    const linkItems = (draft.links ?? []).map((l) =>
      factory.createObjectLiteralExpression(
        [
          createStringProp(factory, "label", l.label),
          createStringProp(factory, "href", l.href),
        ],
        true,
      ),
    );
    const props: ts.PropertyAssignment[] = [
      createStringProp(factory, "title", draft.title),
      createStringProp(factory, "subtitle", draft.subtitle),
      createStringProp(factory, "problem", draft.problem),
      createStringProp(factory, "approach", draft.approach),
      createStringProp(factory, "constraints", draft.constraints),
      createStringProp(factory, "outcome", draft.outcome),
    ];
    if (draft.contributions !== undefined) {
      props.push(createStringProp(factory, "contributions", draft.contributions));
    }
    props.push(
      factory.createPropertyAssignment(
        "links",
        factory.createArrayLiteralExpression(linkItems, true),
      ),
      factory.createPropertyAssignment(
        "media",
        factory.createObjectLiteralExpression(
          [
            factory.createPropertyAssignment(
              "hero",
              factory.createObjectLiteralExpression(
                [
                  createStringProp(
                    factory,
                    "posterSrc",
                    "/assets/placeholder-image.svg",
                  ),
                ],
                true,
              ),
            ),
            factory.createPropertyAssignment(
              "processGallery",
              factory.createObjectLiteralExpression(
                [
                  createStringProp(factory, "groupId", processGroupId),
                  createStringProp(factory, "heading", "Design process"),
                  factory.createPropertyAssignment(
                    "items",
                    factory.createArrayLiteralExpression([], true),
                  ),
                ],
                true,
              ),
            ),
          ],
          true,
        ),
      ),
    );
    return factory.createObjectLiteralExpression(props, true);
  }

  private removeCaseStudyFromCaseStudies(
    rootObj: ts.ObjectLiteralExpression,
    slug: string,
    factory: ts.NodeFactory,
  ): ts.ObjectLiteralExpression {
    const props = rootObj.properties.map((p) => {
      if (!ts.isPropertyAssignment(p) || !ts.isIdentifier(p.name)) return p;
      if (p.name.text !== "caseStudies" || !ts.isObjectLiteralExpression(p.initializer)) {
        return p;
      }
      const filtered = p.initializer.properties.filter((cp) => {
        if (!ts.isPropertyAssignment(cp)) return true;
        return readCaseStudySlugFromPropertyName(cp.name) !== slug;
      });
      return factory.updatePropertyAssignment(
        p,
        p.name,
        factory.updateObjectLiteralExpression(p.initializer, filtered),
      );
    });
    return factory.updateObjectLiteralExpression(rootObj, props);
  }

  private patchCaseStudyScalarFieldsInRoot(
    rootObj: ts.ObjectLiteralExpression,
    slug: string,
    patch: {
      title: string;
      subtitle: string;
      problem: string;
      approach: string;
      constraints: string;
      outcome: string;
      contributions?: string;
    },
    factory: ts.NodeFactory,
  ): ts.ObjectLiteralExpression {
    const props = rootObj.properties.map((p) => {
      if (!ts.isPropertyAssignment(p) || !ts.isIdentifier(p.name)) return p;
      if (p.name.text !== "caseStudies" || !ts.isObjectLiteralExpression(p.initializer)) {
        return p;
      }
      let found = false;
      const csProps = p.initializer.properties.map((cp) => {
        if (!ts.isPropertyAssignment(cp)) return cp;
        if (readCaseStudySlugFromPropertyName(cp.name) !== slug) return cp;
        if (!ts.isObjectLiteralExpression(cp.initializer)) return cp;
        found = true;
        return factory.updatePropertyAssignment(
          cp,
          cp.name,
          this.patchCaseStudyBodyScalars(cp.initializer, patch, factory),
        );
      });
      if (!found) {
        throw new Error(
          `ASTManipulator.updateCaseStudyScalars: no case study with slug "${slug}" in ${this.filePath}`,
        );
      }
      return factory.updatePropertyAssignment(
        p,
        p.name,
        factory.updateObjectLiteralExpression(p.initializer, csProps),
      );
    });
    return factory.updateObjectLiteralExpression(rootObj, props);
  }

  private patchCaseStudyBodyScalars(
    caseStudy: ts.ObjectLiteralExpression,
    patch: {
      title: string;
      subtitle: string;
      problem: string;
      approach: string;
      constraints: string;
      outcome: string;
      contributions?: string;
    },
    factory: ts.NodeFactory,
  ): ts.ObjectLiteralExpression {
    const scalarKeys = [
      "title",
      "subtitle",
      "problem",
      "approach",
      "constraints",
      "outcome",
    ] as const;
    const updates: Record<string, string> = {};
    for (const k of scalarKeys) {
      updates[k] = patch[k];
    }
    if (patch.contributions !== undefined) {
      updates.contributions = patch.contributions;
    }

    const seen = new Set<string>();
    const newProps: ts.ObjectLiteralElementLike[] = [];

    for (const el of caseStudy.properties) {
      if (!ts.isPropertyAssignment(el) || !ts.isIdentifier(el.name)) {
        newProps.push(el);
        continue;
      }
      const key = el.name.text;
      if (key === "media" || key === "links") {
        newProps.push(el);
        seen.add(key);
        continue;
      }
      if (key in updates) {
        const v = updates[key];
        if (v !== undefined) {
          newProps.push(
            factory.updatePropertyAssignment(
              el,
              el.name,
              factory.createStringLiteral(v),
            ),
          );
        }
        seen.add(key);
        continue;
      }
      newProps.push(el);
      seen.add(key);
    }

    for (const [k, v] of Object.entries(updates)) {
      if (!seen.has(k) && v !== undefined) {
        newProps.push(createStringProp(factory, k, v));
      }
    }

    return factory.updateObjectLiteralExpression(caseStudy, newProps);
  }

  private addGalleryImageToProject(
    rootObj: ts.ObjectLiteralExpression,
    slug: string,
    imageData: { path: string; alt: string; label: string },
    factory: ts.NodeFactory,
  ): ts.ObjectLiteralExpression {
    const props = rootObj.properties.map((p) => {
      if (!ts.isPropertyAssignment(p) || !ts.isIdentifier(p.name)) return p;
      
      // Look for caseStudies property
      if (p.name.text === "caseStudies" && ts.isObjectLiteralExpression(p.initializer)) {
        const caseStudiesObj = p.initializer;
        const caseStudyProps = caseStudiesObj.properties.map((csProp) => {
          if (!ts.isPropertyAssignment(csProp)) return csProp;
          
          // Handle both identifier and string literal property names
          let propName: string | undefined;
          if (ts.isIdentifier(csProp.name)) {
            propName = csProp.name.text;
          } else if (ts.isStringLiteral(csProp.name)) {
            propName = csProp.name.text;
          }
          
          if (!propName) return csProp;

          // Check if this case study matches our slug
          if (propName === slug && ts.isObjectLiteralExpression(csProp.initializer)) {
            const caseStudy = csProp.initializer;
            const updatedProps = caseStudy.properties.map((csField) => {
              if (!ts.isPropertyAssignment(csField) || !ts.isIdentifier(csField.name)) return csField;
              
              // Update media.processGallery.items
              if (csField.name.text === "media" && ts.isObjectLiteralExpression(csField.initializer)) {
                const mediaObj = csField.initializer;
                const mediaProps = mediaObj.properties.map((mediaProp) => {
                  if (!ts.isPropertyAssignment(mediaProp) || !ts.isIdentifier(mediaProp.name)) return mediaProp;
                  
                  if (mediaProp.name.text === "processGallery" && ts.isObjectLiteralExpression(mediaProp.initializer)) {
                    const galleryObj = mediaProp.initializer;
                    const galleryProps = galleryObj.properties.map((galleryProp) => {
                      if (!ts.isPropertyAssignment(galleryProp) || !ts.isIdentifier(galleryProp.name)) return galleryProp;
                      
                      if (galleryProp.name.text === "items" && ts.isArrayLiteralExpression(galleryProp.initializer)) {
                        const itemsArray = galleryProp.initializer;
                        
                        // Create new gallery item
                        const newItem = factory.createObjectLiteralExpression([
                          factory.createPropertyAssignment("thumb", factory.createStringLiteral(imageData.path)),
                          factory.createPropertyAssignment("full", factory.createStringLiteral(imageData.path)),
                          factory.createPropertyAssignment("alt", factory.createStringLiteral(imageData.alt)),
                          factory.createPropertyAssignment("label", factory.createStringLiteral(imageData.label)),
                        ], true);
                        
                        // Add new item to array
                        const newElements = [...itemsArray.elements, newItem];
                        
                        return factory.updatePropertyAssignment(
                          galleryProp,
                          galleryProp.name,
                          factory.updateArrayLiteralExpression(itemsArray, newElements),
                        );
                      }
                      return galleryProp;
                    });
                    
                    return factory.updatePropertyAssignment(
                      mediaProp,
                      mediaProp.name,
                      factory.updateObjectLiteralExpression(galleryObj, galleryProps),
                    );
                  }
                  return mediaProp;
                });
                
                return factory.updatePropertyAssignment(
                  csField,
                  csField.name,
                  factory.updateObjectLiteralExpression(mediaObj, mediaProps),
                );
              }
              return csField;
            });
            
            return factory.updatePropertyAssignment(
              csProp,
              csProp.name,
              factory.updateObjectLiteralExpression(caseStudy, updatedProps),
            );
          }
          return csProp;
        });
        
        return factory.updatePropertyAssignment(
          p,
          p.name,
          factory.updateObjectLiteralExpression(caseStudiesObj, caseStudyProps),
        );
      }
      return p;
    });
    
    return factory.updateObjectLiteralExpression(rootObj, props);
  }

  private replaceGalleryItemsInProject(
    rootObj: ts.ObjectLiteralExpression,
    slug: string,
    items: Array<{ thumb: string; full: string; alt: string; label: string }>,
    factory: ts.NodeFactory,
  ): ts.ObjectLiteralExpression {
    const props = rootObj.properties.map((p) => {
      if (!ts.isPropertyAssignment(p) || !ts.isIdentifier(p.name)) return p;

      // Look for caseStudies property
      if (p.name.text === "caseStudies" && ts.isObjectLiteralExpression(p.initializer)) {
        const caseStudiesObj = p.initializer;
        const caseStudyProps = caseStudiesObj.properties.map((csProp) => {
          if (!ts.isPropertyAssignment(csProp)) return csProp;
          
          // Handle both identifier and string literal property names
          let propName: string | undefined;
          if (ts.isIdentifier(csProp.name)) {
            propName = csProp.name.text;
          } else if (ts.isStringLiteral(csProp.name)) {
            propName = csProp.name.text;
          }
          
          if (!propName) return csProp;

          // Check if this case study matches our slug
          if (propName === slug && ts.isObjectLiteralExpression(csProp.initializer)) {
            const caseStudy = csProp.initializer;
            const updatedProps = caseStudy.properties.map((csField) => {
              if (!ts.isPropertyAssignment(csField) || !ts.isIdentifier(csField.name)) return csField;

              // Update media.processGallery.items
              if (csField.name.text === "media" && ts.isObjectLiteralExpression(csField.initializer)) {
                const mediaObj = csField.initializer;
                const mediaProps = mediaObj.properties.map((mediaProp) => {
                  if (!ts.isPropertyAssignment(mediaProp) || !ts.isIdentifier(mediaProp.name)) return mediaProp;

                  if (mediaProp.name.text === "processGallery" && ts.isObjectLiteralExpression(mediaProp.initializer)) {
                    const galleryObj = mediaProp.initializer;
                    const galleryProps = galleryObj.properties.map((galleryProp) => {
                      if (!ts.isPropertyAssignment(galleryProp) || !ts.isIdentifier(galleryProp.name)) return galleryProp;

                      if (galleryProp.name.text === "items") {
                        // Replace entire items array with new items
                        const newItems = items.map(item => 
                          factory.createObjectLiteralExpression([
                            factory.createPropertyAssignment("thumb", factory.createStringLiteral(item.thumb)),
                            factory.createPropertyAssignment("full", factory.createStringLiteral(item.full)),
                            factory.createPropertyAssignment("alt", factory.createStringLiteral(item.alt)),
                            factory.createPropertyAssignment("label", factory.createStringLiteral(item.label)),
                          ], true)
                        );

                        return factory.updatePropertyAssignment(
                          galleryProp,
                          galleryProp.name,
                          factory.createArrayLiteralExpression(newItems, true),
                        );
                      }
                      return galleryProp;
                    });

                    return factory.updatePropertyAssignment(
                      mediaProp,
                      mediaProp.name,
                      factory.updateObjectLiteralExpression(galleryObj, galleryProps),
                    );
                  }
                  return mediaProp;
                });

                return factory.updatePropertyAssignment(
                  csField,
                  csField.name,
                  factory.updateObjectLiteralExpression(mediaObj, mediaProps),
                );
              }
              return csField;
            });

            return factory.updatePropertyAssignment(
              csProp,
              csProp.name,
              factory.updateObjectLiteralExpression(caseStudy, updatedProps),
            );
          }
          return csProp;
        });

        return factory.updatePropertyAssignment(
          p,
          p.name,
          factory.updateObjectLiteralExpression(caseStudiesObj, caseStudyProps),
        );
      }
      return p;
    });

    return factory.updateObjectLiteralExpression(rootObj, props);
  }

  private removeImageReferencesFromContent(
    rootObj: ts.ObjectLiteralExpression,
    imagePath: string,
    factory: ts.NodeFactory,
  ): ts.ObjectLiteralExpression {
    const props = rootObj.properties.map((p) => {
      if (!ts.isPropertyAssignment(p) || !ts.isIdentifier(p.name)) return p;

      // Look for caseStudies property
      if (p.name.text === "caseStudies" && ts.isObjectLiteralExpression(p.initializer)) {
        const caseStudiesObj = p.initializer;
        const caseStudyProps = caseStudiesObj.properties.map((csProp) => {
          if (!ts.isPropertyAssignment(csProp)) return csProp;
          
          // Handle both identifier and string literal property names
          let propName: string | undefined;
          if (ts.isIdentifier(csProp.name)) {
            propName = csProp.name.text;
          } else if (ts.isStringLiteral(csProp.name)) {
            propName = csProp.name.text;
          }
          
          if (!propName || !ts.isObjectLiteralExpression(csProp.initializer)) return csProp;

          const caseStudy = csProp.initializer;
          const updatedProps = caseStudy.properties.map((csField) => {
            if (!ts.isPropertyAssignment(csField) || !ts.isIdentifier(csField.name)) return csField;

            // Check media property
            if (csField.name.text === "media" && ts.isObjectLiteralExpression(csField.initializer)) {
              const mediaObj = csField.initializer;
              const mediaProps = mediaObj.properties.map((mediaProp) => {
                if (!ts.isPropertyAssignment(mediaProp) || !ts.isIdentifier(mediaProp.name)) return mediaProp;

                // Check hero.posterSrc
                if (mediaProp.name.text === "hero" && ts.isObjectLiteralExpression(mediaProp.initializer)) {
                  const heroObj = mediaProp.initializer;
                  const heroProps = heroObj.properties.map((heroProp) => {
                    if (!ts.isPropertyAssignment(heroProp) || !ts.isIdentifier(heroProp.name)) return heroProp;
                    
                    if (heroProp.name.text === "posterSrc" && ts.isStringLiteral(heroProp.initializer)) {
                      if (heroProp.initializer.text === imagePath) {
                        // Replace with placeholder
                        return factory.updatePropertyAssignment(
                          heroProp,
                          heroProp.name,
                          factory.createStringLiteral("/assets/placeholder-image.svg"),
                        );
                      }
                    }
                    return heroProp;
                  });
                  
                  return factory.updatePropertyAssignment(
                    mediaProp,
                    mediaProp.name,
                    factory.updateObjectLiteralExpression(heroObj, heroProps),
                  );
                }

                // Check processGallery.items
                if (mediaProp.name.text === "processGallery" && ts.isObjectLiteralExpression(mediaProp.initializer)) {
                  const galleryObj = mediaProp.initializer;
                  const galleryProps = galleryObj.properties.map((galleryProp) => {
                    if (!ts.isPropertyAssignment(galleryProp) || !ts.isIdentifier(galleryProp.name)) return galleryProp;

                    if (galleryProp.name.text === "items" && ts.isArrayLiteralExpression(galleryProp.initializer)) {
                      const itemsArray = galleryProp.initializer;
                      
                      // Filter out items that reference the deleted image
                      const filteredItems = itemsArray.elements.filter((item) => {
                        if (!ts.isObjectLiteralExpression(item)) return true;
                        
                        // Check if this item references the deleted image
                        for (const prop of item.properties) {
                          if (ts.isPropertyAssignment(prop) && 
                              ts.isIdentifier(prop.name) && 
                              (prop.name.text === "thumb" || prop.name.text === "full") &&
                              ts.isStringLiteral(prop.initializer) &&
                              prop.initializer.text === imagePath) {
                            return false; // Filter out this item
                          }
                        }
                        return true; // Keep this item
                      });

                      return factory.updatePropertyAssignment(
                        galleryProp,
                        galleryProp.name,
                        factory.createArrayLiteralExpression(filteredItems, true),
                      );
                    }
                    return galleryProp;
                  });

                  return factory.updatePropertyAssignment(
                    mediaProp,
                    mediaProp.name,
                    factory.updateObjectLiteralExpression(galleryObj, galleryProps),
                  );
                }
                return mediaProp;
              });

              return factory.updatePropertyAssignment(
                csField,
                csField.name,
                factory.updateObjectLiteralExpression(mediaObj, mediaProps),
              );
            }
            return csField;
          });

          return factory.updatePropertyAssignment(
            csProp,
            csProp.name,
            factory.updateObjectLiteralExpression(caseStudy, updatedProps),
          );
        });

        return factory.updatePropertyAssignment(
          p,
          p.name,
          factory.updateObjectLiteralExpression(caseStudiesObj, caseStudyProps),
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
