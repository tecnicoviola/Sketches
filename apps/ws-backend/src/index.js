"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const ws_1 = require("ws");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const backend_common_1 = require("@repo/backend-common");
const http_1 = __importDefault(require("http"));
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const wss = new ws_1.WebSocketServer({ server });
app.get("/", (_, res) => {
    res.send("WebSocket server is live");
});
const PORT = parseInt(process.env.PORT || "8080");
// ---------------- IN-MEMORY STORAGE ----------------
const users = [];
const messages = [];
// ---------------- AUTH CHECK ----------------
function checkUser(token) {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, backend_common_1.JWT_SECRET);
        if (!decoded || !decoded.userId)
            return null;
        return decoded.userId;
    }
    catch {
        return null;
    }
}
// ---------------- WEBSOCKET CONNECTION ----------------
wss.on("connection", (ws, request) => {
    console.log("WS connected:", request.url);
    ws.on("error", (err) => {
        console.error("WS Error:", err);
    });
    const fullUrl = new URL(request.url || "", `http://${request.headers.host}`);
    const token = fullUrl.searchParams.get("token") || "";
    const userId = checkUser(token);
    if (!userId) {
        ws.close(1008, "Invalid Token");
        return;
    }
    users.push({
        userId,
        rooms: [],
        ws
    });
    // ---------------- MESSAGE HANDLER ----------------
    ws.on("message", (data) => {
        let parseData;
        try {
            parseData = JSON.parse(data.toString());
        }
        catch {
            console.log("Invalid JSON");
            return;
        }
        // -------- JOIN ROOM --------
        if (parseData.type === "join_room") {
            const user = users.find((u) => u.ws === ws);
            user?.rooms.push(parseData.roomId); // push inside the rooms the roomid of the person who wants to join tth specific room
        }
        // -------- LEAVE ROOM --------
        if (parseData.type === "leave_room") {
            const user = users.find((u) => u.ws === ws);
            if (!user)
                return;
            user.rooms = user.rooms.filter((r) => r !== parseData.roomId);
        }
        // -------- CHAT --------
        if (parseData.type === "chat") {
            const roomId = parseData.roomId;
            const message = parseData.message;
            const newMessage = {
                id: Date.now(),
                roomId,
                message,
                userId
            };
            messages.push(newMessage);
            users.forEach((user) => {
                if (user.rooms.includes(roomId)) {
                    user.ws.send(JSON.stringify({
                        type: "chat",
                        message,
                        roomId,
                        id: newMessage.id
                    }));
                }
            });
        }
        // -------- UPDATE --------
        if (parseData.type === "update") {
            const message = parseData.message;
            const roomId = parseData.roomId;
            const msg = messages.find((m) => m.id === message.DBid);
            if (msg) {
                msg.message = message;
            }
            users.forEach((user) => {
                if (user.rooms.includes(roomId)) {
                    user.ws.send(JSON.stringify({
                        type: "update",
                        message,
                        roomId
                    }));
                }
            });
        }
        // -------- DELETE --------
        if (parseData.type === "delete") {
            const message = parseData.message;
            const roomId = parseData.roomId;
            const index = messages.findIndex((m) => m.id === message.DBid);
            if (index !== -1) {
                messages.splice(index, 1);
            }
            users.forEach((user) => {
                if (user.rooms.includes(roomId)) {
                    user.ws.send(JSON.stringify({
                        type: "delete",
                        message,
                        roomId
                    }));
                }
            });
        }
        // -------- DELETE MANY --------
        if (parseData.type === "deleteMany") {
            const messageList = parseData.message;
            const roomId = parseData.roomId;
            const ids = messageList.map((m) => m.DBid);
            for (const id of ids) {
                const index = messages.findIndex((m) => m.id === id);
                if (index !== -1) {
                    messages.splice(index, 1);
                }
            }
            users.forEach((user) => {
                if (user.rooms.includes(roomId)) {
                    user.ws.send(JSON.stringify({
                        type: "deleteMany",
                        message: messageList,
                        roomId
                    }));
                }
            });
        }
        // -------- LIVE DRAW --------
        if (parseData.type === "liveDraw") {
            const message = parseData.message;
            const roomId = parseData.roomId;
            users.forEach((user) => {
                if (user.rooms.includes(roomId)) {
                    user.ws.send(JSON.stringify({
                        type: "liveDraw",
                        message,
                        roomId
                    }));
                }
            });
        }
        // -------- CLEAR --------
        if (parseData.type === "clear") {
            const roomId = parseData.roomId;
            for (let i = messages.length - 1; i >= 0; i--) {
                const msg = messages[i];
                if (msg && msg.roomId === roomId) {
                    messages.splice(i, 1);
                }
            }
            users.forEach((user) => {
                if (user.rooms.includes(roomId)) {
                    user.ws.send(JSON.stringify({
                        type: "clear",
                        roomId
                    }));
                }
            });
        }
    });
});
// ---------------- START SERVER ----------------
server.listen(PORT, "0.0.0.0", () => {
    console.log(`WebSocket server listening on port ${PORT}`);
});
