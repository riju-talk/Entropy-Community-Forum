import { initializeApp, getApps, FirebaseApp } from "firebase/app"
import { getAuth, GoogleAuthProvider, GithubAuthProvider, onIdTokenChanged, User, signInWithPopup, signOut } from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyBfIJ_-5FMtEShFjxm-5S5xrAZL2W4T6Uw",
  authDomain: "entropy-53ac4.firebaseapp.com",
  projectId: "entropy-53ac4",
  storageBucket: "entropy-53ac4.firebasestorage.app",
  messagingSenderId: "336909724845",
  appId: "1:336909724845:web:bce86cb84c780a1a15aa24",
  measurementId: "G-4E3FP09S5S"
}

function getFirebaseApp(): FirebaseApp {
  if (!getApps().length) {
    return initializeApp(firebaseConfig)
  }
  return getApps()[0]!
}

export const app = getFirebaseApp()
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
export const githubProvider = new GithubAuthProvider()

export async function signInWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider)
  return result.user
}

export async function signInWithGithub(): Promise<User> {
  const result = await signInWithPopup(auth, githubProvider)
  return result.user
}

export async function signOutClient() {
  await signOut(auth)
}

// Helper: get current ID token
export async function getIdToken(forceRefresh = false): Promise<string | null> {
  if (!auth.currentUser) return null
  return await auth.currentUser.getIdToken(forceRefresh)
}

// Optional: attach listener to keep token fresh
export function onAuthTokenChanged(cb: (token: string | null) => void) {
  return onIdTokenChanged(auth, async (user: User | null) => {
    const token = user ? await user.getIdToken() : null
    cb(token)
  })
}
