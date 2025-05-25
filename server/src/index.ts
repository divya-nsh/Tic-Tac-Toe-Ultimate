import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { instrument } from "@socket.io/admin-ui";
import z, { ZodError } from "zod";
import { randomInt } from "crypto";
import cors from "cors";
import { gameRooms } from "./gameRooms.ts";
import { socketError } from "./utils.ts";
import {
  ChartMsg,
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from "./types.ts";

const app = express();
const server = createServer(app);
const port = process.env.PORT || 3000;
const origin =
  process.env.ALLOWED_ORIGIN?.split(",").map((v) => v.trim()) || "*";
const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>(server, {
  cors: {
    origin, // Admin UI URL
    credentials: true,
  },
});

app.use(cors({ origin }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
gameRooms.startGc((roomId) => {
  io.to(roomId).emit("roomAborted", "Room Timout");
  io.in(roomId).disconnectSockets(true);
});

//Health check Route
app.get("/", (req, res) => {
  res.status(200).json({ message: "Ok" });
});

app.post("/api/room/:roomId", (req, res) => {
  const { roomId } = req.params;
  const d = z
    .object({
      sid: z.string().min(1, "Required"),
      username: z.string().min(2).max(20),
    })
    .parse(req.body);

  const room = gameRooms.getRoom(roomId);
  if (!room) {
    res.status(404).json({ message: "Room not exits or destroyed" });
    return;
  }

  if (room.getSession(d.sid)) {
    res.status(200).json({ message: "You are aldready registered" });
    return;
  }

  //Register the user as player
  const isJoined = room.registerPlayer({
    username: d.username,
    sid: d.sid,
  });

  //Check if aldready 2 player registered
  if (!isJoined) {
    res.status(403).json({ message: "Room can't be joined! it's maybe full" });
    return;
  }

  res.status(200).json({ message: "Registeration completed, now go connect" });
});

app.post("/api/room", (req, res) => {
  const d = z
    .object({
      sid: z.string().min(1, "Required").max(150),
      username: z.string().min(2).max(20),
      boardSize: z.enum(["3", "4", "5", "6"]).default("3"),
      playFirst: z.enum(["random", "me", "opponent"]).default("me"),
    })
    .parse(req.body);
  const room = gameRooms.createRoom(+d.boardSize);
  room.registerPlayer({ username: d.username, sid: d.sid });
  const me = room.getSession(d.sid);
  if (d.playFirst === "me") {
    room.state.turn = me.role;
  } else if (d.playFirst === "opponent") {
    room.state.turn = me.role === "X" ? "O" : "X";
  } else {
    room.state.turn = ["X", "O"][randomInt(2)] as "X" | "O";
  }

  res.status(201).json({
    roomId: room.state.roomId,
    message: "Room created now you can join",
  });
});

io.use((socket, next) => {
  let { sid, roomId } = socket.handshake.auth;

  if (!sid || !roomId) {
    return next(new Error("Authentication error"));
  }

  const room = gameRooms.getRoom(roomId);
  if (!room) {
    return next(new Error("404, Room not found or destroyed!"));
  }

  const user = room.getSession(sid);

  if (!user) {
    return next(new Error("403! You are not register to join the room"));
  }

  socket.data = {
    sid: sid,
    roomId,
  };

  next();
});

io.on("connection", (socket) => {
  const { sid, roomId } = socket.data;
  const room = gameRooms.getRoom(roomId)!;

  socket.join(roomId);

  const emitStateChange = (
    all: boolean = true,
    flag:
      | "game-started"
      | "joined"
      | "game-over"
      | "any"
      | "move"
      | "user-disconnect"
      | "replay-request"
      | "replay-started" = "any"
  ) => {
    // const room = getRoom(auth.roomId)!;
    if (!room) return;
    if (!all) {
      socket
        .to(roomId)
        .emit("stateChange", { state: room.getSafeState(), flag });
    } else {
      io.to(roomId).emit("stateChange", {
        state: room.getSafeState(),
        flag,
      });
    }
  };
  room.setPlayerOnlineStatus(sid, true);

  if (
    room.state.status === "WAITING" &&
    room.findPlayer({ isOnline: true })!.length === 2
  ) {
    room.startGame();
    emitStateChange(false, "game-started");
    socket.emit("stateChange", {
      state: room.getSafeState(),
      flag: "game-started",
      yourId: room.getSession(sid).id,
    });
  } else {
    emitStateChange(false, "joined");
    socket.emit("stateChange", {
      state: room.getSafeState(),
      flag: "joined",
      yourId: room.getSession(sid).id,
    });
  }

  socket.on("makeMove", (move, cb) => {
    if (!room) return;
    try {
      room.playMove(move, sid);
      emitStateChange(
        true,
        room.state.status === "ENDED" ? "game-over" : "move"
      );
      if (typeof cb === "function") {
        cb({ isError: false });
      }
    } catch (error) {
      if (error instanceof Error && typeof cb === "function") {
        return cb(socketError(error.message));
      }
    }
  });

  socket.on("sendMsg", (msg, cb) => {
    const msgObj: ChartMsg = {
      msg: msg?.trim(),
      sender: room.getSession(sid).username,
      id: crypto.randomUUID(),
      createdOn: new Date() + "",
    };
    socket.to(roomId).emit("message", msgObj);
    if (typeof cb === "function") {
      cb({ data: msgObj });
    }
  });

  socket.on("sendEmoji", (icon) => {
    socket.to(roomId).emit("emoji", icon);
  });

  socket.on("disconnect", () => {
    room.setPlayerOnlineStatus(sid, false);
    emitStateChange();
  });

  socket.on("requestReplay", async (cb) => {
    if (room.state.status !== "ENDED") {
      return cb(socketError("Game is not yet over"));
    }
    let user = room.getSession(sid);
    user.wantedToReplay = true;
    const isAllAgree = room.state.players.every((v) => v.wantedToReplay);
    if (isAllAgree) {
      room.startGame();
      emitStateChange(true, "game-started");
    } else {
      emitStateChange(true, "replay-request");
    }

    if (typeof cb === "function") {
      cb({ isError: false });
    }
  });

  socket.on("leaveRoom", () => {
    //This will disconnet all active players and emit room-abort event
    gameRooms.destroyRoom(roomId);
    io.to(roomId).emit("roomAborted", "Opponent player Leave the room");
    io.in(roomId).disconnectSockets(true);
  });
});

server.listen(port, () =>
  console.log(`Example app listening on port ${port}!`)
);

instrument(io, {
  auth: {
    type: "basic",
    username: "admin",
    password: "$2a$12$Xxhnx6ZSkJfDOnLkCBOJtO5leV1wjrXD5B5ZU3EAhe6Q1SN.v8uVm", // "changeit" encrypted with bcrypt
  },
  mode: "production",
});

app.use((err, req, res, next) => {
  console.error(err);
  if (err instanceof ZodError) {
    res.status(400).json({
      message: "Incorrect Request body Vaildation error",
      errors: err.flatten(),
    });
    return;
  }
  res.status(500).send({ message: "Something went's wrong" });
});
