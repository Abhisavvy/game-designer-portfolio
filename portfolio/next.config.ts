import type { NextConfig } from "next";
import path from "path";

const projectRoot = __dirname;

/**
 * Static file stubs for admin App Router segments and API routes.
 *
 * Feature modules under `src/features/admin/` use `admin-feature-prod-stub-loader.cjs`
 * instead (see ProductionAdminStubPlugin): a single empty `export {}` file cannot satisfy
 * arbitrary named imports, so the loader synthesizes matching export names from the
 * original source at build time.
 */
const PROD_ADMIN_STUBS = {
  api: path.join(projectRoot, "webpack/admin-prod-stubs/api-route.ts"),
  appPage: path.join(projectRoot, "webpack/admin-prod-stubs/app-admin-page.tsx"),
  appLayout: path.join(projectRoot, "webpack/admin-prod-stubs/app-admin-layout.tsx"),
  appTemplate: path.join(projectRoot, "webpack/admin-prod-stubs/app-admin-template.tsx"),
  appLoading: path.join(projectRoot, "webpack/admin-prod-stubs/app-admin-loading.tsx"),
  appError: path.join(projectRoot, "webpack/admin-prod-stubs/app-admin-error.tsx"),
  appGlobalError: path.join(
    projectRoot,
    "webpack/admin-prod-stubs/app-admin-global-error.tsx",
  ),
  appNotFound: path.join(projectRoot, "webpack/admin-prod-stubs/app-admin-not-found.tsx"),
  appRoute: path.join(projectRoot, "webpack/admin-prod-stubs/app-admin-route.ts"),
} as const;

const FEATURE_ADMIN_STUB_LOADER = path.join(
  projectRoot,
  "webpack/admin-feature-prod-stub-loader.cjs",
);

function resolveSpecifier(request: string, context: string): string {
  if (request.startsWith("@/")) {
    return path.normalize(path.join(projectRoot, "src", request.slice(2)));
  }
  if (path.isAbsolute(request)) {
    return path.normalize(request);
  }
  return path.normalize(path.join(context, request));
}

/** Webpack `request` strings: use forward slashes so inline loaders resolve consistently. */
function webpackRequestPath(fsPath: string): string {
  return fsPath.replace(/\\/g, "/");
}

/**
 * Picks a production stub for dev-only admin sources.
 *
 * Limitations:
 * - Only applies in production webpack (`!dev` in next.config); dev uses real files.
 * - `src/middleware.ts` and other non-matched entry points are not rewritten — keep admin-only imports inside matched paths.
 * - Feature stub export detection is heuristic (see loader JSDoc); `export * from` is not supported.
 */
function pickAdminProdStub(resolvedPath: string): string | undefined {
  const norm = resolvedPath.replace(/\\/g, "/");
  if (norm.includes("/webpack/admin-prod-stubs/")) {
    return undefined;
  }
  if (norm.includes("/webpack/admin-feature-prod-stub-loader.cjs")) {
    return undefined;
  }

  if (
    norm.includes("/src/app/api/admin/") &&
    /\/route\.(mts|cts|tsx|jsx|ts|js)$/.test(norm)
  ) {
    return PROD_ADMIN_STUBS.api;
  }

  if (norm.includes("/src/app/admin/")) {
    if (!/\.(m?[tj]sx|m?[tj]s|jsx|mjs|cjs)$/.test(norm)) {
      return undefined;
    }
    const stem = path.parse(norm).name;

    switch (stem) {
      case "route":
        return PROD_ADMIN_STUBS.appRoute;
      case "layout":
        return PROD_ADMIN_STUBS.appLayout;
      case "template":
        return PROD_ADMIN_STUBS.appTemplate;
      case "loading":
        return PROD_ADMIN_STUBS.appLoading;
      case "error":
        return PROD_ADMIN_STUBS.appError;
      case "global-error":
        return PROD_ADMIN_STUBS.appGlobalError;
      case "not-found":
        return PROD_ADMIN_STUBS.appNotFound;
      case "page":
      case "default":
        return PROD_ADMIN_STUBS.appPage;
      default:
        // e.g. `opengraph-image.tsx`, `sitemap.ts` — fall back to a safe RSC stub
        return PROD_ADMIN_STUBS.appPage;
    }
  }

  if (
    norm.includes("/src/features/admin/") &&
    /\.(m?[tj]sx|m?[tj]s|jsx|mjs|cjs)$/.test(norm)
  ) {
    return `!!${webpackRequestPath(FEATURE_ADMIN_STUB_LOADER)}!${webpackRequestPath(norm)}`;
  }

  return undefined;
}

/**
 * Redirects admin module resolution so real admin sources are not bundled in production.
 *
 * - API + App Router files: replaced by static stubs under `webpack/admin-prod-stubs/`.
 * - Feature modules: `!!loader!original` chain so the loader emits a synthetic module with
 *   the same export surface (no-op implementations) without following real admin imports.
 */
class ProductionAdminStubPlugin {
  apply(compiler: {
    hooks: {
      normalModuleFactory: {
        tap: (
          name: string,
          fn: (nmf: {
            hooks: {
              beforeResolve: {
                tap: (
                  name: string,
                  fn: (data: {
                    context: string;
                    request: string | false;
                  }) => void,
                ) => void;
              };
            };
          }) => void,
        ) => void;
      };
    };
  }) {
    compiler.hooks.normalModuleFactory.tap(
      "ProductionAdminStubPlugin",
      (nmf) => {
        nmf.hooks.beforeResolve.tap("ProductionAdminStubPlugin", (data) => {
          if (!data.request || typeof data.request !== "string") return;
          if (data.request.startsWith("data:")) return;

          let resolved: string;
          try {
            resolved = resolveSpecifier(data.request, data.context);
          } catch {
            return;
          }

          const stub = pickAdminProdStub(resolved);
          if (stub) {
            data.request = stub;
          }
        });
      },
    );
  }
}

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react']
  },
  webpack: (config, { dev }) => {
    if (!dev) {
      config.plugins.push(new ProductionAdminStubPlugin());
    }
    return config;
  },
};

export default nextConfig;
