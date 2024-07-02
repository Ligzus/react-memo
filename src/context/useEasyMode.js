import { useContext } from "react";
import { EasyModeContext } from "./EasyModeContext";

export function useEasyMode() {
  return useContext(EasyModeContext);
}
