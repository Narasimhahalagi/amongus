import { Server } from "socket.io";
import express from "express";
import http from "http";
import cors from "cors";
import apiRouter from "./routes/api.js";
import { registerRoomEvents } from "./events/roomEvents.js";
import { registerGameEvents } from "./events/gameEvents.js";
import 'dotenv/config';

const PORT = process.env.PORT || 3000;

const app = express();

const corsOptions = {
    origin: (origin, callback) => {
        // Reflect origin to avoid wildcard + credentials issue in browsers
        callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
};

app.use(cors(corsOptions));
app.use(express.json());
app.use('/', apiRouter);

// HTTP server
const server = http.createServer(app);

// Socket.IO server
const io = new Server(server, {
    cors: {
        origin: (origin, callback) => callback(null, true),
        methods: ["GET", "POST"],
        credentials: true
    }
});

io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);
    registerRoomEvents(io, socket);
    registerGameEvents(io, socket);
});

server.listen(PORT, () => {
    console.log(`Tech Among Us Server running on port ${PORT}`);
});
