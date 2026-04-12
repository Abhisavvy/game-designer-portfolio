import type { NextConfig } from "next";
import path from "path";

const projectRoot = __dirname;

const PROD_ADMIN_STUBS = {
  api: path.join(projectRoot, "webpack/admin-prod-stubs/api-route.ts"),
  app: path.join(projectRoot, "webpack/admin-prod-stubs/app-admin.tsx"),
  feature: path.join(projectRoot, "webpack/admin-prod-stubs/feature-admin.ts"),
} as const;

function resolveSpecifier(request: string, context: string): string {
  if (request.startsWith("@/")) {
    return path.normalize(path.join(projectRoot, "src", request.slice(2)));
  }
  if (path.isAbsolute(request)) {
    return path.normalize(request);
  }
  return path.normalize(path.join(context, request));
}

function pickAdminProdStub(resolvedPath: string): string | undefined {
  const norm = resolvedPath.replace(/\\/g, "/");
  if (norm.includes("/webpack/admin-prod-stubs/")) {
    return undefined;
  }
  if (
    norm.includes("/src/app/api/admin/") &&
    /\/route\.(mtsx|mts|cts|tsx|jsx|ts|js)$/.test(norm)
  ) {
    return PROD_ADMIN_STUBS.api;
  }
  if (
    norm.includes("/src/app/admin/") &&
    /\.(m?[tj]sx|m?[tj]s|jsx|mjs|cjs)$/.test(norm)
  ) {
    return PROD_ADMIN_STUBS.app;
  }
  if (
    norm.includes("/src/features/admin/") &&
    /\.(m?[tj]sx|m?[tj]s|jsx|mjs|cjs)$/.test(norm)
  ) {
    return PROD_ADMIN_STUBS.feature;
  }
  return undefined;
}

/** Redirects admin module resolution to stubs so real admin sources are not bundled in production. */
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
  webpack: (config, { dev }) => {
    if (!dev) {
      config.plugins.push(new ProductionAdminStubPlugin());
    }
    return config;
  },
};

export default nextConfig;
