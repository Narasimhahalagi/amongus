import { BaseGameScene } from './BaseGameScene.js';
import { GrayPipeline, VisionRadiusPipeline } from "../shaders/fragShader.js";
import { socketService } from '../../services/socket.js';
import { setPlayerColor } from "../utils/playerFactory.js";
import { EventBus } from "../EventBus.js";
import { handleImposter, handleImposterMovement } from "../utils/imposter.js";
import { setupVisionSystem, disableVisionSystem, updateVisionSystem, enableVisionSystem } from "../utils/vision.js";
import { apiUrl } from '../../utils/urls.js';

export class Game extends BaseGameScene {
    constructor() {
        super('Game');
    }

    init(data) {
        console.log('Game scene init with data:', data);
        this.imposterProm = data.isImposter;
    }

    getMapConfig() {
        return {
            mapKey: 'gameMapJSON',
            mapJSON: 'map.json',
            tilesetName: 'red',
            tilesetKey: 'red',
            backgroundKey: 'skled',
            backgroundImage: 'skled.png'
        };
    }

    setupMeetingZone() {
        this.meetingZone = this.physics.add.sprite(530, 100);
        if (this.meetingZone.body) {
            this.meetingZone.body.setCircle(50);
            this.meetingZone.body.setAllowGravity(false);
            this.meetingZone.visible = false;
        }
        this.meetingBtn = this.add.image(220, 410, 'meeting')
            .setScale(0.7)
            .setDepth(1000)
            .setScrollFactor(0)
            .setInteractive()
            .on('pointerdown', () => {
                this.startMeeting();
            });
        this.ui.add(this.meetingBtn);
    }

    preload() {
        this.preloadCommon();
        this.preloadMap();
        this.load.image('kill', 'assets/icons/kill_icon.png');
        this.load.atlas('death', 'assets/death/texture.png', 'assets/death/texture.json');
        this.load.image('deadBody', 'assets/sprites/Base/Dead0042.png');
        this.load.image('meeting', '/assets/icons/useIcon.png');
    }

    create() {
        const prom1 = this.createCommon();
        this.socket = socketService.getSocket();

        this.game.renderer.pipelines.add('GrayScale', new GrayPipeline(this.game));
        this.game.renderer.pipelines.add('VisionRadius', new VisionRadiusPipeline(this.game));

        this.closest = { player: null, distance: 60 };
        this.VISION_RADIUS = 100;
        this.visionEnabled = true;
        this.mapObjects = [];
        this.deadBodies = [];
        this.playerTasks = [];

        this.taskGraphics = this.add.graphics().setDepth(5);

        this.createAnimations();
        this.handleGameEvents();
        this.setupActionListeners();

        Promise.all([prom1, this.imposterProm]).then((results) => {
            console.log("Creating imposter elements", prom1, this.imposterProm, results);
            this.imposter = results[1];
            handleImposter(this);
            setupVisionSystem(this);
            this.setupMeetingZone();
            this.isInMeetingZone = false;

            if (this.room && this.playerObj) {
                fetch(apiUrl(`/tasks/${this.room.id}/${this.playerObj.id}`))
                    .then(res => res.json())
                    .then(tasks => {
                        console.log("Game.js fetched player tasks:", tasks);
                        if (Array.isArray(tasks) && tasks.length > 0) {
                            this.playerTasks = tasks;
                            EventBus.emit('set-player-tasks', tasks);
                        }
                    })
                    .catch(err => console.error("Error fetching tasks in Game.js:", err));
            }
        });
    }

    setupActionListeners() {
        this._onActionUse = () => {
            if (this.currentNearMeeting) {
                this.startMeeting();
            } else if (this.currentNearTask) {
                EventBus.emit('open-task-modal', this.currentNearTask);
            }
        };

        this._onActionReport = () => {
            if (this.currentNearDeadBody) {
                this.startMeeting();
            }
        };

        this._onActionKill = () => {
            if (this.imposter && this.closest && this.closest.player) {
                const victim = this.closest.player;
                const payload = {
                    playerId: victim.id,
                    killerId: this.playerObj?.id,
                    killerName: this.playerObj?.name || 'Imposter',
                    roomId: this.room.id,
                    x: victim.x,
                    y: victim.y,
                    color: this.playerObj?.color
                };
                this.socket.emit('player:kill', payload);
                this.player.x = victim.x;
                this.player.y = victim.y;
                this.closest = { player: null, distance: 60 };
                EventBus.emit('kill-executed');
            }
        };

        this._onSetPlayerTasks = (tasks) => {
            this.playerTasks = tasks || [];
        };

        EventBus.on('action:use', this._onActionUse);
        EventBus.on('action:report', this._onActionReport);
        EventBus.on('action:kill', this._onActionKill);
        EventBus.on('set-player-tasks', this._onSetPlayerTasks);
    }

