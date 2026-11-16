import React, { useState, useEffect } from 'react';
import styles from './TaskModal.module.css';
import sound from '../utils/sound';

export function TaskModal({ task, onComplete, onClose }) {
  const [status, setStatus] = useState('idle'); // 'idle' | 'success' | 'error'
  const [feedback, setFeedback] = useState('');
  const [isDone, setIsDone] = useState(false);

  // Category 1: Debug State
  const [selectedLine, setSelectedLine] = useState(null);

  // Category 2: Code Input State
  const [inputText, setInputText] = useState('');

  // Category 3: 8-Bit Binary Switch State
  const [bits, setBits] = useState({ 128: 0, 64: 0, 32: 0, 16: 0, 8: 0, 4: 0, 2: 0, 1: 0 });

  // Category 4: Port / Protocol Wiring State
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [connections, setConnections] = useState({}); // left -> right

  // Category 5: Reorder State
  const [orderedLines, setOrderedLines] = useState([]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Initialize reorder lines if task is reorder
  useEffect(() => {
    if (task?.puzzle?.category === 'reorder' && task.puzzle.lines) {
      // Scramble lines initially
      const scrambled = [...task.puzzle.lines].sort(() => 0.5 - Math.random());
      setOrderedLines(scrambled);
    }
  }, [task]);

  if (!task || !task.puzzle) return null;
  const { puzzle } = task;

  const handleFinishSuccess = (explanation) => {
    sound.playSuccess();
    setStatus('success');
    setFeedback(`CORRECT! ${explanation || 'Task Solved!'}`);
    setIsDone(true);
    setTimeout(() => {
      onComplete(task.id);
    }, 1400);
  };

  const handleTriggerError = (message) => {
    sound.playError();
    setStatus('error');
    setFeedback(message);
    setTimeout(() => {
      setStatus('idle');
    }, 1200);
  };

  // --- Handlers for Debug ---
  const handleLineClick = (lineIndex) => {
    if (isDone) return;
    const lineNumber = lineIndex + 1;
    setSelectedLine(lineNumber);

    if (lineNumber === puzzle.buggyLine) {
      handleFinishSuccess(puzzle.explanation);
    } else {
      handleTriggerError('Incorrect line! That line is valid. Spot the syntax/logic bug!');
      setTimeout(() => setSelectedLine(null), 900);
    }
  };

  // --- Handlers for Code Input ---
  const handleInputSubmit = (e) => {
    e.preventDefault();
    if (isDone) return;
    const cleanInput = inputText.trim().toLowerCase();
    const cleanExpected = String(puzzle.expectedAnswer).trim().toLowerCase();

    if (cleanInput === cleanExpected) {
      handleFinishSuccess(puzzle.explanation);
    } else {
      handleTriggerError(`Incorrect value "${inputText}". Check code logic and try again!`);
    }
  };

  // --- Handlers for Binary Switch ---
  const toggleBit = (val) => {
    if (isDone) return;
    sound.playClick();
    const nextVal = bits[val] === 1 ? 0 : 1;
    const nextBits = { ...bits, [val]: nextVal };
    setBits(nextBits);

    // Calculate sum
    const total = Object.entries(nextBits).reduce((sum, [b, active]) => sum + (active ? Number(b) : 0), 0);
    if (total === puzzle.target) {
      handleFinishSuccess(puzzle.explanation);
    }
  };

  const currentBinarySum = Object.entries(bits).reduce((sum, [b, active]) => sum + (active ? Number(b) : 0), 0);

  // --- Handlers for Wire Connect ---
  const handleLeftClick = (item) => {
    if (isDone) return;
    sound.playClick();
    setSelectedLeft(item);
  };

  const handleRightClick = (item) => {
    if (isDone || !selectedLeft) return;
    sound.playClick();

    // Check if matching pair
    const matchingPair = puzzle.pairs.find(p => p.left === selectedLeft && p.right === item);
    if (matchingPair) {
      const updated = { ...connections, [selectedLeft]: item };
      setConnections(updated);
      setSelectedLeft(null);

      // Check if all connected
      if (Object.keys(updated).length === puzzle.pairs.length) {
        handleFinishSuccess(puzzle.explanation);
      }
    } else {
      handleTriggerError(`Mismatch: ${selectedLeft} does not connect to ${item}!`);
      setSelectedLeft(null);
    }
  };

  // --- Handlers for Reorder ---
  const moveLine = (index, direction) => {
    if (isDone) return;
    sound.playClick();
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= orderedLines.length) return;

    const updated = [...orderedLines];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setOrderedLines(updated);
  };

  const verifyOrder = () => {
    if (isDone) return;
    const currentOrder = orderedLines.map(l => l.id);
    const isCorrect = puzzle.correctOrder.every((id, idx) => id === currentOrder[idx]);

    if (isCorrect) {
      handleFinishSuccess(puzzle.explanation);
    } else {
      handleTriggerError('Execution Failed: Scrambled order is logically invalid. Adjust lines and re-run!');
    }
  };

  return (
    <div className={styles.overlay} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={styles.tablet}>
        {/* Top Bezel */}
        <div className={styles.bezelTop}>
          <div className={styles.roomTitle}>
            <span>{task.room || 'SYSTEM'}</span>
            <span className={styles.stationTag}>• {task.stationName || 'TERMINAL'}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className={`${styles.categoryBadge} ${
              puzzle.category === 'debug' ? styles.badgeDebug :
              puzzle.category === 'code_input' ? styles.badgeInput :
              puzzle.category === 'binary_switch' ? styles.badgeBinary :
              puzzle.category === 'wire_connect' ? styles.badgeWire : styles.badgeReorder
            }`}>
              {puzzle.category === 'debug' ? 'DEBUG BUG' :
               puzzle.category === 'code_input' ? 'TERMINAL SOLVER' :
               puzzle.category === 'binary_switch' ? 'BINARY SWITCH' :
               puzzle.category === 'wire_connect' ? 'PORT WIRING' : 'ALGORITHM ORDER'}
            </span>

            <button className={styles.closeBtn} onClick={onClose} title="Close Task">✕</button>
          </div>
        </div>

        {/* Task Content */}
        <div className={styles.content}>
          <div className={styles.descriptionBox}>
            <div style={{ fontWeight: 700, color: '#38fedc', marginBottom: 4 }}>
              {puzzle.title} {puzzle.language ? `(${puzzle.language})` : ''}
            </div>
            <div>{puzzle.description}</div>
          </div>

          {/* ================= TYPE 1: DEBUG CODE (CLICK BUGGY LINE) ================= */}
          {puzzle.category === 'debug' && Array.isArray(puzzle.code) && (
            <div className={styles.codeWindow}>
              <div className={styles.codeHeader}>
                <span>TERMINAL://INSPECT_CODE</span>
                <span>CLICK EXACT BUGGY LINE</span>
              </div>
              {puzzle.code.map((line, idx) => {
                const lineNum = idx + 1;
                const isSelected = selectedLine === lineNum;
                const isCorrect = isSelected && lineNum === puzzle.buggyLine;
                const isWrong = isSelected && lineNum !== puzzle.buggyLine;

                return (
                  <div
                    key={idx}
                    className={`${styles.codeLine} ${isCorrect ? styles.lineSuccess : ''} ${isWrong ? styles.lineError : ''}`}
                    onClick={() => handleLineClick(idx)}
                  >
                    <span className={styles.codeLineNumber}>{lineNum}</span>
                    <span className={styles.codeLineText}>{line}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* ================= TYPE 2: CODE INPUT (TYPE ANSWER) ================= */}
          {puzzle.category === 'code_input' && (
            <>
              {puzzle.code && (
                <div className={styles.codeWindow}>
                  <div className={styles.codeHeader}>
                    <span>SNIPPET://{puzzle.language || 'LOGIC'}</span>
                  </div>
                  <pre style={{ margin: 0, padding: 14, color: '#e6edf3', fontSize: '0.95rem' }}>
                    {puzzle.code}
                  </pre>
                </div>
              )}

              <form className={styles.terminalInputForm} onSubmit={handleInputSubmit}>
                <label className={styles.inputPromptLabel}>
                  {puzzle.prompt || 'Type the expected result:'}
                </label>
                <div className={styles.inputRow}>
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type value here..."
                    className={styles.terminalInput}
                    disabled={isDone}
                    autoFocus
                  />
                  <button type="submit" className={styles.submitBtn} disabled={isDone}>
                    SUBMIT
                  </button>
                </div>
              </form>
            </>
          )}

          {/* ================= TYPE 3: 8-BIT BINARY SWITCH ================= */}
          {puzzle.category === 'binary_switch' && (
            <div className={styles.binaryBoard}>
              <div className={styles.targetScoreHeader}>
                <span>TARGET DECIMAL: <span className={styles.targetHighlight}>{puzzle.target}</span></span>
                <span>CURRENT SUM: <span className={styles.currentHighlight}>{currentBinarySum}</span></span>
              </div>

              <div className={styles.switchesGrid}>
                {[128, 64, 32, 16, 8, 4, 2, 1].map((bitVal) => {
                  const isActive = bits[bitVal] === 1;
                  return (
                    <div
                      key={bitVal}
                      className={`${styles.switchCard} ${isActive ? styles.switchActive : ''}`}
                      onClick={() => toggleBit(bitVal)}
                    >
                      <span className={styles.bitValue}>+{bitVal}</span>
                      <div className={`${styles.switchState} ${isActive ? styles.stateActive : ''}`}>
                        {isActive ? '1' : '0'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================= TYPE 4: PORT / LOGIC WIRING ================= */}
          {puzzle.category === 'wire_connect' && puzzle.pairs && (
            <div className={styles.wiringContainer}>
              {/* Left Column */}
              <div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: 8, fontWeight: 700 }}>
                  STEP 1: SELECT PROTOCOL
                </div>
                {puzzle.pairs.map((p, idx) => {
                  const isConnected = !!connections[p.left];
                  const isSelected = selectedLeft === p.left;
                  return (
                    <div
                      key={idx}
                      className={`${styles.wireNode} ${isSelected ? styles.wireNodeSelected : ''} ${isConnected ? styles.wireNodeConnected : ''}`}
                      onClick={() => !isConnected && handleLeftClick(p.left)}
                    >
                      <span>{p.left}</span>
                      <span>{isConnected ? '✔' : '➔'}</span>
                    </div>
                  );
                })}
              </div>

              {/* Right Column */}
              <div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: 8, fontWeight: 700 }}>
                  STEP 2: CONNECT TO PORT / SIZE
                </div>
                {puzzle.pairs.map((p, idx) => {
                  const connectedWith = Object.keys(connections).find(k => connections[k] === p.right);
                  return (
                    <div
                      key={idx}
                      className={`${styles.wireNode} ${connectedWith ? styles.wireNodeConnected : ''}`}
                      onClick={() => handleRightClick(p.right)}
                    >
                      <span>{connectedWith ? `[${connectedWith}]` : '•'}</span>
                      <span>{p.right}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================= TYPE 5: ALGORITHM REORDER ================= */}
          {puzzle.category === 'reorder' && (
            <div className={styles.reorderList}>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: 4, fontWeight: 700 }}>
                REORDER CODE LINES INTO CHRONOLOGICAL SEQUENCE:
              </div>

              {orderedLines.map((line, idx) => (
                <div key={line.id} className={styles.reorderItem}>
                  <span className={styles.reorderText}>
                    <span style={{ color: '#64748b', marginRight: 10 }}>#{idx + 1}</span>
                    {line.text}
                  </span>

                  <div className={styles.reorderArrows}>
                    <button
                      className={styles.arrowBtn}
                      onClick={() => moveLine(idx, -1)}
                      disabled={idx === 0 || isDone}
                    >
                      ▲
                    </button>
                    <button
                      className={styles.arrowBtn}
                      onClick={() => moveLine(idx, 1)}
                      disabled={idx === orderedLines.length - 1 || isDone}
                    >
                      ▼
                    </button>
                  </div>
                </div>
              ))}

              <button className={styles.reorderRunBtn} onClick={verifyOrder} disabled={isDone}>
                ⚡ RUN & COMPILE ALGORITHM
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <div className={styles.statusMessage}>
            {status === 'success' && <span className={styles.successText}>✔ {feedback}</span>}
            {status === 'error' && <span className={styles.errorText}>✖ {feedback}</span>}
            {status === 'idle' && (
              <span className={styles.hintText}>
                {puzzle.category === 'debug' ? '⚡ Click the line with syntax or logic error' :
                 puzzle.category === 'code_input' ? '⚡ Type the exact calculated value or keyword' :
                 puzzle.category === 'binary_switch' ? `⚡ Toggle bits until sum equals ${puzzle.target}` :
                 puzzle.category === 'wire_connect' ? '⚡ Click protocol on left, then matching port on right' :
                 '⚡ Use ▲ ▼ to arrange steps in correct order'}
              </span>
            )}
          </div>

          <div className={styles.pointsBadge}>
            +15 PTS
          </div>
        </div>
      </div>
    </div>
  );
}

export default TaskModal;
