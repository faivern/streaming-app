import { createContext, useContext, useState } from "react";

interface SignInModalContextValue {
  isOpen: boolean;
  openSignInModal: (callback?: () => void) => void;
  closeSignInModal: () => void;
  pendingCallback: (() => void) | null;
}

const SignInModalContext = createContext<SignInModalContextValue | null>(null);

export function SignInModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingCallback, setPendingCallback] = useState<(() => void) | null>(null);

  const openSignInModal = (callback?: () => void) => {
    setPendingCallback(callback ?? null);
    setIsOpen(true);
  };

  const closeSignInModal = () => {
    setIsOpen(false);
  };

  return (
    <SignInModalContext.Provider value={{ isOpen, openSignInModal, closeSignInModal, pendingCallback }}>
      {children}
    </SignInModalContext.Provider>
  );
}

export function useSignInModal() {
  const ctx = useContext(SignInModalContext);
  if (!ctx) {
    throw new Error("useSignInModal must be used within a SignInModalProvider");
  }
  return ctx;
}
