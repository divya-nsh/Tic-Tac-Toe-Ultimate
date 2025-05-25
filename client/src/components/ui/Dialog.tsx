import { Dialog as DialogPrimitive } from "radix-ui";
import type { ReactNode } from "react";

export function DialogContent({
  children,
  ...rest
}: {
  children: ReactNode;
  asChild?: boolean;
  className?: string;
}) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="grid place-items-center fixed overflow-auto inset-0 animate-duration-300 bg-black/50 animate-fade animate-ease-in-out">
        <DialogPrimitive.Content {...rest}>{children}</DialogPrimitive.Content>
      </DialogPrimitive.Overlay>
    </DialogPrimitive.Portal>
  );
}

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;
export const DialogTitle = DialogPrimitive.Title;
export const DialogDescription = DialogPrimitive.Description;
