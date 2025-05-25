import { Star } from "@phosphor-icons/react";
import { Link } from "react-router";

export function HomePage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-[400px] mx-4">
        <div className="px-4 py-8 md:p-10 flex flex-col justify-center bg-neutral-800 border border-neutral-700 gap-3  rounded-md text-center">
          <h1 className="text-3xl font-medium">Tic tac Toe Game</h1>
          <Link
            to={`/room/create`}
            className=" bg-cyan-800 py-2 mt-4 flex items-center gap-2 justify-center"
          >
            Play Online
          </Link>
          <Link to={"/game"} className=" bg-cyan-800 py-2">
            Play Offline
          </Link>
          <Link to={"/how-to-play"} className=" bg-cyan-800 py-2">
            How to Play?
          </Link>
          <Link to={"/support"} className=" bg-cyan-800 py-2">
            Help & Support
          </Link>
        </div>
        <footer className=" text-xs mt-1 text-neutral-400 italic text-center">
          <p>
            Created by{" "}
            <a
              rel="noopener"
              target="_blank"
              href="https://divyanshsoni.site"
              className="underline"
            >
              Divyansh soni
            </a>
          </p>
          <p className="flex items-center gap-1 justify-center mt-1">
            <Star size={12} weight="fill" />
            Give a star on{" "}
            <a
              href="https://github.com/divya-nsh/Tic-Tac-Toe-Ultimate" // <-- update this
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              GitHub
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
