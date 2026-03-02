import React, { createContext, useContext, useState, useCallback } from 'react';
import Snackbar from '../components/Snackbar';

const UIContext = createContext(null);

export function UIProvider({ children }) {
  const [snack, setSnack] = useState(null);

  const showSnackbar = useCallback((message, options = {}) => {
    setSnack({ message, ...options });
    if (!options.persistent) {
      setTimeout(() => setSnack(null), options.duration || 4000);
    }
  }, []);

  const closeSnackbar = useCallback(() => setSnack(null), []);

  return (
    <UIContext.Provider value={{ showSnackbar, closeSnackbar }}>
      {children}
      <Snackbar open={!!snack} message={snack?.message} type={snack?.type} onClose={closeSnackbar} />
    </UIContext.Provider>
  );
}

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUI must be used within UIProvider');
  return ctx;
}

export default UIContext;
