import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LEADERBOARD_FILE = path.join(__dirname, '..', 'leaderboard.json');

class LeaderboardManager {
  constructor() {
    this.scores = {};
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(LEADERBOARD_FILE)) {
        const raw = fs.readFileSync(LEADERBOARD_FILE, 'utf-8');
        this.scores = JSON.parse(raw);
      } else {
        this.scores = {};
        this.save();
      }
    } catch (err) {
      console.error('Error reading leaderboard.json, initializing empty:', err.message);
      this.scores = {};
    }
  }

  save() {
    try {
      fs.writeFileSync(LEADERBOARD_FILE, JSON.stringify(this.scores, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving leaderboard.json:', err.message);
    }
  }

  getPlayer(name) {
    const key = (name || 'Anonymous').trim();
    if (!this.scores[key]) {
      this.scores[key] = {
        name: key,
        totalScore: 0,
        gamesPlayed: 0,
        crewmateWins: 0,
        impostorWins: 0,
        kills: 0,
        tasksCompleted: 0,
        votesCorrect: 0,
        lastActive: Date.now()
      };
    }
    return this.scores[key];
  }

  addPoints(name, points, statCategory = null) {
    if (!name) return;
    const player = this.getPlayer(name);
    player.totalScore = Math.max(0, (player.totalScore || 0) + points);
    player.lastActive = Date.now();

    if (statCategory && player[statCategory] !== undefined) {
      player[statCategory]++;
    }

    this.save();
    return player;
  }

  recordMatchEnd({ winner, winningPlayers = [], losingPlayers = [], impostors = [], ejectedImpostorVotes = {} }) {
    const all = [...winningPlayers, ...losingPlayers];
    for (const p of all) {
      if (p && p.name) {
        const rec = this.getPlayer(p.name);
        rec.gamesPlayed = (rec.gamesPlayed || 0) + 1;
      }
    }

    for (const p of winningPlayers) {
      if (p && p.name) {
        const rec = this.getPlayer(p.name);
        if (winner === 'CREWMATES') {
          rec.crewmateWins = (rec.crewmateWins || 0) + 1;
          rec.totalScore += 50; // Crewmate Win: +50 pts
        } else {
          rec.impostorWins = (rec.impostorWins || 0) + 1;
          rec.totalScore += 75; // Impostor Win: +75 pts
        }
      }
    }

    // Points for players who correctly voted an impostor (+30 pts)
    for (const [voterName, votedTargetId] of Object.entries(ejectedImpostorVotes || {})) {
      if (voterName) {
        const rec = this.getPlayer(voterName);
        rec.votesCorrect = (rec.votesCorrect || 0) + 1;
        rec.totalScore += 30;
      }
    }

    this.save();
  }

  getTopScores(limit = 25) {
    return Object.values(this.scores)
      .sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0))
      .slice(0, limit);
  }
}

export const leaderboard = new LeaderboardManager();
export default leaderboard;
