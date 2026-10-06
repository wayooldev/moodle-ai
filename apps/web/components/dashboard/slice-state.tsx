"use client";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { LoadSlice } from "@/lib/campus-types";

export function SliceError({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="space-y-3">
      <Alert tone="error">{message}</Alert>
      {onRetry ? (
        <Button type="button" variant="secondary" size="sm" onClick={onRetry}>
          Reintentar
        </Button>
      ) : null}
    </div>
  );
}

export function isSliceLoading(state: LoadSlice, hasData: boolean) {
  return state === "loading" && !hasData;
}
