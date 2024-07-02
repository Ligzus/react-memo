import styles from "./EndGameModal.module.css";
import { Button } from "../Button/Button";
import deadImageUrl from "./images/dead.png";
import celebrationImageUrl from "./images/celebration.png";
import { Link, useNavigate } from "react-router-dom";

export function EndGameModal({
  isWon,
  gameDurationSeconds,
  gameDurationMinutes,
  onClick,
  playerName,
  setPlayerName,
  setIsModalOpen,
  handleGameEnd,
  pairsCount,
}) {
  const title = isWon ? "Вы победили!" : "Вы проиграли!";
  const imgSrc = isWon ? celebrationImageUrl : deadImageUrl;
  const imgAlt = isWon ? "celebration emodji" : "dead emodji";
  const navigate = useNavigate();

  const handleClose = () => {
    setIsModalOpen(false);
    if (pairsCount === 9) {
      handleGameEnd();
    }
    onClick();
  };

  const handleLeaderboardClick = () => {
    if (pairsCount === 9) {
      handleGameEnd();
    }
    navigate(`/leaderboard`);
  };

  return (
    <div className={styles.modal}>
      <img className={styles.image} src={imgSrc} alt={imgAlt} />
      <h2 className={styles.title}>{title}</h2>
      {isWon && pairsCount === 9 ? (
        <div className={styles.inputContainer}>
          <input
            placeholder="Пользователь"
            type="text"
            id="name"
            value={playerName}
            onChange={e => setPlayerName(e.target.value)}
          />
        </div>
      ) : null}
      <p className={styles.description}>Затраченное время:</p>
      <div className={styles.time}>
        {gameDurationMinutes.toString().padStart(2, "0")}.{gameDurationSeconds.toString().padStart(2, "0")}
      </div>
      <Button onClick={handleClose}>Начать сначала</Button>
      <Link className={styles.leaderboardLink} onClick={() => handleLeaderboardClick()}>
        Перейти к лидерборду
      </Link>
    </div>
  );
}
