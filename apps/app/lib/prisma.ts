// Provide a lazy Prisma client proxy so importing this module does NOT require
// the generated @prisma/client during Next.js build-time (avoids "did not initialize yet" errors).
let _client: any = null
let _initError: Error | null = null

function _initPrisma() {
  if (_client || _initError) return
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { PrismaClient } = require("@prisma/client")
    _client = new PrismaClient()
  } catch (err: any) {
    _initError = err instanceof Error ? err : new Error(String(err))
  }
}

const handler: ProxyHandler<any> = {
  get(target, prop) {
    if (!_client && !_initError) _initPrisma()
    if (_initError) {
      return (..._args: any[]) => {
        throw new Error(
          "Prisma client not available at runtime. Run `npx prisma generate` before using the database. " +
          `Underlying error: ${_initError.message || String(_initError)}`
        )
      }
    }
    return _client ? _client[prop as keyof typeof _client] : undefined
  }
}

export const prisma = new Proxy({}, handler)
