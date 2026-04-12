/**
 * Node-only: reads/writes `site-content.ts` via the TypeScript AST.
 * Do not import from Client Components.
 */

import * as fs from "fs";
import * as ts from "typescript";

import type { AdminPersonalInfo, AdminProject } from "../types/admin";

const DEFAULT_CONTENT_VAR = "defaultPortfolioContent";

function getStringLiteralText(node: ts.Expression): string | undefined {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    return node.text;
  }
  return undefined;
}

function readObjectStringFields(
  obj: ts.ObjectLiteralExpression,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const prop of obj.properties) {
    if (!ts.isPropertyAssignment(prop)) continue;
    const nameNode = prop.name;
    if (!ts.isIdentifier(nameNode) && !ts.isStringLiteral(nameNode)) continue;
    const key = ts.isIdentifier(nameNode) ? nameNode.text : nameNode.text;
    const text = getStringLiteralText(prop.initializer);
    if (text !== undefined) out[key] = text;
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
  data: AdminProject,
): ts.ObjectLiteralExpression {
  const keys: (keyof AdminProject)[] = [
    "slug",
    "title",
    "tag",
    "blurb",
    "href",
    "externalUrl",
  ];
  return factory.createObjectLiteralExpression(
    keys.map((k) => createStringProp(factory, k, data[k])),
    true,
  );
}

function mergeProject(
  existingLiteral: ts.ObjectLiteralExpression,
  slug: string,
  patch: Partial<AdminProject>,
): AdminProject {
  const fromFile = readObjectStringFields(existingLiteral) as Partial<AdminProject>;
  const base: AdminProject = {
    slug: fromFile.slug ?? slug,
    title: fromFile.title ?? "",
    tag: fromFile.tag ?? "",
    blurb: fromFile.blurb ?? "",
    href: fromFile.href ?? "",
    externalUrl: fromFile.externalUrl ?? "",
  };
  return { ...base, ...patch, slug };
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

  updateProject(slug: string, projectData: Partial<AdminProject>): void {
    const transformer = this.createProjectTransformer(slug, projectData);
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
    const transformer = this.createPersonalInfoTransformer(personalData);
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

  private createProjectTransformer(
    slug: string,
    projectData: Partial<AdminProject>,
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
            const rootObj = decl.initializer;
            const nextRoot = this.patchProjectsArray(
              rootObj,
              slug,
              projectData,
              factory,
            );
            if (nextRoot === rootObj) return decl;
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
      return (sf) => ts.visitNode(sf, visit) as ts.SourceFile;
    };
  }

  private createPersonalInfoTransformer(
    personalData: Partial<AdminPersonalInfo>,
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
            let rootObj = decl.initializer;
            rootObj = this.patchPersonAndAbout(rootObj, personalData, factory);
            if (rootObj === decl.initializer) return decl;
            return factory.updateVariableDeclaration(
              decl,
              decl.name,
              decl.exclamationToken,
              decl.type,
              rootObj,
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
      return (sf) => ts.visitNode(sf, visit) as ts.SourceFile;
    };
  }

  private patchProjectsArray(
    rootObj: ts.ObjectLiteralExpression,
    slug: string,
    projectData: Partial<AdminProject>,
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
        const fields = readObjectStringFields(el);
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
      bio,
    } = personalData;
    const hasPersonPatch =
      name !== undefined ||
      role !== undefined ||
      tagline !== undefined ||
      location !== undefined ||
      email !== undefined ||
      phone !== undefined ||
      linkedin !== undefined;
    const hasBio = bio !== undefined;
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
            factory.createStringLiteral(bio!),
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
          const simpleKeys = [
            "name",
            "role",
            "tagline",
            "email",
            "phone",
            "location",
          ] as const;
          if (
            simpleKeys.includes(pp.name.text as (typeof simpleKeys)[number]) &&
            personalData[pp.name.text as keyof AdminPersonalInfo] !== undefined
          ) {
            const val = personalData[pp.name.text as keyof AdminPersonalInfo] as string;
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
