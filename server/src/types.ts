import { Socket } from "socket.io";
//sid="SessionID"

export interface AuthenticatedSocket extends Socket {
  auth?: {
    sid: string;
    roomId: string;
  };
}

//socketId exits then userId online
export interface Player {
  username: string;
  isOnline: boolean;
  role: "X" | "O";
  wantedToReplay?: boolean;
  id: number;
}

//Player at index[0] will be host, player[1] his friend
//D=>DRAW
export type TGameRoomState = {
  roomId: string;
  lastActive: number; //Will be used to destroy room if no user connected and its been 30 minutes
  boardSize: number;
  board: TicTacBoard;
  winCrossCount: number;
  players: Player[]; //SessionId => player
  scores: { X: number; O: number; D: number };
  status: "WAITING" | "STARTED" | "ENDED";
  turn: "X" | "O"; //Current turn
  winner?: "X" | "O" | "D" | null; //Winner
  line?: string[] | null;
  winPathDir?: "H" | "V" | "DR" | "DL" | null;
  sessions: { [key: string]: Player };
  createdAt: number;
};

export type Move = "X" | "O" | "";
export type TicTacBoard = Move[][];

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
    state: TGameRoomState;
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

export interface InterServerEvents {} // if using clusters

export interface SocketData {
  userId?: string;
  roomId: string;
  sid: string;
}
