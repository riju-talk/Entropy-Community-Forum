import { initializeApp, getApps, FirebaseApp } from "firebase/app"
import { getAuth, GoogleAuthProvider, GithubAuthProvider, onIdTokenChanged, User, signInWithPopup, signOut } from "firebase/auth"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
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
