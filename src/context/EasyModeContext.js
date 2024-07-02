import { createContext, useState } from "react";

export const EasyModeContext = createContext();

export function EasyModeProvider({ children }) {
  const [isEasyMode, setIsEasyMode] = useState(false);

  return <EasyModeContext.Provider value={{ isEasyMode, setIsEasyMode }}>{children}</EasyModeContext.Provider>;
}
