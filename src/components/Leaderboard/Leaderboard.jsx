import { useEffect, useState } from "react";
import styles from "./Leaderboard.module.css";

export function Leaderboard() {
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
    fetch("https://wedev-api.sky.pro/api/leaderboard")
      .then(response => response.json())
      .then(data => {
        const sortedLeaders = data.leaders.sort((a, b) => a.time - b.time);
        setLeaders(sortedLeaders);
      })
      .catch(error => console.error("Ошибка получения списка рекордсменов:", error));
  }, []);

  return (
    <div className={styles.leaderboard}>
      <ul>
        <div className={styles.leader}>
          <span>Позиция</span>
          <span>Пользователь</span>
          <span>Время</span>
        </div>
        {leaders.map((leader, index) => (
          <li key={leader.id} className={styles.leader}>
            <span>#{index + 1}</span>
            <span>{leader.name}</span>
            <span>{leader.time} сек.</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
