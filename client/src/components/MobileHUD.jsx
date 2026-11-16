import React, { useState, useRef, useEffect } from 'react';
import styles from './MobileHUD.module.css';
import { EventBus } from '../game/EventBus';

export function MobileHUD({
  isImposter = false,
  canUse = false,
  canReport = false,
  canKill = false,
  killCooldown = 0,
  onUse,
  onReport,
  onKill,
  onToggleMap,
  onOpenLeaderboard
}) {
  const joystickZoneRef = useRef(null);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const activeTouchId = useRef(null);

  // Touch handlers for virtual joystick
  const handleTouchStart = (e) => {
    const touch = e.changedTouches[0];
    activeTouchId.current = touch.identifier;
    handleTouchMove(e);
  };

  const handleTouchMove = (e) => {
    if (!joystickZoneRef.current) return;
    const touch = Array.from(e.touches).find(t => t.identifier === activeTouchId.current);
    if (!touch) return;

    const rect = joystickZoneRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = touch.clientX - centerX;
    const dy = touch.clientY - centerY;
    const dist = Math.hypot(dx, dy);
    const maxRadius = rect.width / 2 - 10;

    let clampedX = dx;
    let clampedY = dy;
    if (dist > maxRadius) {
      clampedX = (dx / dist) * maxRadius;
      clampedY = (dy / dist) * maxRadius;
    }

    setKnobPos({ x: clampedX, y: clampedY });

    // Normalize -1 to 1 vector
    const normX = clampedX / maxRadius;
    const normY = clampedY / maxRadius;
    EventBus.emit('joystick-move', { x: normX, y: normY });
  };

  const handleTouchEnd = (e) => {
    const ended = Array.from(e.changedTouches).some(t => t.identifier === activeTouchId.current);
    if (ended) {
      activeTouchId.current = null;
      setKnobPos({ x: 0, y: 0 });
      EventBus.emit('joystick-end');
    }
  };

  // Keyboard shortcut listener for desktop (E: Use, R: Report, Q: Kill, M: Map)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if ((e.key === 'e' || e.key === 'E' || e.key === ' ') && canUse) {
        e.preventDefault();
        onUse();
      } else if ((e.key === 'r' || e.key === 'R') && canReport) {
        e.preventDefault();
        onReport();
      } else if ((e.key === 'q' || e.key === 'Q') && isImposter && canKill && killCooldown <= 0) {
        e.preventDefault();
        onKill();
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        onToggleMap();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUse, canReport, canKill, isImposter, killCooldown, onUse, onReport, onKill, onToggleMap]);

  return (
    <div className={styles.hudContainer}>
      {/* Top-Right Buttons */}
      <div className={styles.topRightCluster}>
        <button className={styles.hudPillBtn} onClick={onToggleMap}>
          🗺 MAP [M]
        </button>
        <button className={styles.hudPillBtn} onClick={onOpenLeaderboard}>
          🏆 SCORES
        </button>
      </div>

      {/* Floating Virtual Joystick */}
      <div
        ref={joystickZoneRef}
        className={styles.joystickZone}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        <div className={styles.joystickBase}>
          <div
            className={styles.joystickKnob}
            style={{
              transform: `translate(${knobPos.x}px, ${knobPos.y}px)`
            }}
          />
        </div>
      </div>

      {/* Bottom-Right Game Action Buttons */}
      <div className={styles.actionsCluster}>
        {/* KILL Button (Imposter Only) */}
        {isImposter && (
          <button
            className={`${styles.actionBtn} ${canKill && killCooldown <= 0 ? styles.btnKillActive : ''}`}
            onClick={onKill}
            disabled={!canKill || killCooldown > 0}
            title="Kill Crewmate [Q]"
          >
            <span style={{ fontSize: '1.4rem' }}>⚔</span>
            <span className={styles.btnLabel}>KILL</span>
            {killCooldown > 0 && (
              <div className={styles.cooldownBadge}>
                {Math.ceil(killCooldown)}s
              </div>
            )}
          </button>
        )}

        {/* REPORT Button */}
        <button
          className={`${styles.actionBtn} ${canReport ? styles.btnReportActive : ''}`}
          onClick={onReport}
          disabled={!canReport}
          title="Report Dead Body [R]"
        >
          <span style={{ fontSize: '1.4rem' }}>📢</span>
          <span className={styles.btnLabel}>REPORT</span>
        </button>

        {/* USE Button */}
        <button
          className={`${styles.actionBtn} ${canUse ? styles.btnUseActive : ''}`}
          onClick={onUse}
          disabled={!canUse}
          title="Use / Do Task [E]"
        >
          <span style={{ fontSize: '1.4rem' }}>⚡</span>
          <span className={styles.btnLabel}>USE</span>
        </button>
      </div>
    </div>
  );
}

export default MobileHUD;
