import {
  ArrowLeft,
  ArrowsOutSimple,
  ChatTeardropDots,
  CircleNotch,
  SpeakerHigh,
  SpeakerSlash,
  SpinnerGap,
  WifiHigh,
  WifiSlash,
  X,
} from "@phosphor-icons/react";
import { startTransition, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router";
import io from "socket.io-client";
import { useImmer } from "use-immer";
import confetti from "canvas-confetti";
import TicTacBoard from "../components/Board";
import { twMerge } from "tailwind-merge";
import { getSession } from "../utils/util";
import { ChartBox } from "../components/ChartBox";
import { Waiting } from "../components/RoomWaiting";
import { ChartMsg, ServerGameState, TypedSocket } from "../types";
import { useBreakpoint } from "../hooks/useBreakpoint";
import { Sheet, SheetContent, SheetTrigger } from "../components/ui/Sheet";
import { Dialog, DialogContent } from "../components/ui/Dialog";
import EmojiDropdown from "../components/EmojiReaction";
import { gameSound, toggleFullScreen } from "../utils/util";
const URL = import.meta.env.VITE_SERVER_URL; // your server URL

const socket: TypedSocket = io(URL, {
  autoConnect: false, // Important! We control connection manually
  auth: {
    sid: getSession(),
  },
});

type RoomStatus =
  | "connecting"
  | "connected"
  | "disconnected"
  | "error"
  | "aborted";

export default function Room() {
  const { roomId } = useParams();
  const [status, setStatus] = useState<RoomStatus>("connecting");
  const [state, updateState] = useImmer<ServerGameState | null>(null);
  const [error, setError] = useState<null | string>(null);
  const [showReplay, setShowReplay] = useState(false);
  const [isMobileChartOpen, setChartBarOpen] = useState(false);
  const isMobile = useBreakpoint("(max-width: 768px)");
  const [charts, setCharts] = useState<ChartMsg[]>([]);
  const userIdRef = useRef<number | null>(null);
  const [isReqReplayPending, setReqReplayPending] = useState(false);
  const [soundOn, setSoundOn] = useState(gameSound.isSoundOn());
  const navigate = useNavigate();

  const me = state?.players[userIdRef.current!];

  useEffect(() => {
    socket.auth = { ...socket.auth, roomId: roomId };
    setStatus("connecting");
    socket.on("connect", () => setStatus("connected"));

    socket.on("stateChange", ({ state, flag, yourId }) => {
      const me = state.players[userIdRef.current!];

      if (yourId !== undefined) {
        //This block only gone run on first emit of this event to curr user
        userIdRef.current = yourId;
        setShowReplay(state.status === "ENDED");
      }

      if (flag === "game-over") {
        if (state.winner === me?.role) {
          setTimeout(() => {
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 },
              ticks: 200,
            });
          }, 500);
        }
        setTimeout(() => {
          setShowReplay(true);
        }, 1500);
        if (state.winner) {
          if (state.winner === "D") gameSound.drawSound();
          else gameSound.winSound();
        }
      }
      if (flag === "game-started") {
        toast("Game Started", {
          icon: "⭐",
        });
      }

      if (flag === "move" && state.turn === me?.role) {
        //We wanted to play sound for who play before
        if (state.turn === "X") {
          gameSound.ySound();
        } else {
          gameSound.xSound();
        }
      }

      startTransition(() => {
        updateState(state);
      });
    });

    socket.on("message", (data: ChartMsg) => {
      startTransition(() => {
        setCharts((p) => [...p, data]);
      });
      gameSound.notificationSound();
    });

    socket.on("disconnect", () => setStatus("disconnected"));

    socket.on("connect_error", (error) => {
      console.log({ error });
      if (socket.active) {
        // temporary failure, the socket will automatically try to reconnect
      } else {
        // the connection was denied by the server
        // in that case, `socket.connect()` must be manually called in order to reconnect
        setStatus("error");
        setError(error.message);
      }
    });

    // socket.onAny((...params) => {
    //   console.log("Event:", params);
    // });

    socket.on("roomAborted", () => {
      setStatus("aborted");
    });

    socket.connect();

    return () => {
      socket.disconnect();
      socket.off();
      socket.offAny();
    };
  }, [roomId, updateState]);

  const requestReplay = () => {
    setReqReplayPending(true);
    socket.timeout(5000).emit("requestReplay", (err) => {
      if (err) {
        toast.error("Failed to request Replay");
      }
      setReqReplayPending(false);
    });
  };

  const leaveRoom = () => {
    socket.emit("leaveRoom");
    navigate("/");
  };

  if (error) {
    return (
      <p className=" text-lg text-red-500 font-bold text-center py-6">
        Error: {error}
      </p>
    );
  }

  if (status === "connecting" || !state || !me) {
    return (
      <div className="absolute inset-0 text-blue-600 flex flex-col gap-2 items-center justify-center">
        <CircleNotch size={100} className=" animate-spin" />
      </div>
    );
  }

  const opponent = state.players.find((v) => v !== me);
  const isMyTurn = state.status !== "ENDED" && state.turn === me.role!;

  const makeMove = (x: number, y: number) => {
    if (!isMyTurn || state.board[y][x] !== "") {
      return;
    }
    //Optimistic updates
    updateState((draft) => {
      if (!draft) return;
      draft.board[y][x] = me.role;
      draft.turn = me.role === "X" ? "O" : "X";
    });

    if (me.role === "X") {
      gameSound.xSound();
    } else {
      gameSound.ySound();
    }

    socket.timeout(5000).emit("makeMove", [x, y], (err, d) => {
      if (d.isError || err) {
        toast.error("Failed to play move");
        //State Rollback
        updateState((draft) => {
          if (!draft) return;
          draft.board[y][x] = "";
          draft.turn = me.role === "X" ? "O" : "X";
        });
      }
    });
  };

  const stateMessage = (() => {
    if (!state.winner) {
      if (state.turn === me.role) return `Your Turn ${state.turn}`;
      else return `${opponent?.username} Turn (${state.turn})..`;
    }
    if (state.winner === "D") return "Game Draw";
    if (state.winner === me.role) return "🎉 You Win!";
    return "☹ You Loss! Opponent Wins";
  })();

  const toogleSound = () => {
    setSoundOn((p) => !p);
    gameSound.setSoundOn(!soundOn);
  };

  return (
    <div className="absolute inset-0">
      <title>{`Room ${roomId} - Tic Tac Tae`}</title>
      <div className="mx-auto justify-center flex max-w-[1000px] text-left shadow-white border-neutral-800 min-h-screen">
        <section
          className={
            "min-h-screen w-full md:w-full lg:w-[650px] border-neutral-700"
          }
        >
          {state.status === "WAITING" || !opponent ? (
            <Waiting
              roomId={state.roomId}
              boardSize={state.boardSize}
              winRow={state.winCrossCount}
            />
          ) : (
            <div className="flex flex-col justify-center items-center min-h-screen border-r border-l border-neutral-700">
              <div className="flex items-center gap-4 border-b border-neutral-800 py-1.5 w-full justify-center px-2">
                <button
                  className="mr-auto active:scale-95 transition-all duration-200 enabled:cursor-pointer hover:opacity-80 gap-1 items-center flex text-sm bg-neutral-800 px-2 py-1 rounded-md"
                  onClick={leaveRoom}
                >
                  <ArrowLeft /> Leave Room
                </button>
                <button
                  title="Go Fullscreen"
                  onClick={() => toggleFullScreen()}
                >
                  <ArrowsOutSimple size={25} />
                </button>
                <EmojiDropdown socket={socket} />
                {isMobile && (
                  <button
                    onClick={() => setChartBarOpen((p) => !p)}
                    title="Toogle ChartBox"
                    className=" cursor-pointer"
                  >
                    <ChatTeardropDots size={20} />
                  </button>
                )}
                <button
                  onClick={toogleSound}
                  title="Toogle Sound"
                  className=" text-neutral-300 cursor-pointer"
                >
                  {soundOn ? (
                    <SpeakerHigh size={25} />
                  ) : (
                    <SpeakerSlash size={25} />
                  )}
                </button>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center pb-2">
                <p
                  style={{
                    fontFamily: "cursive",
                  }}
                  className={twMerge(
                    "text-[1.3rem] font-bold mb-2 font-gluten text-center transition-all duration-300 drop-shadow-[1px_1px_10px_currentColor]",
                    state.turn === "X" ? "text-rose-500 " : " text-indigo-400",
                    state.status === "ENDED" && "text-orange-500"
                  )}
                >
                  {stateMessage}
                </p>
                <div
                  className={twMerge(
                    state.status === "STARTED" && "animate-flip-up",
                    state.status === "ENDED" ? "opacity-90" : "",
                    "border-2 rounded-md border-neutral-800 w-max transition-opacity duration-300"
                  )}
                >
                  <TicTacBoard
                    board={state.board}
                    currTurn={state.turn}
                    onClick={makeMove}
                    disable={!isMyTurn}
                    winPath={
                      new Map(state.line?.map((v, i) => [`${v[0]}${v[1]}`, i]))
                    }
                    winDir={state.winPathDir}
                  />
                </div>
                {showReplay && state.status === "ENDED" && (
                  <div className="mt-5 mb-4 flex flex-col items-center gap-2 animate-fade duration-300 justify-center">
                    {opponent.wantedToReplay && !me.wantedToReplay && (
                      <p className=" text-indigo-500 italic text-center font-medium">
                        Your opponent wanted to replay
                      </p>
                    )}
                    <button
                      autoFocus
                      disabled={me.wantedToReplay || isReqReplayPending}
                      onClick={requestReplay}
                      className={twMerge(
                        "text-sm bg-orange-600/80 w-max text-center px-4 py-0.5 rounded-md",
                        me.wantedToReplay && "animate-pulse"
                      )}
                    >
                      {isReqReplayPending ? (
                        <SpinnerGap className=" animate-spin text-white" />
                      ) : me.wantedToReplay ? (
                        "Waiting for opponent..."
                      ) : (
                        "Replay"
                      )}
                    </button>
                  </div>
                )}
              </div>

              <div className="py-3 gap-3 flex-wrap w-full border-t border-neutral-800 text-neutral-200 flex justify-center text-sm">
                <div>
                  {me.username} {me.role} -{" "}
                  <strong>{state.scores[me.role]}</strong>
                </div>
                <div className=" bg-slate-800 px-3">
                  Draw - <strong>{state.scores.D}</strong>
                </div>
                <div className={twMerge("flex item-center gap-1")}>
                  {!opponent.isOnline && (
                    <WifiSlash size={20} className="animate-pulse" />
                  )}
                  {opponent.username} {opponent.role} -{" "}
                  <strong>
                    <strong>{state.scores[opponent.role]}</strong>
                  </strong>
                </div>
              </div>
            </div>
          )}
        </section>
        {state.status !== "WAITING" && (
          <>
            {!isMobile ? (
              <ChartBox socket={socket} charts={charts} setCharts={setCharts} />
            ) : (
              <>
                <Sheet open={isMobileChartOpen} onOpenChange={setChartBarOpen}>
                  <SheetContent mode="right">
                    <ChartBox
                      socket={socket}
                      charts={charts}
                      setCharts={setCharts}
                      className="bg-neutral-900 border border-neutral-800 shadow-md max-w-[250px] w-full"
                    />
                    <SheetTrigger
                      onClick={() => setChartBarOpen(false)}
                      className="absolute top-1 right-1 bg-slate-800 p-1 rounded-full cursor-pointer"
                      title="close"
                    >
                      <X weight="bold" />
                    </SheetTrigger>
                  </SheetContent>
                </Sheet>
              </>
            )}
          </>
        )}
      </div>
      {(status === "disconnected" || status === "aborted") && (
        <Dialog>
          <DialogContent className=" absolute inset-0 bg-black/80 flex flex-col gap-2 items-center justify-center text-lg font-medium text-neutral-400">
            {status === "aborted" ? (
              <>
                <p>Room Aborted</p>
                <p className=" text-sm">
                  Either other player leave the room or Room timeout
                </p>
              </>
            ) : (
              <>
                <WifiHigh size={50} className=" animate-ping mb-6" />
                <p>Hold on Reconnecting..</p>
              </>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
