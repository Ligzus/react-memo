import { createBrowserRouter } from "react-router-dom";
import { GamePage } from "./pages/GamePage/GamePage";
import { SelectLevelPage } from "./pages/SelectLevelPage/SelectLevelPage";
import { LeaderboardPage } from "./pages/LeaderboardPage/LeaderboardPage";
import { EasyModeProvider } from "./context/EasyModeContext";

export const router = createBrowserRouter(
  [
    {
      path: "/",
      element: (
        <EasyModeProvider>
          <SelectLevelPage />
        </EasyModeProvider>
      ),
    },
    {
      path: "/game/:pairsCount",
      element: (
        <EasyModeProvider>
          <GamePage />
        </EasyModeProvider>
      ),
    },
    {
      path: "/leaderboard",
      element: (
        <EasyModeProvider>
          <LeaderboardPage />
        </EasyModeProvider>
      ),
    },
  ],
  { basename: "/react-memo" },
);
