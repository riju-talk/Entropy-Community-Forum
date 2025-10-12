import "server-only"

// A robust, server-only Prisma client loader that works in ESM/CJS environments
// and avoids bundling native binaries in the browser preview.
type AnyFn = (...args: any[]) => any

declare global {
  // eslint-disable-next-line no-var
  var __PRISMA_CLIENT__: any | undefined
}

async function loadPrismaClientCtor(): Promise<new () => any> {
  const mod = await import("@prisma/client")
  // Try common shapes for ESM/CJS interop
  const PrismaClientCtor: any =
    // ESM named export
    (mod as any)?.PrismaClient ??
    // ESM default export might be a namespace with PrismaClient
    (mod as any)?.default?.PrismaClient ??
    // Some builds export the class directly as default
    (mod as any)?.default

  if (typeof PrismaClientCtor !== "function") {
    throw new Error(
      'Unable to load PrismaClient constructor from "@prisma/client". Ensure it is installed and generated with "npx prisma generate".',
    )
  }
  return PrismaClientCtor
}

async function getClient(): Promise<any> {
  if (!globalThis.__PRISMA_CLIENT__) {
    const PrismaClient = await loadPrismaClientCtor()
    const client = new PrismaClient()
    // Reuse in dev/hot reload to avoid too many connections
    globalThis.__PRISMA_CLIENT__ = client
  }
  return globalThis.__PRISMA_CLIENT__
}

// Deep proxy allows calling prisma.user.findMany without importing generated types at build-time.
// Also defines valueOf/toString to avoid "Cannot convert object to primitive value" traps.
function createDeepProxy(path: (string | symbol)[] = []): any {
  const callable: AnyFn = () => {}
  return new Proxy(callable, {
    get(_t, prop) {
      if (prop === "valueOf") return () => "[object PrismaProxy]"
      if (prop === "toString") return () => "[object PrismaProxy]"
      if (prop === "__isProxy") return true
      return createDeepProxy([...path, prop])
    },
    apply: async (_t, _a, args: unknown[]) => {
      const client = await getClient()
      // Walk the path chain to resolve client.user.findMany, etc.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let target: any = client
      for (const key of path) {
        target = target[key as keyof typeof target]
        if (target === undefined) {
          throw new Error(`Invalid Prisma path: ${String(path.map(String).join("."))}`)
        }
      }
      if (typeof target !== "function") {
        return target
      }
      return await target.apply(client, args)
    },
  })
}

export const prisma: any = createDeepProxy()
