export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-black text-center mb-8">
          🎭 Costume Voting App
        </h1>

        <div className="space-y-4">
          <a
            href="/admin"
            className="block w-full bg-blue-600 text-white text-center py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
          >
            👤 Admin - Upload Costume
          </a>

          <a
            href="/vote"
            className="block w-full bg-green-600 text-white text-center py-3 px-6 rounded-lg hover:bg-green-700 transition-colors"
          >
            👍 Vote on Costumes
          </a>

          <a
            href="/winners"
            className="block w-full bg-yellow-600 text-white text-center py-3 px-6 rounded-lg hover:bg-yellow-700 transition-colors"
          >
            🏆 View Winners
          </a>
        </div>

        <div className="mt-8 text-center text-gray-600">
          <p className="text-sm">
            Upload a costume, vote on it, and see the winners!
          </p>
        </div>
      </div>
    </div>
  );
}
