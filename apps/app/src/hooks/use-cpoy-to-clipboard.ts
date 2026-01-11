import { useCallback, useState } from "react";

export function useCopyToClipboard(timeout = 1500) {
  const [isCopied, setIsCopied] = useState(false);

  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), timeout);
      } catch (e) {
        setIsCopied(false);
      }
    },
    [timeout]
  );

  return { isCopied, copy };
}
