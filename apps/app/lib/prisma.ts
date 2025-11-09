// Provide a lazy Prisma client proxy so importing this module does NOT require
// the generated @prisma/client during Next.js build-time (avoids "did not initialize yet" errors).
let _client: any = null
let _initError: Error | null = null
let _initializing = false

function _initPrisma() {
	// If already initialized or attempted, return
	if (_client || _initializing) return
	_initializing = true
	try {
		// Dynamically require to avoid build-time resolution of @prisma/client
		// This will attempt to load the generated client at runtime.
		// If it's missing, provide a clear error for operators to run `npx prisma generate`.
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const { PrismaClient } = require("@prisma/client")
		_client = new PrismaClient()
		_initializing = false
	} catch (err: any) {
		_initError = err instanceof Error ? err : new Error(String(err))
		_initializing = false
	}
}

// Proxy handler - intercept property access and method calls
const handler: ProxyHandler<any> = {
	get(target, prop) {
		// Initialize on first access
		if (!_client && !_initError) {
			_initPrisma()
		}
		// If initialization failed, return a function that throws when invoked (deferred error)
		if (_initError) {
			return (..._args: any[]) => {
				throw new Error(
					"Prisma client not available at runtime. Run `npx prisma generate` before using the database. " +
					`Underlying error: ${_initError.message || String(_initError)}`
				)
			}
		}
		// If client exists, forward property
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return _client ? _client[prop as keyof typeof _client] : undefined
	},
	apply(_target, _thisArg, _args) {
		if (!_client && !_initError) _initPrisma()
		if (_initError) throw new Error("Prisma client not available at runtime. Run `npx prisma generate`.")
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return (_client as any).apply(_thisArg, _args)
	}
}

// Export the proxy as `prisma`. Importers can still use named methods like `prisma.user.findUnique(...)`
// without causing @prisma/client to be required at module import time.
export const prisma = new Proxy({}, handler)
