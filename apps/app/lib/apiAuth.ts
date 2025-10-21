import { adminAuth } from "./firebaseAdmin";

export async function requireAuth(req: Request) {
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.replace("Bearer ", "");
  if (!token) throw new Error("No auth token");
  const decoded = await adminAuth.verifyIdToken(token);
  return decoded; // contains uid, email, name, etc.
}
