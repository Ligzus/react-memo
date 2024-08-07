import { shuffle } from "lodash";
import { useEffect, useState } from "react";
import { generateDeck } from "../../utils/cards";
import styles from "./Cards.module.css";
import { EndGameModal } from "../../components/EndGameModal/EndGameModal";
import { Button } from "../../components/Button/Button";
import { Card } from "../../components/Card/Card";

// Игра закончилась
const STATUS_LOST = "STATUS_LOST";
const STATUS_WON = "STATUS_WON";
// Идет игра: карты закрыты, игрок может их открыть
const STATUS_IN_PROGRESS = "STATUS_IN_PROGRESS";
// Начало игры: игрок видит все карты в течении нескольких секунд
const STATUS_PREVIEW = "STATUS_PREVIEW";

function getTimerValue(startDate, endDate) {
  if (!startDate && !endDate) {
    return {
      minutes: 0,
      seconds: 0,
    };
  }

  if (endDate === null) {
    endDate = new Date();
  }

  const diffInSeconds = Math.floor((endDate.getTime() - startDate.getTime()) / 1000);
  const minutes = Math.floor(diffInSeconds / 60);
  const seconds = diffInSeconds % 60;
  return {
    minutes,
    seconds,
  };
}

/**
 * Основной компонент игры, внутри него находится вся игровая механика и логика.
 * pairsCount - сколько пар будет в игре
 * previewSeconds - сколько секунд пользователь будет видеть все карты открытыми до начала игры
 * easyMode - режим упрощенной игры, заканчивающийся после трех ошибок
 */
