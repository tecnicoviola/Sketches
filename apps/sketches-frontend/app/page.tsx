import { Button } from "../../../packages/ui/src/button";
import { Card } from "../../../packages/ui/src/card";
import { Pencil, Share2, Users2, Sparkles, GitBranch, Download } from "lucide-react";
import Link from "next/link"; //not the whole page  get loaded by loading the link

function App() {
  return (
    <div className="min-h-screen bg-linear-to-br from-black via-neutral-900 to-neutral-800 text-white">

      {/* Hero */}
      <header className="text-center py-24 px-4">
        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight">
          Collaborative Whiteboarding
          <span className="block text-blue-500 mt-2">Made Simple</span>
        </h1>

        <p className="mt-6 text-lg text-gray-400 max-w-2xl mx-auto">
          Create, collaborate, and share diagrams in real-time with a beautiful canvas experience.
        </p>

        <div className="mt-10 flex justify-center gap-6">
          <Link href="/signin">
            <Button className="bg-blue-500 hover:bg-blue-600 flex items-center gap-2">
              Sign in <Pencil size={16} />
            </Button>
          </Link>

          <Link href="/signup">
            <Button className="border border-white/30 hover:bg-white/10">
              Sign up
            </Button>
          </Link>
        </div>
      </header>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">

          <Card className="p-6 border border-white/10 backdrop-blur-lg">
            <div className="flex items-center gap-4">
              <Share2 className="text-blue-400" />
              <h3 className="text-xl font-semibold">Real-time Collaboration</h3>
            </div>
            <p className="mt-4 text-gray-400">
              Work with your team instantly from anywhere.
            </p>
          </Card>

          <Card className="p-6 border border-white/10 backdrop-blur-lg">
            <div className="flex items-center gap-4">
              <Users2 className="text-green-400" />
              <h3 className="text-xl font-semibold">Multiplayer Editing</h3>
            </div>
            <p className="mt-4 text-gray-400">
              Multiple users drawing simultaneously.
            </p>
          </Card>

          <Card className="p-6 border border-white/10 backdrop-blur-lg">
            <div className="flex items-center gap-4">
              <Sparkles className="text-purple-400" />
              <h3 className="text-xl font-semibold">Smart Drawing</h3>
            </div>
            <p className="mt-4 text-gray-400">
              AI-assisted diagram creation tools.
            </p>
          </Card>

        </div>
      </section>

      {/* CTA */}
      <section className="py-24 text-center">
        <div className="bg-linea-to-r from-blue-600 to-purple-600 p-12 rounded-3xl max-w-4xl mx-auto shadow-2xl">
          <h2 className="text-4xl font-bold">Ready to start creating?</h2>

          <p className="mt-4 text-white/80">
            Join thousands of creators building amazing visuals.
          </p>

          <div className="mt-8 flex justify-center gap-6">
            <Button className="bg-white text-black flex items-center gap-2">
              Open Canvas <Pencil size={16} />
            </Button>

            <Button className="border border-white hover:bg-white/10">
              View Gallery
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-white/10 px-6">
        <div className="flex justify-between max-w-6xl mx-auto items-center">
          <p className="text-gray-400 text-sm">
            © 2026 Sketches
          </p>

          <div className="flex gap-6">
            <a href="https://github.com">
              <GitBranch className="hover:text-blue-400 transition" />
            </a>
            <Download className="hover:text-blue-400 transition cursor-pointer" />
          </div>
        </div>
      </footer>

    </div>
  );
}

export default App;