const { URL } = require("url")

exports.handler = async function (event, context) {
  try {
    const AI_AGENT_URL =
      process.env.AI_AGENT_URL ||
      process.env.NEXT_PUBLIC_AI_AGENT_URL ||
      "http://localhost:8000"

    // Determine splat portion from invoked path
    const fnPrefix = "/.netlify/functions/proxy-ai-agent/"
    let splat = ""
    if (event.path && event.path.startsWith(fnPrefix)) {
      splat = event.path.slice(fnPrefix.length)
    } else if (event.path) {
      splat = event.path.replace(/^\/+/, "")
    }

    // Build target backend URL
    let target = `${AI_AGENT_URL.replace(/\/+$/, "")}/api/ai-agent/${splat.replace(/^\/+/, "")}`
    if (event.queryStringParameters && Object.keys(event.queryStringParameters).length > 0) {
      const qs = new URLSearchParams(event.queryStringParameters).toString()
      target += `?${qs}`
    }

    // Clone headers and sanitize
    const forwardHeaders = Object.assign({}, event.headers || {})
    delete forwardHeaders["host"]
    delete forwardHeaders["content-length"]
    forwardHeaders["accept-encoding"] = "identity"

    // Prepare body
    const body = event.isBase64Encoded ? Buffer.from(event.body, "base64") : event.body

    const fetchOptions = {
      method: event.httpMethod || "GET",
      headers: forwardHeaders,
      body: ["GET", "HEAD"].includes((event.httpMethod || "GET").toUpperCase()) ? undefined : body,
      redirect: "follow",
    }

    // Use global fetch (Node 18+) or node-fetch fallback
    const _fetch = global.fetch || (await import("node-fetch")).default
    const resp = await _fetch(target, fetchOptions)

    // Build response headers (exclude hop-by-hop)
    const respHeaders = {}
    resp.headers.forEach((v, k) => {
      if (["transfer-encoding", "connection", "keep-alive"].includes(k.toLowerCase())) return
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