export function Cards({ pairsCount = 3, previewSeconds = 5, easyMode = false }) {
  // В cards лежит игровое поле - массив карт и их состояние открыта\закрыта
  const [cards, setCards] = useState([]);
  // Текущий статус игры
  const [status, setStatus] = useState(STATUS_PREVIEW);

  // Дата начала игры
  const [gameStartDate, setGameStartDate] = useState(null);
  // Дата конца игры
  const [gameEndDate, setGameEndDate] = useState(null);

  // Стейт для таймера, высчитывается в setInterval на основе gameStartDate и gameEndDate
  const [timer, setTimer] = useState({
    seconds: 0,
    minutes: 0,
  });

  // Количество оставшихся попыток в упрощенном режиме
  const [attemptsLeft, setAttemptsLeft] = useState(3);

  // Имя игрока
  const [playerName, setPlayerName] = useState("");
  // Состояние модального окна
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Состояния для суперсил
  const [insightUsed, setInsightUsed] = useState(false); // Прозрение
  const [alohomoraUsed, setAlohomoraUsed] = useState(false); // Алохомора

  // Состояние для таймера суперсилы
  const [timerInterval, setTimerInterval] = useState(null);

  // Состояние для отображения суперсил
  const [showSuperPowers, setShowSuperPowers] = useState(false);

  function finishGame(status = STATUS_LOST) {
    setGameEndDate(new Date());
    setStatus(status);

    if (status === STATUS_WON && pairsCount === 9) {
      setIsModalOpen(true);
    }
  }

  function handleGameEnd() {
    const totalSeconds = timer.minutes * 60 + timer.seconds;
    const leaderData = { name: playerName || "Пользователь", time: totalSeconds };

    let achievements = [];

    if (status === STATUS_WON) {
      if (!easyMode && !insightUsed && !alohomoraUsed) {
        achievements = [1, 2];
      } else if (!easyMode && (insightUsed || alohomoraUsed)) {
        achievements = [1];
      } else if (easyMode && !insightUsed && !alohomoraUsed) {
        achievements = [2];
      }
    }

    const leaderWithAchievements = { ...leaderData, achievements };

    fetch("https://wedev-api.sky.pro/api/v2/leaderboard", {
      method: "POST",
      body: JSON.stringify(leaderWithAchievements),
    })
      .then(response => response.json())
      .then(data => {
        console.log(data);
      })
      .catch(error => {
        console.error("Ошибка отправки данных о рекорде:", error);
      });
  }

  function startGame() {
    const startDate = new Date();
    setGameEndDate(null);
    setGameStartDate(startDate);
    setTimer(getTimerValue(startDate, null));
    setStatus(STATUS_IN_PROGRESS);

    // Показываем суперсилы
    setShowSuperPowers(true);
  }

  function resetGame() {
    setGameStartDate(null);
    setGameEndDate(null);
    setTimer(getTimerValue(null, null));
    setStatus(STATUS_PREVIEW);
    setAttemptsLeft(3);
    setIsModalOpen(false);
    setPlayerName("");
    setInsightUsed(false);
    setAlohomoraUsed(false);
    setShowSuperPowers(false);
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
  }

  /**
   * Обработка основного действия в игре - открытие карты.
   * После открытия карты игра может переходить в следующие состояния
   * - "Игрок выиграл", если на поле открыты все карты
   * - "Игрок проиграл", если на поле есть две открытые карты без пары
   * - "Игра продолжается", если не случилось первых двух условий
   */
  const openCard = clickedCard => {
    // Если карта уже открыта, то ничего не делаем
    if (clickedCard.open) {
      return;
    }
    // Игровое поле после открытия кликнутой карты
    const nextCards = cards.map(card => {
      if (card.id !== clickedCard.id) {
        return card;
      }

      return {
        ...card,
        open: true,
      };
    });

    setCards(nextCards);

    const isPlayerWon = nextCards.every(card => card.open);

    // Победа - все карты на поле открыты
    if (isPlayerWon) {
      finishGame(STATUS_WON);
      return;
    }

    // Открытые карты на игровом поле
    const openCards = nextCards.filter(card => card.open);

    // Ищем открытые карты, у которых нет пары среди других открытых
    const openCardsWithoutPair = openCards.filter(card => {
      const sameCards = openCards.filter(openCard => card.suit === openCard.suit && card.rank === openCard.rank);

      if (sameCards.length < 2) {
        return true;
      }

      return false;
    });

    const playerLost = openCardsWithoutPair.length >= 2;

    // "Игрок проиграл", т.к на поле есть две открытые карты без пары
    if (playerLost) {
      if (easyMode && attemptsLeft > 1) {
        setAttemptsLeft(attemptsLeft - 1);
        const resetOpenCards = nextCards.map(card =>
          openCardsWithoutPair.some(openCard => openCard.id === card.id) ? { ...card, open: false } : card,
        );
        setCards(resetOpenCards);
      } else {
        finishGame(STATUS_LOST);
      }
      return;
    }

    // ... игра продолжается
  };

  const isGameEnded = status === STATUS_LOST || status === STATUS_WON;

  // Игровой цикл
  useEffect(() => {
    // В статусах кроме превью доп логики не требуется
    if (status !== STATUS_PREVIEW) {
      return;
    }

    // В статусе превью мы
    if (pairsCount > 36) {
      alert("Столько пар сделать невозможно");
      return;
    }

    setCards(() => {
      return shuffle(generateDeck(pairsCount, 10));
    });

    const timerId = setTimeout(() => {
      startGame();
    }, previewSeconds * 1000);

    return () => {
      clearTimeout(timerId);
    };
  }, [status, pairsCount, previewSeconds]);

  // Обновляем значение таймера в интервале
  useEffect(() => {
    const intervalId = setInterval(() => {
      setTimer(getTimerValue(gameStartDate, gameEndDate));
    }, 300);
    setTimerInterval(intervalId);
    return () => {
      clearInterval(intervalId);
    };
  }, [gameStartDate, gameEndDate]);

  // Обработчик для суперсилы "Прозрение"
  const useInsight = () => {
    if (insightUsed || isGameEnded || status !== STATUS_IN_PROGRESS) {
      return;
    }

    setInsightUsed(true);

    const previouslyOpenCards = cards.filter(card => card.open);

    const allCardsOpen = cards.map(card => ({ ...card, open: true }));
    setCards(allCardsOpen);

    clearInterval(timerInterval);
    setTimerInterval(null);

    const resumeTime = new Date();

    setTimeout(() => {
      const restoredCards = cards.map(card =>
        previouslyOpenCards.some(openCard => openCard.id === card.id) ? card : { ...card, open: false },
      );
      setCards(restoredCards);
      setGameStartDate(new Date(gameStartDate.getTime() + (new Date() - resumeTime)));
      const intervalId = setInterval(() => {
        setTimer(getTimerValue(gameStartDate, gameEndDate));
      }, 300);
      setTimerInterval(intervalId);
    }, 5000);
  };

  // Обработчик для суперсилы "Алохомора"
  const useAlohomora = () => {
    if (alohomoraUsed || isGameEnded || status !== STATUS_IN_PROGRESS) {
      return;
    }

    setAlohomoraUsed(true);

    const closedCards = cards.filter(card => !card.open);
    const pairs = {};

    closedCards.forEach(card => {
      const key = `${card.suit}-${card.rank}`;
      if (!pairs[key]) {
        pairs[key] = [];
      }
      pairs[key].push(card);
    });

    const pairKeys = Object.keys(pairs).filter(key => pairs[key].length >= 2);

    if (pairKeys.length === 0) {
      return;
    }

    const randomKey = pairKeys[Math.floor(Math.random() * pairKeys.length)];
    const randomPair = pairs[randomKey].slice(0, 2);

    const updatedCards = cards.map(card =>
      randomPair.some(pairCard => pairCard.id === card.id) ? { ...card, open: true } : card,
    );

    setCards(updatedCards);

    const isPlayerWon = updatedCards.every(card => card.open);

    if (isPlayerWon) {
      finishGame(STATUS_WON);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.timer}>
          {status === STATUS_PREVIEW ? (
            <div>
              <p className={styles.previewText}>Запоминайте пары!</p>
              <p className={styles.previewDescription}>Игра начнется через {previewSeconds} секунд</p>
            </div>
          ) : (
            <>
              <div className={styles.timerValue}>
                <div className={styles.timerDescription}>min</div>
                <div>{timer.minutes.toString().padStart(2, "0")}</div>
              </div>
              .
              <div className={styles.timerValue}>
                <div className={styles.timerDescription}>sec</div>
                <div>{timer.seconds.toString().padStart(2, "0")}</div>
              </div>
            </>
          )}
        </div>

        {showSuperPowers && (
          <div className={styles.superPowers}>
            <button onClick={useInsight} disabled={insightUsed || isGameEnded || status !== STATUS_IN_PROGRESS}>
              <img src={`${process.env.PUBLIC_URL}/insight.png`} alt="Прозрение" />
            </button>
            <button onClick={useAlohomora} disabled={alohomoraUsed || isGameEnded || status !== STATUS_IN_PROGRESS}>
              <img src={`${process.env.PUBLIC_URL}/alohomora.png`} alt="Алохомора" />
            </button>
          </div>
        )}
        <div>
          {status === STATUS_IN_PROGRESS ? <Button onClick={resetGame}>Начать заново</Button> : null}
          {easyMode && status === STATUS_IN_PROGRESS ? (
            <div className={styles.attempts}>
              <p>Попыток осталось: {attemptsLeft}</p>
            </div>
          ) : null}
        </div>
      </div>

      <div className={styles.cards}>
        {cards.map(card => (
          <Card
            key={card.id}
            onClick={() => openCard(card)}
            open={status !== STATUS_IN_PROGRESS ? true : card.open}
            suit={card.suit}
            rank={card.rank}
          />
        ))}
      </div>

      {isGameEnded ? (
        <div className={styles.modalContainer}>
          <EndGameModal
            isWon={status === STATUS_WON}
            gameDurationSeconds={timer.seconds}
            gameDurationMinutes={timer.minutes}
            onClick={resetGame}
            playerName={playerName}
            setPlayerName={setPlayerName}
            isModalOpen={isModalOpen}
            setIsModalOpen={setIsModalOpen}
            handleGameEnd={handleGameEnd}
            pairsCount={pairsCount}
          />
        </div>
      ) : null}
    </div>
  );
}
