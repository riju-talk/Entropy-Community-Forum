// lib/firebaseAdmin.ts
import { initializeApp, getApp, getApps, cert } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"

function parseServiceAccountEnv(): Record<string, any> {
  const envRaw = process.env.FIREBASE_SERVICE_ACCOUNT || process.env.FIREBASE_PRIVATE_KEY || ""

  if (!envRaw) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT (or FIREBASE_PRIVATE_KEY) is not set. Set it to a base64-encoded JSON or the JSON string."
    )
  }

  // Try full JSON first (common in local dev if you pasted it directly)
  try {
    const maybeJson = envRaw.trim()
    if (maybeJson.startsWith("{")) {
      return JSON.parse(maybeJson)
    }
  } catch (e) {
    // fallthrough
  }

  // Try base64 decode (common in Vercel / .env encoding)
  try {
    const decoded = Buffer.from(envRaw, "base64").toString("utf-8")
    const trimmed = decoded.trim()
    if (trimmed.startsWith("{")) {
      return JSON.parse(trimmed)
    }
  } catch (e) {
    // fallthrough
  }

  // Try replacing escaped newlines (sometimes JSON in env replaces \n)
  try {
    const replaced = envRaw.replace(/\\n/g, "\n").trim()
    if (replaced.startsWith("{")) {
      return JSON.parse(replaced)
    }
  } catch (e) {
    // fallthrough
  }

  // If nothing worked, throw with helpful hint
  throw new Error(
    "Failed to parse Firebase service account JSON. Ensure FIREBASE_SERVICE_ACCOUNT is either: (a) base64-encoded JSON, (b) raw JSON string, or (c) JSON string with escaped newlines (\\n)."
  )
}

export function initFirebaseAdmin() {
  if (getApps().length > 0) {
    const app = getApp();
    return { app, auth: getAuth(app) };
  }

  const serviceAccount = parseServiceAccountEnv();
  const app = initializeApp({
    credential: cert(serviceAccount),
  });

  return { app, auth: getAuth(app) };
}

// default export: auth helper
export const { auth: adminAuth } = initFirebaseAdmin();
