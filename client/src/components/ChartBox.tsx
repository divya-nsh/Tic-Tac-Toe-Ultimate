import {
  ChatTeardropDots,
  CircleNotch,
  PaperPlaneRight,
} from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { twMerge } from "tailwind-merge";
import TextareaAutosize from "react-textarea-autosize";
import { ChartMsg, TypedSocket } from "../types";

export function ChartBox({
  socket,
  className,
  charts,
  setCharts,
}: {
  socket: TypedSocket;
  className?: string;
  setCharts: React.Dispatch<React.SetStateAction<ChartMsg[]>>;
  charts: ChartMsg[];
}) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [isPending, setPending] = useState(false);
  const chartContainerRef = useRef<HTMLDivElement | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socket.connected) {
      return toast("Something wrong you are not connected");
    }
    setPending(true);
    socket.emit("sendMsg", value.trim(), (res) => {
      if (res.isError) {
        toast.error("Failed to send message");
      } else {
        setCharts((p) => [...p, { ...res.data, isMe: true }]);
        setValue("");
      }
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);

      setPending(false);
    });
  };

  useEffect(() => {
    const container = chartContainerRef.current;
    if (!container) return;

    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight <
      200;

    if (isNearBottom) {
      container.scrollTop = container.scrollHeight;
    }
  }, [charts]);

  return (
    <section
      className={twMerge(
        "border-r border-neutral-800 w-[280px] md:w-[300px]",
        className
      )}
    >
      <p className="text-center h-[36px] flex gap-1 items-center justify-center text-sm border-neutral-800 border-b w-full">
        <ChatTeardropDots size={19} /> Chart Box
      </p>
      <div className="flex flex-col h-[calc(100vh-36px)] dark-scroll">
        <div
          ref={chartContainerRef}
          className="flex-1 overflow-y-auto flex flex-col p-2 overflow-x-hidden"
        >
          {charts.map((msg) => (
            <div
              key={msg.id}
              className={twMerge(
                "mb-2 bg-neutral-800 p-2 rounded px-3 text-sm",
                msg.isMe ? "bg-slate-700 ml-3 self-end" : "mr-2 self-start"
              )}
            >
              <p className=" word-break">{msg.msg}</p>
              <p className="text-[0.5rem] text-neutral-300 text-right">
                {new Date(msg.createdOn).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          ))}
        </div>
        <form
          onSubmit={handleSubmit}
          className="flex items-center text-sm border border-neutral-800 mx-1 mb-3 sm:mb-1 rounded-lg overflow-hidden"
        >
          <TextareaAutosize
            ref={inputRef}
            maxRows={8}
            value={value}
            disabled={isPending}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (value.trim() !== "") {
                  // Submit the parent form
                  e.currentTarget.form?.requestSubmit();
                }
              }
            }}
            placeholder="Write message here"
            className="w-full bg-transparent py-3 px-2 resize-none outline-none focus:outline-none"
            maxLength={1000}
          />
          <button
            disabled={isPending}
            title="Send Message"
            type="submit"
            className={twMerge(
              "px-2 py-2 self-end focus:outline-none rounded-full focus:bg-neutral-800 hover:opacity-80",
              isPending && " opacity-90"
            )}
          >
            {isPending ? (
              <CircleNotch size={25} className=" animate-spin" />
            ) : (
              <PaperPlaneRight size={25} />
            )}
          </button>
        </form>
      </div>
    </section>
  );
}
