import { Dialog as SheetPrimitive } from "radix-ui";

import { type ReactNode } from "react";

export function SheetContent({
  children,
  mode = "left",
}: {
  children: ReactNode;
  mode?: "left" | "right";
}) {
  return (
    <SheetPrimitive.Portal>
      <SheetPrimitive.Overlay className="data-[state=closed]:animate-reverse animate fixed inset-0 animate-duration-300 bg-black/60 animate-fade animate-ease-in-out" />
      <SheetPrimitive.Content
        data-mode={mode}
        className={`fixed sheet top-0 h-screen ${
          mode === "left" ? "left-0" : "right-0"
        }`}
      >
        {children}
      </SheetPrimitive.Content>
    </SheetPrimitive.Portal>
  );
}

export const Sheet = SheetPrimitive.Root;
export const SheetTrigger = SheetPrimitive.Trigger;
export const SheetClose = SheetPrimitive.Close;
export const SheetTitle = SheetPrimitive.Title;
export const SheetDescription = SheetPrimitive.Description;
