import React, { useState, useEffect } from 'react';
import styles from './LeaderboardModal.module.css';
import { apiUrl } from '../utils/urls';

export function LeaderboardModal({ onClose }) {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(apiUrl('/leaderboard'))
      .then(res => res.json())
      .then(data => {
        setScores(data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching leaderboard:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className={styles.overlay} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.title}>🏆 TECH AMONG US - EVENT LEADERBOARD</div>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.tableWrapper}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 30, color: '#94a3b8' }}>Loading scores...</div>
          ) : scores.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 30, color: '#94a3b8' }}>No scores recorded yet. Complete tasks or win matches to earn points!</div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Player Name</th>
                  <th>Total Score</th>
                  <th>Tasks</th>
                  <th>Kills</th>
                  <th>Crew Wins</th>
                  <th>Imp Wins</th>
                </tr>
              </thead>
              <tbody>
                {scores.map((p, idx) => (
                  <tr key={idx}>
                    <td>
                      <span className={`${styles.rankPill} ${
                        idx === 0 ? styles.rank1 : idx === 1 ? styles.rank2 : idx === 2 ? styles.rank3 : ''
                      }`}>
                        #{idx + 1}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, color: '#f8fafc' }}>{p.name}</td>
                    <td className={styles.scoreBadge}>+{p.totalScore || 0}</td>
                    <td style={{ color: '#10b981' }}>{p.tasksCompleted || 0}</td>
                    <td style={{ color: '#ef4444' }}>{p.kills || 0}</td>
                    <td>{p.crewmateWins || 0}</td>
                    <td>{p.impostorWins || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default LeaderboardModal;
