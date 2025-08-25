import Header from "@/components/header"
import Sidebar from "@/components/sidebar"
import DoubtsFeed from "@/components/doubts-feed"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <aside className="lg:col-span-3">
            <Sidebar />
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-6">
            <DoubtsFeed />
          </div>

          {/* Right Sidebar - Communities */}
          <aside className="lg:col-span-3">
            <div className="sticky top-6 space-y-4">
              {/* Popular Communities */}
              <div className="bg-card border rounded-lg p-4">
                <h3 className="font-semibold mb-3">Popular Communities</h3>
                <div className="space-y-2">
                  {[
                    { name: "r/ComputerScience", members: "2.1M", icon: "💻" },
                    { name: "r/Mathematics", members: "1.8M", icon: "🔢" },
                    { name: "r/Physics", members: "1.5M", icon: "⚛️" },
                    { name: "r/Programming", members: "3.2M", icon: "👨‍💻" },
                    { name: "r/AskAcademia", members: "890K", icon: "🎓" },
                  ].map((community) => (
                    <div
                      key={community.name}
                      className="flex items-center gap-3 p-2 hover:bg-muted rounded cursor-pointer"
                    >
                      <span className="text-lg">{community.icon}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{community.name}</p>
                        <p className="text-xs text-muted-foreground">{community.members} members</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trending Topics */}
              <div className="bg-card border rounded-lg p-4">
                <h3 className="font-semibold mb-3">Trending Topics</h3>
                <div className="space-y-2">
                  {["Machine Learning", "Data Structures", "Quantum Physics", "React Hooks", "Linear Algebra"].map(
                    (topic) => (
                      <div key={topic} className="text-sm text-primary hover:underline cursor-pointer">
                        #{topic.replace(" ", "")}
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
