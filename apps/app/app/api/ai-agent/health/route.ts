import { NextResponse } from "next/server"

const AI_AGENT_URL = process.env.AI_AGENT_URL || "http://localhost:8000"

export async function GET() {
	// Avoid network calls during static export / build
	if (process.env.VERCEL || process.env.SKIP_AI_AGENT_HEALTH_CHECK === "true") {
		return new Response(
			JSON.stringify({
				skipped: true,
				status: "degraded",
				reason: "Skipped agent health check during build",
				aiAgentUrlConfigured: !!process.env.AI_AGENT_URL,
			}),
			{ status: 200, headers: { "content-type": "application/json" } }
		)
	}

	const base = process.env.AI_AGENT_URL
	if (!base) {
		return new Response(
			JSON.stringify({
				status: "degraded",
				error: "AI_AGENT_URL not set",
			}),
			{ status: 200, headers: { "content-type": "application/json" } }
		)
	}

	try {
		const r = await fetch(`${base.replace(/\/+$/, "")}/health`, { timeout: 4000 })
		const data = await r.json().catch(() => ({}))
		return new Response(
			JSON.stringify({
				status: r.ok ? "ok" : "error",
				upstream: data,
			}),
			{ status: 200, headers: { "content-type": "application/json" } }
		)
	} catch (err: any) {
		return new Response(
			JSON.stringify({
				status: "degraded",
				error: "agent unreachable",
				message: err?.message,
			}),
			{ status: 200, headers: { "content-type": "application/json" } }
		)
	}
}
