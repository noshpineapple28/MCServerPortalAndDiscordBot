// SERVER
const { spawn } = require("node:child_process");
// this is a function pointer
let parseEvent;
// the minecraft server console
const MCSERVER = spawn(`cmd`, [`/k "cd ../"`], {
  shell: true,
});
// server states
let SERVERS;
// pointer to the io server
let io;

/**
 * stderr and stdexit hopefully will never print
 */
MCSERVER.stderr.on("data", (data) => {
  console.log(`ERROR ${data}`);
  io.emit("console_error", data.toString());
});
MCSERVER.on("exit", (code) => {
  console.log(`Process ended with ${code}`);
  io.emit("console_exit", data.toString());
});

/**
 * stdout handlers
 * reads from the console output and handles what to do from there
 */
MCSERVER.stdout.on("data", (data) => {
  const STR = data.toString();

  // turn off server event
  if (STR.includes("DISCORDCONTINUUM;Ended!")) {
    io.emit("console_exit", "Server Closed");
    // alert users that the server turned off
    SERVERS["Continuum"].status = "off";
    io.emit("status", SERVERS);
  }
  // if the message contains DISCORDCONTINUUM then its a plugin event
  else if (STR.includes("DISCORDCONTINUUM;")) {
    parseEvent(STR);
  }
  // if this appears then we can discern that the server has begun startup
  else if (STR.includes("java -Xmx")) {
    io.emit("console_message", "Server beginning startup...");
  }
  // server start
  else if (STR.includes("Enabling DiscordMessageApi")) {
    io.emit("console_message", STR);
    io.emit("console_server_start", "67.20.244.249:25565");
    // alert users that the server has properly turned on
    SERVERS["Continuum"].status = "on";
    io.emit("status", SERVERS);
  }
  // server pause, turn it off
  else if (STR.includes("Server empty for 60 seconds, pausing")) {
    io.emit("console_message", STR);
    io.emit("console_exit", "Nobody online, turning off");
    SERVERS["Continuum"].status = "turning_off";
    io.emit("status", SERVERS);
    MCSERVER.stdin.write("stop\n");
  }
  // start of command prompt
  else if (STR.includes(`C:\\Users\\manou\\OneDrive\\Documents\\mcserver>`)) {
  } else {
    io.emit("console_message", data.toString());
  }
});

/**
 * enables and initializes all the necessary interactions
 *      needed to start the server and io/bot connections
 * @param {IOType} socketIOConnection the socket IO server
 * @param {function} discordHandler a function to call whenever a discord event occurs
 */
function startServerManager(socketIOConnection, discordHandler, serverData) {
  io = socketIOConnection;
  parseEvent = discordHandler;
  SERVERS = serverData;
  return MCSERVER;
}

// exports
module.exports = { startServerManager };