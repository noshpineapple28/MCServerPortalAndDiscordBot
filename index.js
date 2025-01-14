const express = require("express");
const { startClient, parseEvent } = require("./discord_listener");
const { startServerManager } = require("./mcserver_manager");
const { server_ip } = require("./config.json")
const socketIO = require("socket.io");
const http = require("http");
const app = express();
const PORT = 3000;

// servers
const server = http.createServer(app);
const io = socketIO(server);
// mcserver states
const SERVERS = {
  // name is the same as the websites id for the related console and buttons
  Continuum: {
    status: "off",
    ip: server_ip,
  },
};
// start discord client
startClient();
// start minecraft server manager
const MCSERVER = startServerManager(io, parseEvent, SERVERS);

// whenever the "/" endpoint appears, allow server to serve all files in the site_map folder
app.use("/", express.static("site_map"));

/**
 * sets up the socket.io connection endpoints
 * all events are related to whatever the client requests
 */
io.on("connection", (socket) => {
  /**
   * when the client requests the server status, respond
   */
  socket.on("status", () => {
    socket.emit("status", SERVERS);
  });

  /**
   * runs when the client requests to start the server
   * @param data the name of the server we wish to start
   */
  socket.on("start_server", (data) => {
    let server = SERVERS[data.server];
    if (server.status === "off") {
      console.log("STARTING", data.server);
      server.status = "idle";
      MCSERVER.stdin.write("java -Xmx4G -Xms4G -jar server.jar\n");
    }
    // update all clients of the change
    io.emit("status", SERVERS);
  });

  /**
   * runs when the client requests to stop the server
   * @param data the name of the server we wish to stop
   */
  socket.on("stop_server", (data) => {
    let server = SERVERS[data.server];
    if (server.status === "on") {
      console.log("STOPPING", data.server);
      server.status = "turning_off";
      MCSERVER.stdin.write("stop\n");
    }
    // update all clients of the change
    io.emit("status", SERVERS);
  });
});

// startup
server.listen(PORT);
console.log("Server started on", server_ip);
console.log("Server started on", `http://localhost:${PORT}`);

// on close
process.on("SIGINT", () => {
  MCSERVER.stdin.write("stop");
  process.exit(0);
});
