import Header from "@/components/header"
import SignInForm from "@/components/sign-in-form"

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <Header />

      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="font-serif text-3xl font-bold text-slate-800 dark:text-slate-200 mb-2">Welcome Back</h1>
            <p className="text-neutral-600 dark:text-neutral-400">Sign in to your account to continue learning</p>
          </div>

          <SignInForm />
        </div>
      </div>
    </main>
  )
}
