import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()
const AI_AGENT_URL = process.env.AI_AGENT_URL || "http://localhost:8000"
const AI_BACKEND_SECRET = process.env.AI_BACKEND_SECRET || ""
const MAX_DOCUMENTS_PER_USER = 10

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    if (!AI_BACKEND_SECRET) {
      console.error("[AI-AGENT][DOCUMENTS] AI_BACKEND_SECRET not configured")
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    const formData = await req.formData()
    // Support multiple possible field names from the frontend
    const collectedFiles: File[] = []
    for (const key of ["documents", "files", "file"]) {
      const entries = formData.getAll(key)
      if (entries && entries.length) {
        for (const e of entries) {
          if (e instanceof File) collectedFiles.push(e)
        }
      }
    }

    // also accept single 'file' if provided via get (fallback)
    if (collectedFiles.length === 0) {
      const single = formData.get("file")
      if (single instanceof File) collectedFiles.push(single)
    }

    const sessionId = (formData.get("sessionId") as string) || ""

    if (collectedFiles.length === 0) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file types and sizes
    const allowedTypes = ["application/pdf", "text/plain"]
    const MAX_SIZE = 10 * 1024 * 1024

    // Get user and existing doc count
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const existingDocsCount = await prisma.document.count({ where: { userId: user.id } })
    if (existingDocsCount + collectedFiles.length > MAX_DOCUMENTS_PER_USER) {
      return NextResponse.json({
        error: `Document limit reached. Maximum ${MAX_DOCUMENTS_PER_USER} documents allowed per user.`,
      }, { status: 403 })
    }

    // Validate each file (MIME first, fallback to extension)
    const invalids: string[] = []
    for (const f of collectedFiles) {
      const mime = f.type || ""
      const name = f.name || ""
      const ext = name.split(".").pop()?.toLowerCase() || ""
      const isAllowed = allowedTypes.includes(mime) || ["pdf", "txt"].includes(ext)
      if (!isAllowed) invalids.push(`${name} (${mime || ext})`)
      if (f.size > MAX_SIZE) invalids.push(`${name} (too large)`)
    }
    if (invalids.length) {
      return NextResponse.json({
        error: "One or more files are invalid",
        details: invalids
      }, { status: 400 })
    }

    // Verify session if provided
    if (sessionId) {
      const chatSession = await prisma.aIChatSession.findUnique({ where: { id: sessionId } })
      if (!chatSession || chatSession.userId !== user.id) {
        return NextResponse.json({ error: "Invalid session" }, { status: 403 })
      }
    }

    // Build FormData to forward (preserve field name 'files' expected by backend)
    const uploadFormData = new FormData()
    for (const f of collectedFiles) {
      uploadFormData.append("files", f, f.name)
    }
    uploadFormData.append("userId", user.id)
    if (sessionId) uploadFormData.append("sessionId", sessionId)

    // Forward the multipart request to AI agent backend (do NOT set Content-Type)
    const uploadResp = await fetch(`${AI_AGENT_URL}/api/documents/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AI_BACKEND_SECRET}`,
      },
      body: uploadFormData,
    })

    if (!uploadResp.ok) {
      const text = await uploadResp.text()
      console.error("[AI-AGENT][DOCUMENTS] Upload failed:", uploadResp.status, text)
      return NextResponse.json({ error: "Document processing failed", details: text }, { status: 502 })
    }

    const result = await uploadResp.json()

    // Normalize backend response to get external ids per file
    // Accept shapes: { documentId: "id" } OR { documentIds: ["id1","id2"] } OR { documents: [{id,filename}, ...] }
    let externalIds: string[] = []
    if (Array.isArray(result.documentIds)) externalIds = result.documentIds
    else if (Array.isArray(result.documents)) externalIds = result.documents.map((d: any) => d.id || d.documentId).filter(Boolean)
    else if (typeof result.documentId === "string") externalIds = [result.documentId]
    else if (typeof result.id === "string") externalIds = [result.id]

    // If backend didn't return per-file ids, generate placeholders to still save metadata
    if (externalIds.length === 0) {
      externalIds = collectedFiles.map(() => "")
    }

    // Save metadata for each uploaded file
    const createdDocs = []
    for (let i = 0; i < collectedFiles.length; i++) {
      const f = collectedFiles[i]
      const extId = externalIds[i] || null
      const created = await prisma.document.create({
        data: {
          userId: user.id,
          filename: f.name,
          fileType: f.type || null,
          fileSize: f.size,
          externalId: extId,
          sessionId: sessionId || null,
        }
      })
      createdDocs.push(created)
    }

    console.log("[AI-AGENT][DOCUMENTS] Documents uploaded:", createdDocs.map(d => d.id))
    return NextResponse.json({ success: true, documents: createdDocs, backendResult: result })
  } catch (err) {
    console.error("[AI-AGENT][DOCUMENTS] Error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// GET endpoint to list user documents
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const documents = await prisma.document.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        filename: true,
        fileType: true,
        fileSize: true,
        createdAt: true,
        sessionId: true,
      }
    })

    return NextResponse.json({
      documents,
      count: documents.length,
      maxAllowed: MAX_DOCUMENTS_PER_USER,
    })
  } catch (err) {
    console.error("[AI-AGENT][DOCUMENTS] Error fetching documents:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
