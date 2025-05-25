import { TicTacBoard, Move } from "../types";

export const generateBoard = (size: number): TicTacBoard => {
  return Array.from({ length: size }, () =>
    Array.from({ length: size }, () => "")
  );
};

//O(N^3) TODO: Optimise it
export function checkWin(board: TicTacBoard, winCount: number) {
  function searchAdj(x: number, y: number, dirX: number, dirY: number) {
    let path: [number, number][] = [];
    let prev: null | Move = null;

    while (x >= 0 && y >= 0 && x < board.length && y < board.length) {
      const curr = board[y][x];
      if (prev !== null && curr !== prev) {
        path = [[x, y]];
      } else if (curr) {
        path.push([x, y]);
      }
      prev = curr;
      x += dirX;
      y += dirY;
      if (path.length >= winCount) {
        return path;
      }
    }

    return null;
  }

  const getPlayer = ([x, y]: [number, number]) => board[y][x];
  for (let i = 0; i < board.length; i++) {
    const colWin = searchAdj(i, 0, 0, 1); // ↓ vertical
    if (colWin)
      return {
        winPath: colWin,
        dir: "V",
        player: getPlayer(colWin[0]),
      };

    const rowWin = searchAdj(0, i, 1, 0); // → horizontal
    if (rowWin)
      return {
        winPath: rowWin,
        dir: "H",
        player: getPlayer(rowWin[0]),
      };

    for (let j = 0; j < board.length; j++) {
      const diagRight = searchAdj(i, j, 1, 1); // ↘ Down Right
      if (diagRight)
        return {
          winPath: diagRight,
          dir: "DR",
          player: getPlayer(diagRight[0]),
        };

      const diagLeft = searchAdj(i, j, -1, 1); // ↙ Down Left
      if (diagLeft)
        return {
          winPath: diagLeft,
          dir: "DL",
          player: getPlayer(diagLeft[0]),
        };
    }
  }
  return null;
}

export function getEmptyPlaces(board: TicTacBoard): [x: number, y: number][] {
  return board.reduce<[number, number][]>((acc, row, y) => {
    row.forEach((cell, x) => {
      if (cell === "") {
        acc.push([x, y]);
      }
    });
    return acc;
  }, []);
}

function getRandomMove(board: TicTacBoard) {
  const emptyPlaces = getEmptyPlaces(board);
  if (emptyPlaces.length === 0) return [-1, -1];
  return emptyPlaces[Math.floor(Math.random() * emptyPlaces.length)];
}

export function basicAIPlayer(board: TicTacBoard, alignCount: number) {
  const emptyPlaces = getEmptyPlaces(board);

  //Check if at any place Ai can win
  for (const [x, y] of emptyPlaces) {
    const temp = board[y][x];
    board[y][x] = "O";
    const win = checkWin(board, alignCount);
    board[y][x] = temp;
    if (win?.player === "O") return [x, y];
  }

  //Check if at any place opponent may win
  for (const [x, y] of emptyPlaces) {
    const temp = board[y][x];
    board[y][x] = "X";
    const win = checkWin(board, alignCount);
    board[y][x] = temp;
    if (win?.player === "X") return [x, y];
  }

  //If no one is winning, play random
  return getRandomMove(board);
}

export function searchWinPattern(board: TicTacBoard, patterns: number[][][]) {
  for (const pattern of patterns) {
    const first = board[pattern[0][1]][pattern[0][0]];
    const match = pattern.every((v) => board[v[0]][v[1]] === first);
    if (match) return first;
  }
}

// Todo: Make AI more powerfull
export function aiPlayer(board: TicTacBoard, align: number, level: number = 1) {
  if (level === 2) {
    return basicAIPlayer(board, align);
  } else {
    return getRandomMove(board);
  }
}
