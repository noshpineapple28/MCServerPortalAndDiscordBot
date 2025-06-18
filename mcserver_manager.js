// SERVER
const { spawn } = require("node:child_process");
const { add_viable_option } = require("./gambits/gambit");
const { KillAnEntityGambit } = require("./gambits/KillAnEntityGambit");
// this is a function pointer
let parseEvent;
// the minecraft server console
const MCSERVER = spawn(`powershell`, ["-NoProfile", "-Command", "-"]);
MCSERVER.stdin.write("cd ..\n");
// players
const PLAYERS = [];
// server states
let SERVER;
// pointer to the io server
let io;

/**
 * command to start the mc server
 */
function startServer() {
  MCSERVER.stdin.write("java -Xmx4G -Xms4G -jar server.jar\n");
  SERVER.status = "idle";
  io.emit("status", SERVER);
}

/**
 * command to stop the mc server
 */
function stopServer() {
  MCSERVER.stdin.write("stop\n");
  SERVER.status = "turning_off";
  io.emit("status", SERVER);
}

/**
 * stderr and stdexit hopefully will never print
 */
MCSERVER.stderr.on("data", (data) => {
  console.log(`ERROR ${data}`);
  io.emit("console_error", data.toString());
});
MCSERVER.on("exit", (code) => {
  console.log(`Process ended with ${code}`);
  io.emit("console_exit", code.toString());
});

/**
 * responsible for the send message discord command
 */
function sendMessage(format, text, sender) {
  switch (format) {
    case "chat": {
      MCSERVER.stdin.write(`say <${sender}> ${text}\n`);
      break;
    }
    case "title": {
      MCSERVER.stdin.write(
        `title @a subtitle { "text": "from: ${sender}", "italic": true }\n`
      );
      MCSERVER.stdin.write(`title @a title { "text": "${text}"}\n`);
      break;
    }
  }
}

/**
 * responsible for the whitelist command
 */
function whitelist(username) {
  // add them to the current Gambit if its related
  add_viable_option(new KillAnEntityGambit(), username);
  MCSERVER.stdin.write(`whitelist add ${username}\n`);
}

/**
 * gives a user an item
 * @param {String} user
 * @param {String} item
 * @param {Number} quantity
 */
function giveItem(user, item, quantity) {
  MCSERVER.stdin.write(`give ${user} ${item} ${quantity}\n`);
}

/**
 * summon an entity at a user
 * @param {String} user
 * @param {String} entity
 * @param {Number} quantity
 */
function summonEntity(user, entity, quantity) {
  for (let i = 0; i < quantity; i++)
    MCSERVER.stdin.write(`execute at ${user} run summon ${entity} ~ ~ ~\n`);
}

/**
 * responsible for the whitelist command
 */
function query_players() {
  let total = `A total of ${PLAYERS.length} out of the max 6 are online.`;
  let text = "The following are online: ";
  PLAYERS.forEach((name) => (text += `\`${name}\` `));
  return [total, text];
}

/**
 * check if player is online
 * @param {String} user
 * @returns bool
 */
function check_if_online(user) {
  return PLAYERS.includes(user);
}

/**
 * stdout handlers
 * reads from the console output and handles what to do from there
 */
MCSERVER.stdout.on("data", (data) => {
  const STR = data.toString();
  if (!io) return;

  // turn off server event
  if (STR.includes("DISCORDCONTINUUM;Ended!")) {
    // clear players list just in case it breaks
    PLAYERS.splice(0, PLAYERS.length);
    io.emit("console_exit", "Server Closed");
    // alert users that the server turned off
    SERVER.status = "off";
    io.emit("status", SERVER);
    // sends a discord message
    parseEvent("EVENT;STOP");
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
    // set to ur ip
    io.emit("console_server_start", "67.20.244.249:25565");
    // alert users that the server has properly turned on
    SERVER.status = "on";
    // sends a discord message
    parseEvent("EVENT;START");
    io.emit("status", SERVER);
  }
  // server pause, turn it off
  else if (STR.includes("Server empty for 60 seconds, pausing")) {
    io.emit("console_message", STR);
    io.emit("console_exit", "Nobody online, turning off");
    SERVER.status = "turning_off";
    io.emit("status", SERVER);
    MCSERVER.stdin.write("stop\n");
  } else if (STR.includes(`joined the game`)) {
    let name = STR.split(": ")[1].split(" ")[0];
    PLAYERS.push(name);
  } else if (STR.includes(`left the game`)) {
    let name = STR.split(": ")[1].split(" ")[0];
    let index = PLAYERS.indexOf(name);
    PLAYERS.splice(index, 1);
  } else if (!STR.includes(`:\\`)) {
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
  SERVER = serverData;
  return MCSERVER;
}

// exports
module.exports = {
  startServerManager,
  startServer,
  stopServer,
  sendMessage,
  whitelist,
  query_players,
  giveItem,
  summonEntity,
  check_if_online,
};
