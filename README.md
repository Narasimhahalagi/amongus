# 🚀 Tech Among Us - Phaser 3 & The Skeld Edition

A production-grade, real-time multiplayer web game modeled directly after the mobile game **Among Us**, built with **Phaser 3**, **React 19**, **Vite**, **Tailwind CSS**, and **Node.js + Socket.io**, customized for college technical events, coding clubs, and hackathons.

---

## 🛠️ Technology Stack & Architecture

- **/client**: React 19 + Phaser 3 + Vite + Tailwind CSS.
  - **Authentic Assets & Map**: Official The Skeld layout (`skled.png`) with genuine Tiled physics collision layer (`map.json`) preventing players from ever walking through walls or into outer space.
  - **Camera & Perspective**: Camera locked and centered smoothly on the local player with 3x zoom and dynamic vision system.
  - **Dropship Lobby**: Playable pre-game Dropship interior (`Lobby.png`, `lobby.json`) with interactive color picker.
  - **Mobile Touch + Desktop Controls**: Floating virtual thumb joystick on bottom-left, responsive circular action buttons (`USE`, `REPORT`, `KILL`) on bottom-right, plus WASD / Arrow keys and keyboard shortcuts (`E`: Use, `R`: Report, `Q`: Kill, `M`: Map).
  - **Tech Coding Mini-Games**: Interactive modal for task terminals featuring 20+ puzzles across "Debug the Code", "Predict the Output", and "Tech Aptitude & Logic".
  - **Audio**: 100% self-contained Web Audio API synthesizer (clean dual-sine chimes, alarms, buzzers with zero external MP3 dependencies).
- **/server**: Node.js + Express + Socket.io.
  - Authoritative room management, live player movement synchronization, role assignment, voting and emergency meetings.
  - **Task Manager**: Assigns 4 random coding puzzles from the tech bank to each player across the 14 spaceship rooms, tracks task completion, broadcasts global progress, and awards points.
  - **Persistent Leaderboard**: Stores player statistics, match history, and scores in `server/leaderboard.json`.

---

## 🎮 How to Play

### Controls:
- **Desktop**:
  - `W`, `A`, `S`, `D` or `Arrow Keys`: Move player
  - `E` or `Space`: `USE` (lights up yellow when near a task terminal or Cafeteria emergency button)
  - `R`: `REPORT` (lights up red when near a dead body)
  - `Q`: `KILL` (for Impostor, with 25s cooldown timer)
  - `M`: `MAP` (toggles The Skeld mini-map overview)
- **Mobile**:
  - **Bottom-Left**: Floating virtual thumb joystick for smooth 360-degree walking.
  - **Bottom-Right**: Action buttons (`USE`, `REPORT`, `KILL`) that glow and activate only when in range.
  - **Top-Right**: `MAP [M]` and `SCORES` buttons.

### Tech Tasks & Scoring:
- **Debug the Code**: Inspect 4 lines of C++, Java, Python, or JS code and click the line with the syntax/logic bug.
- **Predict the Output**: Read code snippets featuring recursion, closures, bitwise logic, or type coercion and choose the correct MCQ option.
- **Tech Aptitude**: Binary/Hexadecimal math, logic gates, algorithm Big-O complexities, and data structures.
- **Points**:
  - Complete Task: **+15 pts**
  - Crewmate Win: **+50 pts**
  - Impostor Kill: **+25 pts**
  - Impostor Win: **+75 pts**
  - Correct Impostor Vote: **+30 pts**

---

## 🏃‍♂️ Manual Startup Instructions

> **Note**: As requested, background servers are not run automatically. Run these commands manually in two terminals:

### 1. Start Backend Server (Terminal 1)
```bash
cd D:\Amongus\server
npm run dev
# Or from root:
# npm run server
```
Server will start on `http://localhost:3000`.

### 2. Start Frontend Client (Terminal 2)
```bash
cd D:\Amongus\client
npm run dev
# Or from root:
# npm run client
```
Client will start on `http://localhost:8080`.

### 3. Open in Browser
- **Desktop**: Open [http://localhost:8080](http://localhost:8080)
- **Mobile / Local Network**: Open `http://<YOUR_LOCAL_IP>:8080` (e.g., `http://192.168.1.X:8080`)
- **Leaderboard API**: [http://localhost:3000/leaderboard](http://localhost:3000/leaderboard)
