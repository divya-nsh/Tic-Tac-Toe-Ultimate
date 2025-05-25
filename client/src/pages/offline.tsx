import TicTacBoard from "../components/Board";
import { useImmer } from "use-immer";
import { useCallback, useEffect, useState } from "react";
import {
  aiPlayer,
  checkWin,
  generateBoard,
  getEmptyPlaces,
} from "../utils/logic";
import { Link } from "react-router";
import { twMerge } from "tailwind-merge";
import {
  ArrowLeft,
  Gear,
  SpeakerHigh,
  SpeakerSlash,
} from "@phosphor-icons/react";
import { Popover } from "radix-ui";
import toast from "react-hot-toast";
import { gameSound } from "../utils/util";

type Move = "X" | "O" | "";
type TicTacBoard = Move[][];

type GameState = {
  board: Move[][];
  isOver: boolean;
  currTurn: "X" | "O";
  winner: "X" | "O" | "D" | null;
  winDir: "H" | "V" | "DR" | "DL" | null;
  winPath: Map<string, number> | null;
  aiTurn: boolean;
  aiDiff: number;
  isAi: boolean;
  scores: { X: number; O: number; D: number };
};

const intialState = (size: number): GameState => {
  return {
    board: generateBoard(size),
    isOver: false,
    currTurn: "X",
    winner: null,
    winDir: null,
    winPath: null,
    isAi: true,
    aiTurn: false,
    aiDiff: 2,
    scores: { X: 0, O: 0, D: 0 },
  };
};

