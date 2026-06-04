"use client";

import React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "../lib/utils";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogPortal = DialogPrimitive.Portal;

export const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn("fixed inset-0 z-50 bg-black/50", className)}
    {...props}
  />
));
DialogOverlay.displayName = "DialogOverlay";

export const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    /** Portal container — pass the `.pcv` root so themed tokens apply to the portalled dialog. */
    container?: HTMLElement | null;
    /**
     * Drag offset in pixels. When provided the dialog is translated by this amount
     * relative to its centered position. Centering (-50%, -50%) is always preserved
     * and composed with the drag offset so the dialog stays centered when offset is {0,0}.
     */
    dragOffset?: { x: number; y: number };
  }
>(({ className, children, container, dragOffset, style, ...props }, ref) => {
  const dx = dragOffset?.x ?? 0;
  const dy = dragOffset?.y ?? 0;
  return (
    <DialogPortal container={container ?? undefined}>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed left-1/2 top-1/2 z-50 max-h-[85vh] w-full max-w-md overflow-y-auto rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] shadow-xl",
          className,
        )}
        style={{
          ...style,
          transform: `translate(-50%, -50%) translate(${dx}px, ${dy}px)`,
        }}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
});
DialogContent.displayName = "DialogContent";

export const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex items-center justify-between border-b border-[hsl(var(--border))] px-4 py-3",
      className,
    )}
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

export const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-sm font-semibold", className)}
    {...props}
  />
));
DialogTitle.displayName = "DialogTitle";

export const DialogClose = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Close>
>(({ className, children, ...props }, ref) => (
  <DialogPrimitive.Close
    ref={ref}
    className={cn(
      "rounded p-1 text-muted-foreground hover:bg-[hsl(var(--muted)/.6)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]",
      className,
    )}
    {...props}
  >
    {children ?? <X size={14} />}
  </DialogPrimitive.Close>
));
DialogClose.displayName = "DialogClose";
