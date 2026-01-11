import { useCallback, useEffect, useState } from "react";

export function useFullscreen<T extends HTMLElement>() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const enterFullscreen = useCallback((element: T | null) => {
    if (!element) return;
    if (element.requestFullscreen) element.requestFullscreen();
    else if ((element as any).webkitRequestFullscreen)
      (element as any).webkitRequestFullscreen();
    else if ((element as any).msRequestFullscreen)
      (element as any).msRequestFullscreen();
  }, []);

  const exitFullscreen = useCallback(() => {
    if (document.exitFullscreen) document.exitFullscreen();
    else if ((document as any).webkitExitFullscreen)
      (document as any).webkitExitFullscreen();
    else if ((document as any).msExitFullscreen)
      (document as any).msExitFullscreen();
  }, []);

  useEffect(() => {
    function handleChange() {
      setIsFullscreen(!!document.fullscreenElement);
    }
    document.addEventListener("fullscreenchange", handleChange);
    return () => document.removeEventListener("fullscreenchange", handleChange);
  }, []);

  return { isFullscreen, enterFullscreen, exitFullscreen };
}
