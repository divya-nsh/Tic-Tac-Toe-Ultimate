import { Link } from "react-router";

export default function HowToPlay() {
  return (
    <div className="min-h-screen bg-neutral-900 text-white p-6 sm:p-10">
      <title>How To Play :: Tic Tac Toe</title>
      <div className="max-w-3xl mx-auto space-y-6">
        <Link
          to=".."
          className=" text-indigo-500 text-sm mb-2 text-center w-full"
        >
          {"<-"} Go Back
        </Link>
        <h1 className="text-3xl sm:text-4xl font-bold text-center">
          🕹️ How to Play The Game
        </h1>

        <section className="bg-gray-800 p-5 rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-2">🏁 Winning the Game</h2>
          <p className="text-gray-300">
            Its a classic 2 player Turn based Tic Tac toe Game and to win Align
            the required number of marks — vertically, horizontally, or
            diagonally — before your opponent does.
          </p>
        </section>

        <section className="bg-gray-800 p-5 rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-2">📏 Board Sizes</h2>
          <p className="text-gray-300">
            Choose from different board sizes:
            <ul className="list-disc ml-5 mt-2 space-y-1">
              <li>
                <strong>3×3:</strong> Align 3 marks in a row to win.
              </li>
              <li>
                <strong>5×5:</strong> Align 4 to win.
              </li>
              <li>
                <strong>6×6:</strong> Larger boards, more strategy — align 4 or
                more.
              </li>
            </ul>
          </p>
        </section>

        <section className="bg-gray-800 p-5 rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-2">🌐 Online Multiplayer</h2>
          <p className="text-gray-300">
            Create a room and invite your friend using a Room ID. Once they
            join, you'll be able to start the game and even chat during gameplay
            (chat may not always be reliable).
          </p>
        </section>

        <section className="bg-gray-800 p-5 rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-2">🧑‍🤝‍🧑 Offline & AI Play</h2>
          <p className="text-gray-300">
            You can also play offline with a friend on the same device, or
            challenge an AI opponent for some solo practice.
          </p>
        </section>

        <p className="text-center text-gray-500 text-sm mt-8">
          That’s it — just a fun little game. Enjoy playing! ✌️
        </p>
      </div>
    </div>
  );
}
