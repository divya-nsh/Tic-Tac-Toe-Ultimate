import { Link } from "react-router";

export default function SupportPage() {
  return (
    <div className="min-h-screen text-white flex items-center justify-center px-4">
      <title>Help & Support - Tic Tac Toe Ultimate</title>
      <div className="max-w-md w-full text-center">
        <h1 className="text-3xl font-bold mb-4">Help & Support</h1>
        <p className="mb-6">
          Found a bug or issue or have suggestion? This project is code
          available on github Feel free to review it raise it or DM me on
          LinkedIn for any bug and suggestion.
        </p>

        <div className="space-y-4">
          <a
            href="https://github.com/divya-nsh/Tic-Tac-Toe-Ultimate"
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-blue-600 hover:bg-blue-700 transition rounded px-4 py-2 font-medium"
          >
            🔗 View Source Code on GitHub
          </a>
          <a
            href="https://www.linkedin.com/in/divyanshsoni279/"
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-indigo-600 hover:bg-indigo-700 transition rounded px-4 py-2 font-medium"
          >
            💬 DM me on LinkedIn
          </a>
          <Link to=".." className=" text-indigo-500 text-sm mb-2">
            {"<-"} Go Back
          </Link>
        </div>
      </div>
    </div>
  );
}
