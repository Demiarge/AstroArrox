"use client";

import { startTransition, useActionState, type FormEvent } from "react";

/** useActionState via onSubmit, so React 19 doesn't reset the form on validation errors. */
export function useActionForm<S>(serverAction: (state: Awaited<S>, formData: FormData) => S | Promise<S>, initialState: Awaited<S>) {
  const [state, dispatch, pending] = useActionState(serverAction, initialState);
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget, (e.nativeEvent as SubmitEvent).submitter);
    startTransition(() => dispatch(formData));
  };
  return [state, { action: dispatch, onSubmit }, pending] as const;
}
