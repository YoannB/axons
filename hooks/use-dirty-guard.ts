"use client";
import { useCallback, useState } from "react";

// Asks before an action would discard unsaved user input (load an example, reset a form,
// switch a preset). `isDirty` is DERIVED by the caller at render (e.g. input !== source), so
// the hook holds only the pending action. Pair it with <ConfirmDialog>:
//
//   const guard = useDirtyGuard(input.trim() !== "" && input !== loadedExample);
//   <Button onClick={() => guard.run(() => load(example))} />
//   <ConfirmDialog open={guard.open} onClose={guard.cancel} onConfirm={guard.confirm} ... />
//
// Everything is event-driven: no effect, nothing persisted.
export function useDirtyGuard(isDirty: boolean) {
    const [pending, setPending] = useState<(() => void) | null>(null);

    const run = useCallback(
        (action: () => void) => {
            if (isDirty) setPending(() => action);
            else action();
        },
        [isDirty],
    );
    const confirm = useCallback(() => {
        pending?.();
        setPending(null);
    }, [pending]);
    const cancel = useCallback(() => setPending(null), []);

    return { open: pending !== null, run, confirm, cancel };
}