const boardSizeToAlign: Record<number, number> = { 3: 3, 4: 3, 5: 4, 6: 4 };
const size = 3;
//Curently ignore checking win
export default function OfflineGame() {
  const [gameState, udpateState] = useImmer<GameState>(intialState(size));
  const [showReplay, setShowReplay] = useState(false);
  const canPlay = !gameState.isOver && !gameState.aiTurn;
  const [soundOn, setSoundOn] = useState(gameSound.isSoundOn());

  const makeMove = useCallback(
    (x: number, y: number) => {
      udpateState((draft) => {
        draft.board[y][x] = draft.currTurn;
        draft.currTurn = draft.currTurn === "X" ? "O" : "X";

        const isWin = checkWin(
          draft.board,
          boardSizeToAlign[draft.board.length] || 3
        );
        if (isWin) {
          draft.isOver = true;
          draft.winner = isWin.player as "X" | "O";
          draft.winDir = isWin.dir as GameState["winDir"];
          draft.winPath = new Map(
            isWin.winPath.map((v, i) => [`${v[0]}${v[1]}`, i])
          );
          draft.scores[draft.winner!]++;
          gameSound.winSound();
        } else if (getEmptyPlaces(draft.board).length === 0) {
          draft.isOver = true;
          draft.winner = "D";
          draft.scores.D++;
          gameSound.drawSound();
        }

        if (draft.isAi) {
          draft.aiTurn = draft.currTurn === "O";
        }
        if (!draft.isOver) {
          if (draft.currTurn === "X") {
            gameSound.xSound();
          } else gameSound.ySound();
        }
      });
    },
    [udpateState]
  );

  const handlePlay = (x: number, y: number) => {
    if (!canPlay) return;
    if (gameState.board[y][x] !== "") return;
    makeMove(x, y);
  };

  const replayGame = () => {
    udpateState((draft) => {
      Object.assign(draft, {
        board: generateBoard(size),
        isOver: false,
        winner: null,
        winDir: null,
        winPath: null,
      });
    });
    setShowReplay(false);
  };

  const resetGame = (opt: {
    isAi?: boolean;
    aiDiff?: number;
    size?: number;
  }) => {
    udpateState({ ...intialState(opt.size || size), ...opt });
    setShowReplay(false);
  };

  useEffect(() => {
    if (gameState.isOver || !gameState.aiTurn) return;
    const timer = setTimeout(() => {
      const [aiX, aiY] = aiPlayer(
        gameState.board.map((v) => [...v]),
        3,
        gameState.aiDiff
      );
      makeMove(aiX, aiY);
    }, 350);

    return () => clearTimeout(timer);
  }, [
    gameState.aiTurn,
    gameState.isOver,
    gameState.board,
    makeMove,
    gameState.aiDiff,
  ]);

  useEffect(() => {
    if (gameState.isOver) {
      const timer = setTimeout(() => {
        setShowReplay(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [gameState.isOver]);

  const message = (() => {
    if (gameState.winner === "D") {
      return "Game Draw";
    }
    if (gameState.isAi) {
      if (gameState.winner === "O") {
        return "☹ You Loss, Ai Win";
      }
      if (gameState.winner === "X") {
        return "🎉 You Win";
      }
    }
    if (gameState.isOver) {
      return `${gameState.winner} Wins`;
    }
    return gameState.currTurn + " Turns";
  })();

  const toogleSound = () => {
    setSoundOn((p) => !p);
    gameSound.setSoundOn(!soundOn);
  };

  return (
    <div className=" bg-neutral-900 min-h-screen inset-0 text-neutral-100">
      <div className="mx-auto text-left max-w-[650px] flex flex-col items-center shadow-white bg-neutral-900 border border-neutral-800 min-h-screen">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-800 py-2 w-full px-2">
          <Link to={".."} className="hover:opacity-80">
            <ArrowLeft size={25} />
          </Link>
          <p className="font-gluten text-neutral-300">
            🎮 {gameState.isAi ? "You vs Computer 🤖" : "Friend Match 👥"}
          </p>
          <div className="flex items-center gap-2">
            <Popover.Root>
              <Popover.Trigger className=" text-neutral-300">
                <Gear size={25} />
              </Popover.Trigger>

              <Popover.Portal>
                <Popover.Content className=" flex flex-col px-2 py-4 gap-2 flex-wrap bg-neutral-800 border border-neutral-700 rounded-lg">
                  <select
                    title="Board Size"
                    value={gameState.board.length}
                    onChange={(e) => {
                      resetGame({ size: +e.target.value });
                    }}
                    className="border rounded-md py-2 border-neutral-800 text-neutral-300 px-2 bg-neutral-900 text-sm"
                  >
                    <option value="3">3x3 - classic</option>
                    <option value="4">4x4 - align 3 to win</option>
                    <option value="5">5x5 - align 4 to win</option>
                    <option value="6">6x6 - align 4 to win</option>
                  </select>
                  <select
                    title="Mode"
                    value={gameState.isAi ? "1" : "2"}
                    onChange={(e) => {
                      resetGame({ isAi: e.target.value === "1" });
                    }}
                    className="border rounded-md py-2 border-neutral-800 text-neutral-300 px-2 bg-neutral-900 text-sm"
                  >
                    <option value="1">Play Vs Ai</option>
                    <option value="2">Play Vs Friend</option>
                  </select>
                  {gameState.isAi && (
                    <select
                      title="Ai difficulty"
                      value={gameState.aiDiff}
                      onChange={(e) => {
                        resetGame({ aiDiff: +e.target.value });
                      }}
                      className="border rounded-md py-2 border-neutral-800 text-neutral-300 px-2 bg-neutral-900 text-sm"
                    >
                      {["Easy", "Medium"].map((v, i) => (
                        <option value={i + 1}>{v}</option>
                      ))}
                    </select>
                  )}
                  <button
                    onClick={() => {
                      toast("Game Reseted");
                      resetGame({});
                    }}
                    className=" bg-red-800 rounded-lg py-1.5 text-sm"
                  >
                    Reset
                  </button>
                  <Popover.Arrow className=" fill-neutral-700" />
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>
            <button
              onClick={toogleSound}
              title="Toogle Sound"
              className=" text-neutral-300 cursor-pointer"
            >
              {soundOn ? <SpeakerHigh size={25} /> : <SpeakerSlash size={25} />}
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center items-center pb-2">
          <p
            className={twMerge(
              "text-[1.3rem] font-gluten mb-1 text-center transition-all duration-300 drop-shadow-[1px_1px_10px_currentColor]",
              gameState.currTurn === "X" ? "text-rose-500 " : " text-blue-600",
              gameState.isOver && "text-orange-400 animate-pulse animate-once"
            )}
          >
            {message}
          </p>

          <div
            className={twMerge(
              gameState.isOver ? " opacity-90" : "",
              "border-2 rounded-md border-neutral-800 transition-opacity duration-300"
            )}
          >
            <TicTacBoard
              board={gameState.board}
              currTurn={gameState.currTurn}
              onClick={handlePlay}
              disable={!canPlay}
              winPath={gameState.winPath}
              winDir={gameState.winDir}
            />
          </div>

          {showReplay && (
            <div className="mt-2 flex gap-4 animate-fadeIn justify-center">
              <button
                autoFocus
                onClick={replayGame}
                className="text-sm
                bg-blue-600 shadow-sm shadow-blue-500 px-4 py-0.5 rounded-md mt-2"
              >
                Replay
              </button>
              <button className="text-sm bg-rose-600 shadow-sm hover:opacity-70 shadow-rose-500 px-4 py-0.5 rounded-md mt-2">
                Reset
              </button>
            </div>
          )}
        </div>

        <div className="py-2 w-full border-t border-neutral-800 flex justify-center">
          <table>
            <thead>
              <tr>
                <th className={twMerge("text-center px-4 font-medium ")}>
                  {gameState.isAi ? "You (X)" : "Player X"}
                </th>
                <th className=" text-center px-4 font-medium">Draw</th>
                <th className=" text-center px-4 font-medium">
                  {gameState.isAi ? "Computer (X)" : "Player O"}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className=" text-center px-4">{gameState.scores.X}</td>
                <td className=" text-center px-4">{gameState.scores.D}</td>
                <td className=" text-center px-4">{gameState.scores.O}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
