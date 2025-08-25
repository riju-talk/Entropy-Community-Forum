import Header from "@/components/header"
import AskDoubtForm from "@/components/ask-doubt-form"

export default function AskPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Ask a Question</h1>
            <p className="text-muted-foreground">Get help from the community by asking your academic questions</p>
          </div>

          <AskDoubtForm />
        </div>
      </div>
    </main>
  )
}
