import {RoomsManager} from "../managers/rooms.manager.js";
import {PlayersManager} from "../managers/players.manager.js";
import {tasksManager} from "../managers/tasks.manager.js";
import {leaderboard} from "../leaderboard.js";

export const registerGameEvents = (io, socket) => {
    // ====== PLAYER EVENTS ======
    const playerMove = (data) => {
        RoomsManager.players.updateState(data.roomId, data.id, { x: data.x, y: data.y, d: data.d});
        PlayersManager.updatePlayerState(data.playerId, { x: data.x, y: data.y, d: data.d, moving: data.moving });
        io.to(data.roomId).emit("player:moved", data);
    };

    const playerAnim = (data) => {
        io.to(data.roomId).emit("player:animation", data);
    };

    const playerKill = (data) => {
        console.log("Player kill received:", data);
        const roomId = data.roomId;
        const room = RoomsManager.fetchRoom(roomId);
        if (room && room.players[data.playerId]) {
            room.players[data.playerId].isAlive = false;
        }

        // Impostor gets kill points (+25 pts)
        if (data.killerName) {
            leaderboard.addPoints(data.killerName, 25, 'kills');
        }

        io.to(data.roomId).emit("player:killed", data);
        const win = RoomsManager.checkWin(roomId);
        if (win !== null) {
            io.to(roomId).emit("game:ended", {roomId, isImposter: win});
            handleGameEndStats(roomId, win);
        }
    };

    // ===== TASK EVENTS =====
    const taskComplete = (data) => {
        console.log("Task complete received:", data);
        const { roomId, playerId, taskId, playerName } = data;
        const res = tasksManager.completeTask(roomId, playerId, taskId, playerName);
        if (res.success) {
            io.to(roomId).emit("task:progress", res.progress);
            if (res.progress.allDone) {
                // Crewmates win by completing all tech tasks!
                io.to(roomId).emit("game:ended", {
                    roomId,
                    isImposter: false,
                    winner: 'CREWMATES',
                    reason: 'tasks'
                });
                handleGameEndStats(roomId, false);
            }
        }
    };

    // ===== MEETING EVENTS ======
    const meetingStart = (data) => {
        console.log("Received meeting start");
        RoomsManager.meetings.create(data.roomId, data.callerId, meetingEnd);
        io.to(data.roomId).emit("meeting:started", data);
    };

    const meetingEnd = (data) => {
        console.log("Received meeting end", data);
        data.results = RoomsManager.meetings.end(data.roomId);
        io.to(data.roomId).emit("meeting:ended", data);

        // Check win condition after meeting
        const roomId = data.roomId;
        const win = RoomsManager.checkWin(roomId);
        console.log("Win condition check after meeting:", win);
        if (win !== null) {
            io.to(roomId).emit("game:ended", {roomId, isImposter: win});
            handleGameEndStats(roomId, win);
        }
    };

    const meetingVote = (data) => {
        console.log("Received meeting vote", data);
        const allVoted = RoomsManager.meetings.vote(data.roomId, data.callerId, data.votedForId);
        io.to(data.roomId).emit("meeting:voted", data);

        if (allVoted) {
            console.log('All players voted, ending meeting early');
            meetingEnd({roomId: data.roomId});
        }
    };

    function handleGameEndStats(roomId, isImposterWon) {
        const room = RoomsManager.fetchRoom(roomId);
        if (!room) return;
        const players = Object.values(room.players);
        const impostors = players.filter(p => p.id === room.imposter);
        const crewmates = players.filter(p => p.id !== room.imposter);

        const winner = isImposterWon ? 'IMPOSTOR' : 'CREWMATES';
        const winningPlayers = isImposterWon ? impostors : crewmates;
        const losingPlayers = isImposterWon ? crewmates : impostors;

        leaderboard.recordMatchEnd({
            winner,
            winningPlayers,
            losingPlayers,
            impostors
        });
    }

    socket.on("player:move", playerMove);
    socket.on("player:animation", playerAnim);
    socket.on("player:kill", playerKill);
    socket.on("task:complete", taskComplete);
    socket.on("meeting:start", meetingStart);
    socket.on("meeting:end", meetingEnd);
    socket.on("meeting:vote", meetingVote);
};
