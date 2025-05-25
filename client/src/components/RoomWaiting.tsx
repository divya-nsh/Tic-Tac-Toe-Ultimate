import toast from "react-hot-toast";

export function Waiting({
  roomId,
  boardSize,
  winRow,
}: {
  roomId: string;
  boardSize: number;
  winRow: number;
}) {
  return (
    <div className="max-w-md shadow-lg mx-auto mt-10 bg-neutral-800 border border-neutral-700 text-white p-6 rounded-xl text-center">
      <div className="mb-3">
        <h2 className="text-2xl font-semibold text-neutral-200">
          Tic Tac Toe Game
        </h2>
        {/* <p className="text-sm text-neutral-400">
          Share this room with a friend to start playing
        </p> */}
        <p className=" text-neutral-400">
          {boardSize}x{boardSize} - Align {winRow} to win
        </p>
      </div>

      <div className="space-y-2">
        <div className="text-left space-y-3">
          <div>
            <label className="text-neutral-300 text-sm font-medium">
              Room ID
            </label>
            <div className="flex items-center justify-between bg-neutral-700 px-4 py-2 rounded-md">
              <input
                title="x"
                onClick={() => {
                  navigator.clipboard.writeText(roomId);
                  toast.success("Text Copied to clipboard");
                }}
                value={roomId}
                readOnly
                className="text-blue-400 outline-none bg-transparent text-left active:scale-95 transition-all duration-200 cursor-default font-mono break-all"
              ></input>
            </div>
          </div>

          <div>
            <label className="text-neutral-300 text-sm font-medium">
              Invite Link
            </label>
            <div className="flex items-center justify-between bg-neutral-700 px-4 py-2 rounded-md">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    `http://localhost:5173/room/join?roomId=${roomId}`
                  );
                  toast.success("Text Copied to clipboard");
                }}
                className="text-blue-400 text-left font-mono active:scale-95 transition-all duration-200 break-all"
              >
                https://localhost:3000/room/join?roomId={roomId}
              </button>
            </div>
          </div>
        </div>
      </div>

      <p className=" text-sm mt-4 text-neutral-400">
        {/* Ask your friend to join using the room ID or invite link above. */}
        Share this room with a friend to start playing
      </p>

      <p className="mt-3 text-xl text-blue-500 animate-pulse font-medium">
        Waiting for another player to join...
      </p>
    </div>
  );
}
