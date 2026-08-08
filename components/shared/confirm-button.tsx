"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Result = { ok: true; data?: unknown } | { ok: false; error: string };

export function ConfirmButton({
  trigger,
  title,
  description,
  action,
  onDone,
}: {
  trigger: React.ReactNode;
  title: string;
  description: string;
  action: () => Promise<Result>;
  onDone?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger render={trigger as React.ReactElement<Record<string, unknown>>} />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                const r = await action();
                if (r.ok) {
                  setOpen(false);
                  onDone?.();
                } else {
                  toast.error(r.error);
                }
              })
            }
          >
            {pending ? "Working…" : "Confirm"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
