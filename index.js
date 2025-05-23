const express = require("express");
const { initializeListener, startClient, parseEvent } = require("./discord_listener");
const {
  startServerManager,
  startServer,
  stopServer,
} = require("./mcserver_manager");
const { initializeCommands } = require("./command_manager");
const socketIO = require("socket.io");
const { mc_server_port, server_name, port } = require("./config.json")
const http = require("http");
const app = express();
const PORT = port;
let SERVER_IP = "";

// server
const server = http.createServer(app);
const io = socketIO(server);
// mcserver states
const MC_SERVER_INFO = {
  status: "off",
  ip: SERVER_IP,
  name: server_name
};

// start discord client
initializeCommands(MC_SERVER_INFO);
initializeListener(MC_SERVER_INFO);
startClient();
// start minecraft server manager
const MCSERVER = startServerManager(io, parseEvent, MC_SERVER_INFO);

// whenever the "/" endpoint appears, allow server to serve all files in the site_map folder
app.use("/", express.static("site_map"));

/**
 * grabs ip
 */
async function getIp() {
  try {
    const response = await fetch("https://api.ipify.org?format=json");
    const data = await response.json();
    console.log(`Your IP Address: ${data.ip}`);
    SERVER_IP = data.ip;
    MC_SERVER_INFO.ip = `${data.ip}:${mc_server_port}`;
  } catch (error) {
    console.error("Error fetching IP address:", error);
    return "ERROR SERVER IP NOT AVAILABLE";
  }
}

/**
 * sets up the socket.io connection endpoints
 * all events are related to whatever the client requests
 */
io.on("connection", (socket) => {
  /**
   * when the client requests the server status, respond
   */
  socket.on("status", () => {
    socket.emit("status", MC_SERVER_INFO);
  });

  /**
   * runs when the client requests to start the server
   * @param data the name of the server we wish to start
   */
  socket.on("start_server", () => {
    if (MC_SERVER_INFO.status === "off") {
      console.log("STARTING");
      MC_SERVER_INFO.status = "idle";
      startServer();
    }
    // update all clients of the change
    io.emit("status", MC_SERVER_INFO);
  });

  /**
   * runs when the client requests to stop the server
   * @param data the name of the server we wish to stop
   */
  socket.on("stop_server", () => {
    if (MC_SERVER_INFO.status === "on") {
      console.log("STOPPING");
      MC_SERVER_INFO.status = "turning_off";
      stopServer();
    }
    // update all clients of the change
    io.emit("status", MC_SERVER_INFO);
  });
});

// startup
getIp();
server.listen(PORT);
console.log("Server started on", SERVER_IP);
console.log("Server started on", `http://localhost:${PORT}`);

// on close
process.on("SIGINT", () => {
  MCSERVER.stdin.write("stop");
  process.exit(0);
});
