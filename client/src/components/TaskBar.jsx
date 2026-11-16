import React from 'react';
import styles from './TaskBar.module.css';

export function TaskBar({ completed = 0, total = 0, percentage = 0 }) {
  const segments = 10;

  return (
    <div className={styles.taskBarContainer}>
      <div className={styles.titleRow}>
        <span className={styles.titleText}>TOTAL TASKS COMPLETED</span>
        <span className={styles.countText}>
          {total > 0 ? `${completed}/${total} (${percentage}%)` : '0%'}
        </span>
      </div>

      <div className={styles.barTrack}>
        <div
          className={styles.barFill}
          style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
        />
        <div className={styles.segmentsOverlay}>
          {Array.from({ length: segments }).map((_, i) => (
            <div key={i} className={styles.segmentDivider} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default TaskBar;
