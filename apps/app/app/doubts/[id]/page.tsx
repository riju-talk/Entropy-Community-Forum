import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Header} from "@/components/header"
import { DoubtDetail } from "@/components/doubt-detail"

async function getDoubt(id: string) {
  try {
    const doubt = await prisma.doubt.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            name: true,
            image: true,
          },
        },
        answers: {
          include: {
            author: {
              select: {
                name: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        _count: {
          select: {
            answers: true,
            votes: true,
          },
        },
      },
    })

    return doubt
  } catch (error) {
    console.error("Error fetching doubt:", error)
    return null
  }
}

export default async function DoubtPage({ params }: { params: { id: string } }) {
  const doubt = await getDoubt(params.id)

  if (!doubt) {
    notFound()
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <DoubtDetail doubt={doubt} answers={doubt.answers} />
      </main>
    </div>
  )
}