    update(time, delta) {
        if (!this.player) return;

        this.handleMovement();
        handleImposterMovement(this);

        if (this.visionEnabled && this.player) {
            updateVisionSystem(this);
        }

        // Distance to Meeting Table (530, 100)
        const distMeeting = Phaser.Math.Distance.Between(this.player.x, this.player.y, 530, 100);
        this.currentNearMeeting = distMeeting < 55;

        // Distance to assigned Tasks
        let nearTask = null;
        if (this.playerTasks && this.playerTasks.length > 0) {
            for (const t of this.playerTasks) {
                if (!t.completed) {
                    const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, t.x, t.y);
                    if (dist < 45) {
                        nearTask = t;
                        break;
                    }
                }
            }
        }
        this.currentNearTask = nearTask;

        // Distance to Dead Bodies
        let nearBody = null;
        if (this.deadBodies && this.deadBodies.length > 0) {
            for (const b of this.deadBodies) {
                const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, b.x, b.y);
                if (dist < 55) {
                    nearBody = b;
                    break;
                }
            }
        }
        this.currentNearDeadBody = nearBody;

        // Emit HUD State to React
        EventBus.emit('hud-update', {
            playerPos: { x: this.player.x, y: this.player.y },
            canUse: this.currentNearMeeting || !!this.currentNearTask,
            nearMeeting: this.currentNearMeeting,
            nearTask: this.currentNearTask,
            canReport: !!this.currentNearDeadBody,
            canKill: !!(this.closest && this.closest.player),
            killTarget: this.closest?.player
        });

        // Meeting button in Phaser UI
        if (this.physics.overlap(this.player, this.meetingZone)) {
            if (!this.isInMeetingZone) {
                this.isInMeetingZone = true;
                if (this.meetingBtn) this.meetingBtn.visible = true;
            }
        } else if (this.isInMeetingZone) {
            this.isInMeetingZone = false;
            if (this.meetingBtn) this.meetingBtn.visible = false;
        }

        // Render Task Glow Markers on Floor
        if (this.taskGraphics) {
            this.taskGraphics.clear();
            if (this.playerTasks && this.playerTasks.length > 0) {
                const t = time * 0.005;
                const pulse = 14 + Math.sin(t) * 4;
                for (const task of this.playerTasks) {
                    if (!task.completed) {
                        const isNear = this.currentNearTask === task;
                        // Outer glowing pulse ring
                        this.taskGraphics.lineStyle(isNear ? 3 : 2, isNear ? 0x38fedc : 0xf5f557, isNear ? 1.0 : 0.85);
                        this.taskGraphics.strokeCircle(task.x, task.y, isNear ? pulse + 4 : pulse);

                        // Pedestal box
                        this.taskGraphics.fillStyle(isNear ? 0x38fedc : 0xf5f557, isNear ? 0.6 : 0.35);
                        this.taskGraphics.fillRect(task.x - 7, task.y - 7, 14, 14);

                        // Center core
                        this.taskGraphics.fillStyle(0xffffff, 0.9);
                        this.taskGraphics.fillCircle(task.x, task.y, 3);
                    }
                }
            }
        }
    }

    shutdown() {
        if (this._onActionUse) EventBus.off('action:use', this._onActionUse);
        if (this._onActionReport) EventBus.off('action:report', this._onActionReport);
        if (this._onActionKill) EventBus.off('action:kill', this._onActionKill);
        if (this._onSetPlayerTasks) EventBus.off('set-player-tasks', this._onSetPlayerTasks);

        if (this.socket) {
            if (this.onPlayerKilled) {
                this.socket.off('player:killed', this.onPlayerKilled);
                this.onPlayerKilled = null;
            }
            if (this.onMeetingStarted) {
                this.socket.off('meeting:started', this.onMeetingStarted);
                this.onMeetingStarted = null;
            }
            if (this.onMeetingEnded) {
                this.socket.off('meeting:ended', this.onMeetingEnded);
                this.onMeetingEnded = null;
            }
            if (this.onGameEnd) {
                this.socket.off('game:ended', this.onGameEnd);
                this.onGameEnd = null;
            }
        }
        super.shutdown();
    }

    createAnimations() {
        this.anims.create({
            key: 'deathAnim',
            frames: this.anims.generateFrameNames('death', {
                prefix: 'Dead',
                start: 0,
                end: 42,
                zeroPad: 4
            }),
            frameRate: 20,
            repeat: 0
        });
    }

    handleGameEvents() {
        if (!this.socket) return;

        this.onPlayerKilled = (data) => {
            console.log("Player killed event received:", data);
            const targetId = String(data.playerId);
            const localId = this.playerObj?.id ?? this.player?.id;

            const killedPlayer = (targetId === String(localId)) ? this.player : this.players[targetId];

            const killerId = data.killerId ? String(data.killerId) : null;
            if (killerId) {
                const killerSprite = (killerId === String(localId)) ? this.player : this.players[killerId];
                if (killerSprite && killerSprite !== killedPlayer) {
                    killerSprite.x = data.x;
                    killerSprite.y = data.y;
                }
            }

            if (killedPlayer) {
                killedPlayer.alive = false;
                if (killedPlayer.destroy) killedPlayer.destroy();
            }

            // Track dead body location for reporting
            this.deadBodies.push({ x: data.x, y: data.y, id: targetId });

            const deathAnim = this.add.sprite(data.x, data.y, 'death', 'Dead0001.png')
                .setScale(0.125)
                .setDepth(600);
            setPlayerColor(this, deathAnim, data.color);
            deathAnim.anims.play('deathAnim');
            deathAnim.on('animationcomplete', () => {
                this.add.sprite(deathAnim.x, deathAnim.y, 'deadBody')
                    .setScale(0.125)
                    .setDepth(500);
                deathAnim.destroy();
            });
        };

        this.onMeetingStarted = (data) => {
            console.log("Meeting started event received:", data);
            this.meetingActive = true;
            this.physics.pause();
            disableVisionSystem(this);
            EventBus.emit('meeting:started', {
                roomId: this.room.id,
                callerId: data.callerId,
                players: this.room.players
            });
        };

        this.onMeetingEnded = (data) => {
            console.log("Meeting ended event received:", data);
            this.meetingActive = false;
            this.physics.resume();
            enableVisionSystem(this);
            this.teleportPlayersToSpawn();
            // Clear dead bodies after meeting
            this.deadBodies = [];
            EventBus.emit('meeting:ended', {
                results: data.results
            });
        };

        this.onGameEnd = (data) => {
            console.log("game end event received:", data);
            EventBus.emit("game:ended", data);
            if (this.scene && typeof this.scene.isActive === 'function' && this.scene.isActive('Game')) {
                this.scene.stop('Game');
            }
        };

        this.socket.on('player:killed', this.onPlayerKilled);
        this.socket.on('meeting:started', this.onMeetingStarted);
        this.socket.on('meeting:ended', this.onMeetingEnded);
        this.socket.on('game:ended', this.onGameEnd);
    }

    startMeeting() {
        if (!this.socket || !this.playerObj || !this.room) return;
        console.log('Starting meeting...');
        this.socket.emit('meeting:start', {
            roomId: this.room.id,
            callerId: this.playerObj.id
        });
    }

    teleportPlayersToSpawn() {
        if (this.player && this.spawnPositions[this.playerObj.id]) {
            const spawn = this.spawnPositions[this.playerObj.id];
            this.player.x = spawn.x;
            this.player.y = spawn.y;
        }

        Object.keys(this.players).forEach(playerId => {
            const player = this.players[playerId];
            if (player && this.spawnPositions[playerId] && player !== this.player) {
                const spawn = this.spawnPositions[playerId];
                player.x = spawn.x;
                player.y = spawn.y;
            }
        });
    }
}
export default Game;
