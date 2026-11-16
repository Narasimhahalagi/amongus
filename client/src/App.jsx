import { useState, useEffect, useRef } from 'react';
import { PhaserGame } from './PhaserGame';
import socketService from './services/socket';
import Menu from './pages/Menu.jsx';
import styles from './App.module.css';
import Button from "./components/Button.jsx";
import Meeting from "./components/Meeting.jsx";
import EndGame from "./components/EndGame.jsx";
import { EventBus } from './game/EventBus';
import RoleIndicator from "./components/RoleIndicator.jsx";
import { ToastContainer } from "./components/Toast.jsx";
import TaskBar from "./components/TaskBar.jsx";
import TaskChecklist from "./components/TaskChecklist.jsx";
import TaskModal from "./components/TaskModal.jsx";
import MiniMap from "./components/MiniMap.jsx";
import MobileHUD from "./components/MobileHUD.jsx";
import LeaderboardModal from "./components/LeaderboardModal.jsx";
import { apiUrl } from "./utils/urls.js";
import sound from "./utils/sound.js";

const PAGES = { MENU: 'lobby', WAITING: 'waiting', GAME: 'game', GAMEEND: 'gameend' };

function App() {
  const [currentPage, setCurrentPage] = useState(PAGES.MENU);
  const [roomId, setRoomId] = useState(null);
  const roomIdRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState(null);
  const playerIdRef = useRef(null);
  const playerNameRef = useRef('');
  const [error, setError] = useState(null);
  const debug = useRef(import.meta.env.VITE_DEBUG === 'true');

  // Meeting state
  const [meetingActive, setMeetingActive] = useState(false);
  const [meetingData, setMeetingData] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(60000);
  const [gameResult, setGameResult] = useState(null);
  const [isLocalPlayerImposter, setIsLocalPlayerImposter] = useState(false);
  const [isLocalPlayerHost, setIsLocalPlayerHost] = useState(false);
  const LocalImposterRef = useRef(false);
  const [roleIndicator, setRoleIndicator] = useState(false);

  // Tech Tasks & HUD State
  const [playerTasks, setPlayerTasks] = useState([]);
  const [taskProgress, setTaskProgress] = useState({ completed: 0, total: 0, percentage: 0 });
  const [activeTask, setActiveTask] = useState(null);
  const [showMiniMap, setShowMiniMap] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [killCooldown, setKillCooldown] = useState(0);
  const [hudState, setHudState] = useState({
    playerPos: { x: 560, y: 150 },
    canUse: false,
    nearMeeting: false,
    nearTask: null,
    canReport: false,
    canKill: false,
    killTarget: null
  });

  useEffect(() => {
    socketService.connect();
    const sockett = socketService.getSocket();
    if (!sockett) {
      console.warn('Socket unavailable after connect()');
      return;
    }
    setSocket(sockett);

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    const handleStartGame = (data) => {
      console.log('Game started event received in App:', data, roomIdRef.current);
      if (data.roomId === roomIdRef.current) {
        data.playerId = playerIdRef.current;
        EventBus.emit('start-game', data);
        setCurrentPage(PAGES.GAME);
        data.isImposter.then((val) => {
          LocalImposterRef.current = val;
          setIsLocalPlayerImposter(val);
          setRoleIndicator(true);

          // If imposter, start with 10s cooldown
          if (val) {
            setKillCooldown(10);
          }
        });

        // Fetch tasks assigned to this player
        const pId = playerIdRef.current;
        const rId = data.roomId;
        fetch(apiUrl(`/tasks/${rId}/${pId}`))
          .then(res => res.json())
          .then(tasks => {
            console.log('Fetched player tasks:', tasks);
            if (Array.isArray(tasks) && tasks.length > 0) {
              setPlayerTasks(tasks);
              EventBus.emit('set-player-tasks', tasks);
            }
          })
          .catch(err => console.error('Error fetching player tasks:', err));

        // Fetch room progress
        fetch(apiUrl(`/tasks/${rId}`))
          .then(res => res.json())
          .then(prog => {
            if (prog) setTaskProgress(prog);
          })
          .catch(err => console.error('Error fetching task progress:', err));
      }
    };

    // Meeting Event from Phaser
    const handleMeetingStarted = (data) => {
      console.log('Meeting started in App:', data);
      sound.playEmergency();
      setMeetingData(data);
      setMeetingActive(true);
      setTimeRemaining(60000);
      setActiveTask(null); // Close task modal if open
    };

    const handleMeetingEnded = (data) => {
      console.log('Meeting ended in App:', data);
      setMeetingActive(false);
      setMeetingData(null);
    };

    const handleGameEnd = (data) => {
      console.log('Game end event received in App:', data);
      setGameResult(data);
      setCurrentPage(PAGES.GAMEEND);
      setActiveTask(null);
      setShowMiniMap(false);
    };

    const handleVote = (data) => {
      console.log('Vote event received in App:', data);
      setMeetingData(prev => prev ? ({
        ...prev,
        players: {
          ...prev.players,
          [data.callerId]: { ...prev.players[data.callerId], voted: true }
        }
      }) : prev);
    };

    const handleNotif = (data) => {
      if (window.showToast) {
        window.showToast(data.message, 'info', 3000);
      }
    };

    const handleTaskProgress = (progress) => {
      console.log('Task progress update received:', progress);
      if (progress) {
        setTaskProgress(progress);
      }
    };

    const handleOpenTaskModal = (task) => {
      console.log('Opening task modal for:', task);
      sound.playClick();
      setActiveTask(task);
    };

    const handleHudUpdate = (state) => {
      setHudState(state);
    };

    const handleKillExecuted = () => {
      sound.playSuccess();
      setKillCooldown(25); // 25 second kill cooldown
    };

    sockett.on('connect', handleConnect);
    sockett.on('disconnect', handleDisconnect);
    sockett.on('game:started', handleStartGame);
    sockett.on('meeting:voted', handleVote);
    sockett.on('game:notif', handleNotif);
    sockett.on('task:progress', handleTaskProgress);

    EventBus.on('meeting:started', handleMeetingStarted);
    EventBus.on('meeting:ended', handleMeetingEnded);
    EventBus.on('game:ended', handleGameEnd);
    EventBus.on('open-task-modal', handleOpenTaskModal);
    EventBus.on('hud-update', handleHudUpdate);
    EventBus.on('kill-executed', handleKillExecuted);

    return () => {
      sockett.off('connect', handleConnect);
      sockett.off('disconnect', handleDisconnect);
      sockett.off('game:started', handleStartGame);
      sockett.off('meeting:voted', handleVote);
      sockett.off('game:notif', handleNotif);
      sockett.off('task:progress', handleTaskProgress);

      EventBus.off('meeting:started', handleMeetingStarted);
      EventBus.off('meeting:ended', handleMeetingEnded);
      EventBus.off('game:ended', handleGameEnd);
      EventBus.off('open-task-modal', handleOpenTaskModal);
      EventBus.off('hud-update', handleHudUpdate);
      EventBus.off('kill-executed', handleKillExecuted);

      socketService.disconnect();
    };
  }, []);

  // Kill Cooldown Timer
  useEffect(() => {
    if (killCooldown <= 0) return;
    const interval = setInterval(() => {
      setKillCooldown(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [killCooldown]);

  const handleJoinRoom = (data) => {
    const joinedRoomId = data.roomId;
    playerIdRef.current = data.playerId;
    playerNameRef.current = localStorage.getItem('playerName') || 'Player';

    console.log('Joining room with ID:', joinedRoomId);
    setRoomId(joinedRoomId);
    roomIdRef.current = joinedRoomId;
    setCurrentPage(PAGES.WAITING);
    setIsLocalPlayerHost(data.isHost);
  };

  const handleStartGameBtn = () => {
    if (socket && roomId) {
      socket.emit('game:start', { roomId });
    }
  };

  const handleBackToMenu = () => {
    const playerId = sessionStorage.getItem('playerId');
    if (socket && playerId) socket.emit('room:leave', { playerId });
    setRoomId(null);
    setCurrentPage(PAGES.MENU);
    window.location.reload();
  };

  // Timer countdown for meeting
  useEffect(() => {
    if (!meetingActive) return;

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1000) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [meetingActive]);

  const handleVoteCallBack = (data) => {
    data.roomId = roomId;
    if (socket) socket.emit('meeting:vote', data);
  };

  const handleEndMeeting = () => {
    if (!socket || !roomId) return;
    console.log('Ending meeting');
    socket.emit('meeting:end', { roomId });
  };

  const handleTaskCompleted = (taskId) => {
    console.log('Task completed:', taskId);
    // Mark local task completed
    const updatedTasks = playerTasks.map(t =>
      t.id === taskId ? { ...t, completed: true } : t
    );
    setPlayerTasks(updatedTasks);
    EventBus.emit('set-player-tasks', updatedTasks);

    // Notify server with +15 pts
    if (socket && roomId) {
      socket.emit('task:complete', {
        roomId,
        playerId: playerIdRef.current,
        taskId,
        playerName: playerNameRef.current
      });
    }

    setActiveTask(null);
  };

  return (
    <div id="app">
      <ToastContainer />
      {error && <p className={styles.error}>{error}</p>}
      {debug.current && (
        <div className={`${styles.statusBadge} ${isConnected ? styles.connected : styles.disconnected}`}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </div>
      )}

      {roleIndicator && (
        <RoleIndicator
          role={{ imposter: LocalImposterRef.current }}
          onAnimationEnd={() => setRoleIndicator(false)}
        />
      )}

      {currentPage === PAGES.MENU && (
        <Menu
          onJoinGame={handleJoinRoom}
          onOpenLeaderboard={() => setShowLeaderboard(true)}
        />
      )}

      {currentPage === PAGES.GAMEEND && (
        <EndGame
          result={gameResult}
          onBackToMenu={handleBackToMenu}
          isLocalPlayerImposter={isLocalPlayerImposter}
        />
      )}

      {(currentPage === PAGES.GAME || currentPage === PAGES.WAITING) && (
        <div className={styles.gameContainer}>
          <PhaserGame />

          {/* Segmented Task Bar & Tasks Checklist (Top-Left) */}
          {currentPage === PAGES.GAME && (
            <>
              <TaskBar
                completed={taskProgress.completed}
                total={taskProgress.total}
                percentage={taskProgress.percentage}
              />
              <TaskChecklist tasks={playerTasks} />
            </>
          )}

          {/* Mobile Floating Joystick + Action Buttons */}
          {currentPage === PAGES.GAME && !meetingActive && (
            <MobileHUD
              isImposter={isLocalPlayerImposter}
              canUse={hudState.canUse}
              canReport={hudState.canReport}
              canKill={hudState.canKill}
              killCooldown={killCooldown}
              onUse={() => EventBus.emit('action:use')}
              onReport={() => EventBus.emit('action:report')}
              onKill={() => EventBus.emit('action:kill')}
              onToggleMap={() => setShowMiniMap(prev => !prev)}
              onOpenLeaderboard={() => setShowLeaderboard(true)}
            />
          )}

          {/* Start Game Button for Host in Dropship Lobby */}
          {currentPage === PAGES.WAITING && (
            isLocalPlayerHost
              ? <Button
                  onClick={handleStartGameBtn}
                  children="Start Game"
                  className={styles.startBtn}
                />
              : <Button
                  children="Waiting for Host to Start"
                  className={styles.startBtn}
                />
          )}

          <button className={styles.backButton} onClick={handleBackToMenu}>Leave</button>
          <div className={styles.roomTag}>Room: {roomId}</div>

          {/* Meeting Tablet */}
          {meetingActive && meetingData && (
            <Meeting
              players={meetingData.players}
              currentPlayerId={playerIdRef.current}
              onVote={handleVoteCallBack}
              onEndMeeting={handleEndMeeting}
              timeRemaining={timeRemaining}
            />
          )}

          {/* Tech Task Modal */}
          {activeTask && (
            <TaskModal
              task={activeTask}
              onComplete={handleTaskCompleted}
              onClose={() => setActiveTask(null)}
            />
          )}

          {/* Skeld Mini-Map */}
          {showMiniMap && (
            <MiniMap
              playerPos={hudState.playerPos}
              tasks={playerTasks}
              onClose={() => setShowMiniMap(false)}
            />
          )}
        </div>
      )}

      {/* Global Leaderboard Modal */}
      {showLeaderboard && (
        <LeaderboardModal onClose={() => setShowLeaderboard(false)} />
      )}
    </div>
  );
}

export default App;
