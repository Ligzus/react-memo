import { useParams, useLocation } from "react-router-dom";
import { Cards } from "../../components/Cards/Cards";

export function GamePage() {
  const { pairsCount } = useParams();
  const query = new URLSearchParams(useLocation().search);
  const easyMode = query.get("easyMode") === "true";

  return (
    <>
      <Cards pairsCount={parseInt(pairsCount, 10)} previewSeconds={5} easyMode={easyMode}></Cards>
    </>
  );
}
