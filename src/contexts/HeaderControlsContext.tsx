import React, { createContext, useContext, useRef, useSyncExternalStore, type ReactNode } from 'react';

interface HeaderControlsStore {
  controls: ReactNode;
  subscribe: (cb: () => void) => () => void;
  getSnapshot: () => ReactNode;
  setControls: (node: ReactNode) => void;
  clearControls: () => void;
}

function createHeaderControlsStore(): HeaderControlsStore {
  let controls: ReactNode = null;
  const listeners = new Set<() => void>();

  return {
    get controls() { return controls; },
    subscribe(cb) {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    getSnapshot() { return controls; },
    setControls(node) {
      controls = node;
      listeners.forEach(cb => cb());
    },
    clearControls() {
      controls = null;
      listeners.forEach(cb => cb());
    },
  };
}

const HeaderControlsContext = createContext<HeaderControlsStore | null>(null);

export const HeaderControlsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const storeRef = useRef<HeaderControlsStore>(null!);
  if (!storeRef.current) storeRef.current = createHeaderControlsStore();

  return (
    <HeaderControlsContext.Provider value={storeRef.current}>
      {children}
    </HeaderControlsContext.Provider>
  );
};

/** MobileHeader calls this to read the current controls. Re-renders only when controls change. */
export const useHeaderControlsSlot = (): ReactNode => {
  const store = useContext(HeaderControlsContext);
  if (!store) throw new Error('useHeaderControlsSlot must be inside HeaderControlsProvider');
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
};

/** Pages call this to inject controls into the global header. Cleans up on unmount. */
export const useHeaderControls = (controls: ReactNode) => {
  const store = useContext(HeaderControlsContext);
  if (!store) throw new Error('useHeaderControls must be inside HeaderControlsProvider');

  const controlsRef = useRef(controls);
  controlsRef.current = controls;

  React.useEffect(() => {
    store.setControls(controlsRef.current);
  });

  React.useEffect(() => {
    return () => store.clearControls();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store]);
};
