import { DropdownMenu, Portal } from "radix-ui";
import { TypedSocket } from "../types";
import { startTransition, useEffect, useState } from "react";

const emojis = [
  "😀", // happy
  "😂", // laughing
  "😎", // cool
  "😍", // love it
  "😡", // angry
  "😢", // sad
  "😮", // surprised
  "🤔", // thinking
  "😴", // bored/sleepy
  "🤯", // mind blown
  "👏", // applause
  "👍", // thumbs up
  "👎", // thumbs down
  "🤝", // handshake / good game
  "🙌", // celebration / nice!
  "🔥", // awesome / fire
  "🥶", // cold / shocked
  "🥳", // party / win
  "💀", // defeated / fail
  "😈", // evil / sneaky,
  "🤐",
  "👀",
];

export default function EmojiReaction({ socket }: { socket: TypedSocket }) {
  const [emoji, setEmoji] = useState<string[]>([]);
  const [isCooldown, setCoolDown] = useState(false);

  useEffect(() => {
    socket.on("emoji", (emj) => {
      startTransition(() => {
        setEmoji((p) => [...p, emj]);
      });
    });
    return () => {
      socket.off("emoji");
    };
  }, [socket]);

  useEffect(() => {
    if (emoji.length) {
      const id = setTimeout(() => {
        startTransition(() => {
          setEmoji([]);
        });
      }, 2500);
      return () => clearTimeout(id);
    }
  }, [emoji]);

  useEffect(() => {
    if (isCooldown === true) {
      const id = setTimeout(() => {
        setCoolDown(false);
      }, 3000);
      return () => clearTimeout(id);
    }
  }, [isCooldown]);

  const sendEmoji = (icon: string) => {
    //There is No gurrentee if emoji succcefully send
    socket.emit("sendEmoji", icon);
    setEmoji((p) => [...p, icon]);
    setCoolDown(true);
  };

  return (
    <>
      <Portal.Root>
        {emoji.map((emj, id) => (
          <div key={id} className="emoji">
            {emj}
          </div>
        ))}
      </Portal.Root>

      <DropdownMenu.Root>
        <DropdownMenu.Trigger
          disabled={isCooldown}
          className="text-xl disabled:opacity-50 transform enabled:hover:bg-neutral-700 p-1 enabled:cursor-pointer rounded-full active:scale-90 transition-all outline-0 duration-300"
        >
          😊
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            className="p-2 bg-neutral-800 border border-neutral-700 rounded shadow-sm grid grid-cols-5 gap-3 max-w-[200px] shadow-neutral-700"
            sideOffset={5}
          >
            {emojis.map((emoji, i) => (
              <DropdownMenu.Item
                key={i}
                onSelect={() => sendEmoji(emoji)}
                className="text-xl hover:scale-115 hover:outline-0 transition cursor-pointer"
              >
                {emoji}
              </DropdownMenu.Item>
            ))}
            <DropdownMenu.Arrow className=" fill-neutral-700" />
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </>
  );
}
