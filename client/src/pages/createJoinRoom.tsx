import { SpinnerGap } from "@phosphor-icons/react";
import axios, { AxiosError } from "axios";
import { FormEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router";
import { twMerge } from "tailwind-merge";
import { getSession } from "../utils/util";

async function createRoom(body: {
  username: string;
  playFirst: string;
  boardSize: string;
}) {
  const res = await axios.post("/api/room", {
    ...body,
    sid: getSession(),
    boardSize: body.boardSize,
  });
  localStorage.setItem("username", body.username);
  return res.data as { roomId: string };
}

async function joinRoom(username: string, roomId: string) {
  const res = await axios.post(`/api/room/${roomId}`, {
    username,
    sid: getSession(),
  });
  localStorage.setItem("username", username);
  return res.data as { success: boolean };
}

export default function CreateJoinRoom() {
  const location = useLocation();
  const tab = location.pathname.split("/")[2];
  const [isPending, setPending] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    username: localStorage.getItem("username") || "",
    boardSize: "3",
    playFirst: "random" as "random" | "me" | "opponent",
    roomId: "",
  });

  useEffect(() => {
    const roomIdParam = searchParams.get("roomId");
    if (roomIdParam) {
      setFormData((prev) => ({
        ...prev,
        roomId: roomIdParam,
      }));
    }
  }, [searchParams]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setPending(true);
    try {
      let roomId = formData.roomId;
      if (tab === "create") {
        roomId = (await createRoom(formData)).roomId;
      } else {
        await joinRoom(formData.username, formData.roomId);
      }
      navigate(`/room/${roomId}`);
    } catch (e) {
      if (e instanceof AxiosError) {
        const msg =
          e.response?.data?.message || e.response?.data?.error || e.message;
        toast.error(msg);
      }
    } finally {
      setPending(false);
    }
  };

  const register = (key: keyof typeof formData) => {
    return {
      onChange: (
        e:
          | React.ChangeEvent<HTMLInputElement>
          | React.ChangeEvent<HTMLSelectElement>
      ) => {
        setFormData((prev) => ({
          ...prev,
          [key]: e.target.value,
        }));
      },
      value: formData[key],
      id: key,
    };
  };

  return (
    <div className=" absolute inset-0 flex justify-center items-center text-neutral-200">
      <title>Create OR join Room :: Tic Tac Toe Ultimate</title>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 bg-neutral-800 border border-neutral-700 w-[500px] p-4 sm:p-6 md:p-8 rounded-md"
      >
        <h1 className=" text-2xl text-center">Tic Tac Toe Game</h1>
        <p className=" text-sm text-center mb-2 -mt-3 text-neutral-400">
          Play Online with friends
        </p>
        <div className=" flex w-full">
          {[
            ["create", "Create Room"] as const,
            ["join", "Join Room"] as const,
          ].map((v, i) => (
            <>
              <Link
                key={i}
                type="button"
                to={`/room/${v[0]}`}
                className={twMerge(
                  "border-b-2 flex-1 px-2 pb-1 text-center text-sm font-medium",
                  tab === v[0]
                    ? "border-neutral-200"
                    : "border-neutral-600 opacity-90 hover:opacity-70 "
                )}
              >
                {v[1]}
              </Link>
            </>
          ))}
        </div>

        <div className="grid text-sm gap-0.5">
          <label htmlFor="username" className="font-medium">
            Nick Name
          </label>
          <input
            autoFocus
            maxLength={15}
            minLength={2}
            required
            placeholder="Enter your nick name"
            className="border rounded-md py-2 border-neutral-600 px-2 bg-transparent"
            {...register("username")}
          />
        </div>

        {tab === "create" ? (
          <>
            <div className="grid gap-0.5 text-sm">
              <label htmlFor="boardSize" className="font-medium">
                Board Size
              </label>
              <select
                required
                className="border rounded-md py-2 border-neutral-600 px-2 bg-neutral-800"
                {...register("boardSize")}
              >
                <option value="3">3x3 - classic</option>
                <option value="4">4x4 - align 3 to win</option>
                <option value="5">5x5 - align 4 to win</option>
                <option value="6">6x6 - align 4 to win</option>
              </select>
            </div>
            <div className="grid gap-0.5 text-sm">
              <label htmlFor="playFirst" className="font-medium">
                Who play First ?
              </label>
              <select
                required
                className="border rounded-md py-2 border-neutral-600 px-2 bg-neutral-800"
                {...register("playFirst")}
              >
                <option value="random">Random</option>
                <option value="me">Me</option>
                <option value="opponent">Opponent</option>
              </select>
            </div>
          </>
        ) : (
          <></>
        )}

        {tab === "join" && (
          <div className="grid gap-0.5 text-sm">
            <label htmlFor="roomId" className="font-medium">
              Room ID
            </label>
            <input
              required
              maxLength={200}
              placeholder="Room id to join"
              className="border rounded-md py-2 border-neutral-600 px-2 bg-transparent"
              {...register("roomId")}
            />
          </div>
        )}

        <button
          disabled={isPending}
          className={
            " bg-cyan-700 mt-3 flex text-sm items-center justify-center py-2 rounded-lg font-medium"
          }
        >
          {!isPending ? (
            "Continue"
          ) : (
            <SpinnerGap size={22} color="white" className="animate-spin " />
          )}
        </button>
        <Link
          to={"/"}
          className=" text-neutral-400 text-center hover:opacity-90"
        >
          Go Back
        </Link>
      </form>
    </div>
  );
}
