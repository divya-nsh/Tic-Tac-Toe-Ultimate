import React, { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";

export default function TicTacBoard({
  board,
  onClick,
  disable,
  currTurn,
  winDir,
  winPath,
}: {
  board: string[][];
  onClick?: (x: number, y: number, turn: "X" | "O") => void;
  disable?: boolean;
  currTurn: "X" | "O";
  winPath?: Map<string, number> | null;
  winDir?: "H" | "V" | "DR" | "DL" | null;
  maxWidth?: number;
}) {
  const [size, setSize] = useState(0);

  useEffect(() => {
    const calcCellSize = () => {
      console.log("REsizng...");
      const width = Math.min(window.innerWidth, 400);
      const cellSize = Math.min(Math.floor(width / board.length), 80);
      console.log({ cellSize: cellSize - 20 });
      setSize(Math.max(2, cellSize - 10));
    };

    calcCellSize();
    window.addEventListener("resize", calcCellSize);
    return () => window.removeEventListener("resize", calcCellSize);
  }, [board.length]);

  return (
    <div className="bg-slate-300 grid gap-1 w-max font-gluten">
      {board.map((rows, y) => (
        <div className="flex gap-1" key={y}>
          {rows.map((col, x) => (
            <button
              key={`${x}${y}`}
              onClick={() => onClick?.(x, y, currTurn)}
              style={{
                width: size,
                height: size,
              }}
              className={twMerge(
                "group flex relative bg-neutral-900 enabled:cursor-pointer items-center justify-center text-5xl shadow-inner h-[90px]",
                col === "X" && "text-rose-500 ",
                col === "O" && " text-cyan-600",
                col === "" && ""
              )}
              type="button"
              disabled={!!col || disable}
            >
              {col && (
                <span
                  className={twMerge(
                    winPath?.has(`${x}${y}`) && "opacity-90 shadow-md",
                    "animate-jump-in animate-duration-300"
                    // "drop-shadow-[0px_0px_12px_currentColor]"
                  )}
                >
                  {col}
                </span>
              )}

              {col === "" && !disable && (
                <span className="group-hover:block opacity-20 hidden">
                  {currTurn}
                </span>
              )}
              {winDir && winPath?.has(`${x}${y}`) && (
                <Strike
                  pathType={winDir}
                  delay={100 * winPath.get(`${x}${y}`)!}
                />
              )}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

function Strike({
  pathType,
  delay = 0,
}: {
  pathType?: "DL" | "H" | "V" | "DR";
  delay?: number;
}) {
  let style: React.CSSProperties = {};
  if (pathType === "V") {
    style = { transform: "rotate(90deg) scaleX(1.1)" };
  } else {
    if (pathType === "DR") style = { transform: "rotate(45deg) scaleX(1.50)" };
    if (pathType === "DL") style = { transform: "rotate(-45deg) scaleX(1.50)" };
  }

  return (
    <span
      className={`top-1/2 scale-110 animate-duration-100 animate-fade absolute left-0 right-0 z-0 h-1 bg-orange-400 shadow-[0_0_10px_3px_rgba(255,115,0,0.8)]`}
      style={{ ...style, animationDelay: delay + "ms" }}
    ></span>
  );
}
