import fs from "fs";
import { checkWin, generateBoard, getEmptyPlaces } from "./gameLogic.ts";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { generateId } from "./utils.ts";
import { TGameRoomState, Player } from "./types.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const storeLocation = join(__dirname, "../data/rooms.json");
const MAX_ROOM_AGE = 120 * 60 * 1000; //2 HOUR
const MAX_ABANDONED_ROOM_AGE = 10 * 60 * 1000; //10 Minutes
const ROOM_CLEANUP_INTERVAL = 10 * 60 * 1000; //10 Minutes
const MAX_WAITING_TIME = 5 * 60 * 1000; // 5 Minutes, room wait before destroying if not started
//Its usefull while testing and devloping so rooms recover after restart
const SAVE_TO_DISK = false;

//Utitlity for handling state
export class GameRoom {
  constructor(public state: TGameRoomState) {}

  getSafeState(): TGameRoomState {
    return { ...this.state, sessions: {} };
  }

  registerPlayer(
    user: { sid: string; username: string },
    isOnline: boolean = false
  ) {
    const room = this.state;
    if (room.players.length === 2) {
      return false;
    }
    if (room.sessions[user.sid]) {
      return true;
    }

    const role = room.players.length === 0 ? "X" : "O";
    const record: Player = {
      username: user.username,
      isOnline,
      role,
      id: room.players.length,
    };

    room.players.push(record);
    room.lastActive = Date.now();
    room.sessions[user.sid] = record;
    gameRooms.saveToDisk();
    return true;
  }

  //Multipurpose function
  findPlayer(query: Partial<Player> = {}) {
    const room = this.state;
    return room.players.filter((v) => {
      let keys = Object.keys(query) as (keyof Player)[];
      return keys.every((k) => v[k] === query[k]);
    });
  }

  setPlayerOnlineStatus(sessionId: string, status: boolean) {
    const user = this.getSession(sessionId);
    if (!user) return false;

    user.isOnline = status;
    this.state.lastActive = Date.now();
    return true;
  }

  getSession(sessionId: string) {
    return this.state.sessions[sessionId];
  }

  startGame() {
    let room = this.state;
    room.status = "STARTED";
    room.board = generateBoard(room.boardSize);
    room.line = [];
    room.winner = null;
    room.players.map((user) => {
      delete user.wantedToReplay;
    });
    gameRooms.saveToDisk();
  }

  checkGameOver() {
    let room = this.state;
    let over = checkWin(room.board, room.winCrossCount);
    let isTie = getEmptyPlaces(room.board).length;
    if (over && over.player) {
      room.status = "ENDED";
      room.winner = over.player;
      room.scores[over.player]++;
      room.line = over.winPath.map(([x, y]) => `${x}${y}`);
      room.winPathDir = over.dir as TGameRoomState["winPathDir"];
      return true;
    } else if (!isTie) {
      room.status = "ENDED";
      room.winner = "D";
      room.scores["D"]++;
      room.line = [];
      return true;
    }
  }

  playMove([x, y]: [number, number], sessionId: string) {
    let room = this.state;
    let user = room?.sessions[sessionId];
    if (!room || !user) {
      throw new Error("Room or user not found");
    }
    if (room.status === "ENDED") {
      throw new Error("Can't play game is Over");
    }
    if (room.board[y][x] !== "") {
      throw new Error("Invalid move");
    }
    if (room.turn !== user?.role) {
      throw new Error("Not your turn");
    }
    room.board[y][x] = room.turn;
    room.turn = room.turn === "X" ? "O" : "X";
    this.checkGameOver();
    gameRooms.saveToDisk();
  }
}

export const gameRooms = new (class {
  map = new Map<string, TGameRoomState>();
  sizeToWinCount: Record<number, number> = { 3: 3, 5: 4, 6: 4, 4: 3 };
  constructor() {
    if (!SAVE_TO_DISK) return;
    if (!fs.existsSync(storeLocation)) {
      fs.writeFileSync(storeLocation, JSON.stringify([]));
    }
    this.loadFromDisk();
  }

  createRoom(size: number) {
    if (!this.sizeToWinCount[size]) size = 3;
    const roomId = generateId();
    const room: TGameRoomState = {
      roomId,
      players: [],
      lastActive: Date.now(),
      boardSize: size,
      board: [],
      turn: "X",
      status: "WAITING",
      scores: { X: 0, O: 0, D: 0 },
      sessions: {},
      createdAt: Date.now(),
      winCrossCount: this.sizeToWinCount[size],
    };

    this.map.set(roomId, room);
    this.saveToDisk();
    return new GameRoom(room);
  }

  getRoom(id: string) {
    const state = this.map.get(id);
    if (!state) return null;
    return new GameRoom(state);
  }

  destroyRoom(id: string) {
    this.map.delete(id);
  }

  loadFromDisk() {
    if (!SAVE_TO_DISK) return;
    const data = fs.readFileSync(storeLocation, "utf8");
    try {
      const parsedData = JSON.parse(data) as Record<string, TGameRoomState>;
      Object.entries(parsedData).forEach(([key, value]) => {
        value.players.forEach((v) => (v.isOnline = false));
        this.map.set(key, value);
      });
    } catch (error) {
      console.log("Error parsing game room file:", error);
    }
  }

  saveToDisk() {
    if (!SAVE_TO_DISK) return;
    const obj = Object.fromEntries(this.map);
    fs.writeFileSync(storeLocation, JSON.stringify(obj, null, 2));
  }

  private async garbageCollect(cb?: (roomId: string) => void) {
    this.map.forEach((room, key) => {
      let isOnline = room.players.some((v) => v.isOnline);
      const now = Date.now();
      let diff = now - room.lastActive;

      if (
        (!isOnline && diff > MAX_ABANDONED_ROOM_AGE) ||
        now - room.createdAt > MAX_ROOM_AGE ||
        (!isOnline && room.status === "WAITING" && diff > MAX_WAITING_TIME)
      ) {
        this.map.delete(key);
        cb?.(room.roomId);
      }
    });
    this.saveToDisk();
  }

  async startGc(cb?: (roomId: string) => void) {
    this.garbageCollect(cb);
    setTimeout(() => {
      this.startGc(cb);
    }, ROOM_CLEANUP_INTERVAL);
  }
})();
