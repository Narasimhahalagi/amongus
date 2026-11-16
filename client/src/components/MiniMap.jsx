import React from 'react';
import styles from './MiniMap.module.css';

export function MiniMap({ playerPos = { x: 560, y: 150 }, tasks = [], onClose }) {
  // Map dimensions are 1000 x 560
  const normX = (x) => `${(x / 1000) * 100}%`;
  const normY = (y) => `${(y / 560) * 100}%`;

  const rooms = [
    { name: 'CAFETERIA', x: 560, y: 140 },
    { name: 'WEAPONS', x: 780, y: 120 },
    { name: 'O2', x: 712, y: 252 },
    { name: 'NAVIGATION', x: 916, y: 286 },
    { name: 'SHIELDS', x: 752, y: 452 },
    { name: 'COMMS', x: 620, y: 480 },
    { name: 'STORAGE', x: 496, y: 396 },
    { name: 'ADMIN', x: 620, y: 300 },
    { name: 'ELECTRICAL', x: 370, y: 380 },
    { name: 'LOWER ENGINE', x: 220, y: 420 },
    { name: 'SECURITY', x: 310, y: 280 },
    { name: 'REACTOR', x: 130, y: 280 },
    { name: 'UPPER ENGINE', x: 216, y: 154 },
    { name: 'MEDBAY', x: 416, y: 196 }
  ];

  return (
    <div className={styles.overlay} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={styles.mapCard}>
        <div className={styles.mapHeader}>
          <div className={styles.mapTitle}>🗺 THE SKELD - MAP OVERVIEW</div>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.mapBody}>
          <img src="assets/map/skled.png" alt="Skeld Map" className={styles.mapImage} />

          {/* Room Labels */}
          {rooms.map((r, i) => (
            <div
              key={i}
              className={styles.roomLabel}
              style={{ left: normX(r.x), top: normY(r.y) }}
            >
              {r.name}
            </div>
          ))}

          {/* Active Tasks Exclamation Pins */}
          {tasks.filter(t => !t.completed).map((t, idx) => (
            <div
              key={idx}
              className={styles.taskPin}
              style={{ left: normX(t.x), top: normY(t.y) }}
              title={`${t.room}: ${t.stationName}`}
            >
              !
            </div>
          ))}

          {/* Local Player Pin */}
          <div
            className={styles.playerPin}
            style={{ left: normX(playerPos.x || 560), top: normY(playerPos.y || 150) }}
            title="You are here"
          />
        </div>
      </div>
    </div>
  );
}

export default MiniMap;
