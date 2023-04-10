
import { useRef, useEffect } from "react";

type Timer = ReturnType<typeof setTimeout>;
type Fn = (...args: any[]) => void;

export function useDebounce<Func extends Fn>(fn: Func, delay = 1000) {
  const timer = useRef<Timer>();

  useEffect(() => {
    return () => {
      if (!timer.current) return;
      clearTimeout(timer.current);
    };
  }, []);

  const wrapper = ((...args) => {
    const newTimer = setTimeout(() => {
      fn(...args);
    }, delay);
    clearTimeout(timer.current);
    timer.current = newTimer;
  }) as Func;

  return wrapper;
}

export default useDebounce;
