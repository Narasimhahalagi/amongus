import React, { useState } from 'react';
import styles from './TaskChecklist.module.css';

export function TaskChecklist({ tasks = [] }) {
  const [minimized, setMinimized] = useState(false);

  if (!tasks || tasks.length === 0) return null;

  return (
    <div className={styles.checklistContainer}>
      <div className={styles.header} onClick={() => setMinimized(prev => !prev)} style={{ cursor: 'pointer' }}>
        <span>📋 CREWMATE TASKS ({tasks.filter(t => t.completed).length}/{tasks.length})</span>
        <span>{minimized ? '▼' : '▲'}</span>
      </div>

      {!minimized && (
        <div className={styles.taskList}>
          {tasks.map((t, idx) => (
            <div
              key={t.id || idx}
              className={`${styles.taskItem} ${t.completed ? styles.taskCompleted : ''}`}
            >
              <span className={t.completed ? styles.bulletDone : styles.bulletActive}>
                {t.completed ? '✔' : '🟡'}
              </span>
              <span>
                <strong>{t.room}:</strong> {t.stationName || t.puzzle?.title || 'Task'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TaskChecklist;
