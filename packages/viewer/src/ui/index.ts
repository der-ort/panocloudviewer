// ─── shadcn-style UI primitives ───────────────────────────────────────────────
// Each wraps a Radix UI primitive with Tailwind + CSS-variable tokens.
// Consumers can override any of these via the ComponentsProvider.

export { Button, buttonVariants } from "./button";
export type { ButtonProps } from "./button";

export { Slider } from "./slider";
export type { SliderProps } from "./slider";

export {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "./dialog";

export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "./tabs";

export {
  Popover,
  PopoverTrigger,
  PopoverAnchor,
  PopoverContent,
} from "./popover";

export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "./tooltip";

export { Toggle, toggleVariants } from "./toggle";
export type { ToggleProps } from "./toggle";

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
} from "./select";
