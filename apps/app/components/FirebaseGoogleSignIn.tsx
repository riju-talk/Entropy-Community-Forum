"use client";
import { useRouter } from "next/navigation";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { app } from "@/lib/firebaseClient";

export default function FirebaseGoogleSignIn() {
  const router = useRouter();
  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();

  async function onClickSignIn() {
    try {
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      // Send to NextAuth credentials callback
      const res = await fetch("/api/auth/callback/firebase", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ provider: "firebase", token: idToken }),
        credentials: "include",
      });
      if (res.ok) {
        router.refresh();
      } else {
        console.error("NextAuth firebase signin failed", await res.text());
      }
    } catch (error) {
      console.error("Firebase signin error:", error);
    }
  }

  return <button onClick={onClickSignIn}>Sign in with Google (Firebase)</button>;
}
