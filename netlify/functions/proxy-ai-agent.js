const { URL } = require("url")

exports.handler = async function (event, context) {
  try {
    const AI_AGENT_URL =
      process.env.AI_AGENT_URL || process.env.NEXT_PUBLIC_SPARK_API_URL || "http://localhost:8000"
    const AI_BACKEND_TOKEN = process.env.AI_BACKEND_TOKEN || process.env.NEXT_PUBLIC_AI_BACKEND_TOKEN || ""

    // Expect incoming path like "/api/ai-agent/..."
    const prefix = "/api/ai-agent"
    const incomingPath = event.path || ""
    if (!incomingPath.startsWith(prefix)) {
      return { statusCode: 404, body: "Not Found" }
    }

    const rest = incomingPath.slice(prefix.length) || ""
    const base = AI_AGENT_URL.replace(/\/+$/, "")
    const qs = event.rawQueryString ? `?${event.rawQueryString}` : ""
    const target = `${base}/api${rest}${qs}`

    // Build headers to forward
    const forwardHeaders = Object.assign({}, event.headers || {})
    delete forwardHeaders["host"]
    delete forwardHeaders["content-length"]
    delete forwardHeaders["transfer-encoding"]
    delete forwardHeaders["connection"]
    forwardHeaders["accept-encoding"] = "identity"

    if (AI_BACKEND_TOKEN && !(forwardHeaders["authorization"] || forwardHeaders["Authorization"])) {
      forwardHeaders["Authorization"] = `Bearer ${AI_BACKEND_TOKEN}`
    }

    // Prepare body
    const body = event.body ? (event.isBase64Encoded ? Buffer.from(event.body, "base64") : event.body) : undefined

    const _fetch = global.fetch || (await import("node-fetch")).default
    const resp = await _fetch(target, {
      method: event.httpMethod || "GET",
      headers: forwardHeaders,
      body: ["GET", "HEAD"].includes((event.httpMethod || "GET").toUpperCase()) ? undefined : body,
      redirect: "follow",
    })

    // Collect response headers
    const respHeaders = {}
    resp.headers.forEach((v, k) => {
      const key = k.toLowerCase()
      if (["transfer-encoding", "connection", "keep-alive"].includes(key)) return
      respHeaders[k] = v
    })

    const contentType = resp.headers.get("content-type") || ""
    const isBinary = !/^(text\/|application\/(json|javascript|xml|x-www-form-urlencoded|plain))/i.test(contentType)

    if (isBinary) {
      const arrayBuffer = await resp.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      return {
        statusCode: resp.status,
        headers: respHeaders,
        body: buffer.toString("base64"),
        isBase64Encoded: true,
      }
    } else {
      const text = await resp.text()
      return {
        statusCode: resp.status,
        headers: respHeaders,
        body: text,
        isBase64Encoded: false,
      }
    }
  } catch (err) {
    console.error("Proxy error:", err)
    return {
      statusCode: 502,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ error: "Proxy failed", detail: String(err) }),
    }
  }
}
