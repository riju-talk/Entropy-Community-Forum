import Header from "@/components/header"
import DoubtDetail from "@/components/doubt-detail"

interface DoubtPageProps {
  params: {
    id: string
  }
}

export default function DoubtPage({ params }: DoubtPageProps) {
  return (
    <main className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <DoubtDetail doubtId={params.id} />
        </div>
      </div>
    </main>
  )
}
