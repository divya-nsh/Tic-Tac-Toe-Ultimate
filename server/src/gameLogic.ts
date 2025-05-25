import { TicTacBoard, Move } from "./types.ts";

export const generateBoard = (size: number): TicTacBoard => {
  return Array.from({ length: size }, () =>
    Array.from({ length: size }, () => "")
  );
};

//Completly Brute forcing to check win
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
      const diagRight = searchAdj(i, j, 1, 1); // ↘ diagonal
      if (diagRight)
        return {
          winPath: diagRight,
          dir: "DR",
          player: getPlayer(diagRight[0]),
        };

      const diagLeft = searchAdj(i, j, -1, 1); // ↙ diagonal
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
        acc.push([y, x]);
      }
    });
    return acc;
  }, []);
}
