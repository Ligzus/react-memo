import { useParams } from "react-router-dom";
import { Cards } from "../../components/Cards/Cards";
import { useEasyMode } from "../../context/useEasyMode";

export function GamePage() {
  const { pairsCount } = useParams();
  const { isEasyMode } = useEasyMode();

  return (
    <>
      <Cards pairsCount={parseInt(pairsCount, 10)} previewSeconds={5} easyMode={isEasyMode}></Cards>
    </>
  );
}
