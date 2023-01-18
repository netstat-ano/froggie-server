import { Server } from "http";
import * as socketio from "socket.io";
let io: any;

const init = (server: Server) => {
    io = require("socket.io")(server, {
        cors: {
            origin: "http://localhost:3000",
            methods: ["GET", "POST"],
        },
    });
    return io;
};
const getIo = () => {
    if (io) {
        return io;
    }
    return false;
};
const socket = { getIo, init };
export default socket;
