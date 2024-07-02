import { Link, useNavigate } from "react-router-dom";
import styles from "./SelectLevelPage.module.css";
import { useEasyMode } from "../../context/useEasyMode";

export function SelectLevelPage() {
  const { isEasyMode, setIsEasyMode } = useEasyMode();
  const navigate = useNavigate();

  const handleLevelClick = pairsCount => {
    navigate(`/game/${pairsCount}`);
  };

  const handleLeaderboardClick = () => {
    navigate(`/leaderboard`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.modal}>
        <h1 className={styles.title}>Выбери сложность</h1>
        <ul className={styles.levels}>
          <li className={styles.level}>
            <button className={styles.levelLink} onClick={() => handleLevelClick(3)}>
              1
            </button>
          </li>
          <li className={styles.level}>
            <button className={styles.levelLink} onClick={() => handleLevelClick(6)}>
              2
            </button>
          </li>
          <li className={styles.level}>
            <button className={styles.levelLink} onClick={() => handleLevelClick(9)}>
              3
            </button>
          </li>
        </ul>
        <div className={styles.easyModeToggle}>
          <label className={styles.checkboxContainer}>
            <input type="checkbox" checked={isEasyMode} onChange={e => setIsEasyMode(e.target.checked)} />
            Легкий режим (3 жизни)
            <span className={styles.checkmark}></span>
          </label>
        </div>
        <Link className={styles.leaderboardLink} onClick={() => handleLeaderboardClick()}>
          Перейти к лидерборду
        </Link>
      </div>
    </div>
  );
}
