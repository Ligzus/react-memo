import { useEffect, useState } from "react";
import styles from "./Leaderboard.module.css";

export function Leaderboard() {
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
    fetch("https://wedev-api.sky.pro/api/v2/leaderboard")
      .then(response => response.json())
      .then(data => {
        const sortedLeaders = data.leaders.sort((a, b) => a.time - b.time);
        setLeaders(sortedLeaders);
      })
      .catch(error => console.error("Ошибка получения списка рекордсменов:", error));
  }, []);

  const getAchievementsIcons = achievements => {
    const icons = [];
    if (achievements.includes(1) && achievements.includes(2)) {
      icons.push(
        <img key="hardmode" src={`${process.env.PUBLIC_URL}/hardmode.png`} alt="hardmode" />,
        <img key="withoutsuperpower" src={`${process.env.PUBLIC_URL}/withoutsuperpower.png`} alt="withoutsuperpower" />,
      );
    } else if (achievements.includes(1)) {
      icons.push(
        <img key="hardmode" src={`${process.env.PUBLIC_URL}/hardmode.png`} alt="hardmode" />,
        <img key="superpower" src={`${process.env.PUBLIC_URL}/superpower.png`} alt="superpower" />,
      );
    } else if (achievements.includes(2)) {
      icons.push(
        <img key="withouthardmode" src={`${process.env.PUBLIC_URL}/withouthardmode.png`} alt="withouthardmode" />,
        <img key="withoutsuperpower" src={`${process.env.PUBLIC_URL}/withoutsuperpower.png`} alt="withoutsuperpower" />,
      );
    } else {
      icons.push(
        <img key="withouthardmode" src={`${process.env.PUBLIC_URL}/withouthardmode.png`} alt="withouthardmode" />,
        <img key="superpower" src={`${process.env.PUBLIC_URL}/superpower.png`} alt="superpower" />,
      );
    }
    return icons;
  };

  return (
    <div className={styles.leaderboard}>
      <ul>
        <div className={styles.leader}>
          <span>Позиция</span>
          <span>Пользователь</span>
          <span>Достижения</span>
          <span>Время</span>
        </div>
        {leaders.map((leader, index) => (
          <li key={leader.id} className={styles.leader}>
            <span># {index + 1}</span>
            <span>{leader.name}</span>
            <span>{getAchievementsIcons(leader.achievements)}</span>
            <span>{leader.time} сек.</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
