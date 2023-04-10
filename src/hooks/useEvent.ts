import { useRef, useInsertionEffect, useCallback } from 'react';
type Fn = (...args: any[]) => void;

// The useEvent API has not yet been added to React,
// so this is a temporary shim to make this sandbox work.
// You're not expected to write code like this yourself.

export function useEvent<Func extends Fn>(fn: Func) {
  const ref = useRef((...args: any[]) => {});

  useInsertionEffect(() => {
    ref.current = fn;
  }, [fn]);

  return useCallback((...args: any[]) => {
    const f = ref.current;
    return f(...args);
  }, []);
}

export default useEvent;
