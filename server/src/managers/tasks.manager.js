import { TASK_STATIONS, TECH_TASKS_BANK } from '../constants.js';
import { leaderboard } from '../leaderboard.js';

class TasksManager {
  constructor() {
    this.roomTasks = {}; // roomId -> { [playerId]: [ { id, stationId, room, stationName, x, y, completed, puzzle } ] }
  }

  assignTasksForRoom(roomId, players, imposterId) {
    this.roomTasks[roomId] = {};

    const playerList = Object.values(players || {});
    // If only 1 player or testing, ensure they have tasks to test
    const targetPlayers = playerList.length <= 1
      ? playerList
      : playerList.filter(p => p.id !== imposterId);

    // Also support fallback if no crewmate found
    const playersToAssign = targetPlayers.length > 0 ? targetPlayers : playerList;

    for (const player of playersToAssign) {
      // Pick 7 distinct tasks from the bank (each from different stations/rooms when possible)
      const shuffledPuzzles = [...TECH_TASKS_BANK].sort(() => 0.5 - Math.random());
      
      // Ensure diverse rooms
      const usedRooms = new Set();
      const selectedTasks = [];

      for (const puzzle of shuffledPuzzles) {
        if (!usedRooms.has(puzzle.room)) {
          usedRooms.add(puzzle.room);
          selectedTasks.push(puzzle);
        }
        if (selectedTasks.length >= 7) break;
      }

      // If less than 7 due to room filter, top up with remaining
      if (selectedTasks.length < 7) {
        for (const puzzle of shuffledPuzzles) {
          if (!selectedTasks.includes(puzzle)) {
            selectedTasks.push(puzzle);
          }
          if (selectedTasks.length >= 7) break;
        }
      }

      const tasks = selectedTasks.map((puzzle, index) => {
        const station = TASK_STATIONS.find(s => s.id === puzzle.stationId) || {
          id: puzzle.stationId,
          name: puzzle.stationName,
          room: puzzle.room,
          x: 560,
          y: 150
        };

        return {
          id: `${player.id}_task_${index + 1}`,
          stationId: station.id,
          room: puzzle.room || station.room,
          stationName: puzzle.stationName || station.name,
          x: station.x,
          y: station.y,
          completed: false,
          puzzle: puzzle
        };
      });

      this.roomTasks[roomId][player.id] = tasks;
    }

    return this.getRoomProgress(roomId);
  }

  getPlayerTasks(roomId, playerId) {
    if (!this.roomTasks[roomId]) {
      this.roomTasks[roomId] = {};
    }
    if (!this.roomTasks[roomId][playerId] || this.roomTasks[roomId][playerId].length === 0) {
      // Auto-assign 7 tasks on demand so the player always has tasks!
      this.assignTasksForRoom(roomId, { [playerId]: { id: playerId } }, null);
    }
    return this.roomTasks[roomId][playerId] || [];
  }

  getRoomProgress(roomId) {
    if (!this.roomTasks[roomId]) {
      return { completed: 0, total: 0, percentage: 0, allDone: false };
    }

    let total = 0;
    let completed = 0;

    for (const tasks of Object.values(this.roomTasks[roomId])) {
      for (const t of tasks) {
        total++;
        if (t.completed) completed++;
      }
    }

    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    const allDone = total > 0 && completed >= total;

    return { completed, total, percentage, allDone };
  }

  completeTask(roomId, playerId, taskId, playerName) {
    const playerTasks = this.getPlayerTasks(roomId, playerId);
    const task = playerTasks.find(t => t.id === taskId || t.stationId === taskId);

    if (task && !task.completed) {
      task.completed = true;

      // Award +15 pts
      if (playerName) {
        leaderboard.addPoints(playerName, 15, 'tasksCompleted');
      }

      const progress = this.getRoomProgress(roomId);
      return { success: true, task, progress };
    }

    return { success: false, progress: this.getRoomProgress(roomId) };
  }

  cleanRoom(roomId) {
    delete this.roomTasks[roomId];
  }
}

export const tasksManager = new TasksManager();
export default tasksManager;
