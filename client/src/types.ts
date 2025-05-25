import { Socket } from "socket.io-client";

export type Move = "X" | "O" | "";
export type TicTacBoard = Move[][];

export interface Player {
  username: string;
  isOnline: boolean;
  role: "X" | "O";
  wantedToReplay?: boolean;
  id: number;
}
//Player at index[0] will be host, player[1] his friend
//D=>DRAW
export interface ServerGameState {
  roomId: string;
  lastActive: number;
  boardSize: number;
  board: Move[][];
  players: Player[];
  scores: { X: number; O: number; D: number };
  status: "WAITING" | "STARTED" | "ENDED";
  turn: "X" | "O"; //Current turn
  winner: "X" | "O" | "D" | null; //Winner
  line?: string[] | null;
  winPathDir?: "H" | "V" | "DR" | "DL" | null;
  createdAt: number;
  winCrossCount: number;
}

type StateChangeFlag =
  | "game-started"
  | "joined"
  | "game-over"
  | "any"
  | "move"
  | "user-disconnect"
  | "replay-request"
  | "replay-started";

export type ChartMsg = {
  msg: string;
  sender: string;
  isMe?: boolean;
  id: string;
  createdOn: string;
};

export interface ServerToClientEvents {
  message: (chartObj: ChartMsg) => void;
  stateChange: (d: {
    state: ServerGameState;
    flag: StateChangeFlag;
    yourId?: number;
  }) => void;
  roomAborted: (msg?: string) => void;
  emoji: (emj: string) => void;
}

export interface ClientToServerEvents {
  makeMove: (
    move: [number, number],
    cb: (d: { isError: boolean }) => void
  ) => void;
  leaveRoom: () => void;
  requestReplay: (cb: (d: { isError: boolean }) => void) => void;
  sendMsg: (
    msg: string,
    cb: (
      res:
        | { isError: true }
        | {
            data: ChartMsg;
            isError?: false;
          }
    ) => void
  ) => void;
  sendEmoji: (emj: string) => void;
}

export type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;
