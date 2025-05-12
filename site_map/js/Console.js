// DO NOT MODIFY
// the io server sent from the node server. loaded in the html file
const SOCKET = io();
// the animation for ... will generate a key to stop it, saved here
//    if 0, then no animation is playing
let stopKeyServerTitle = 0;
let server_name = "";

/**
 * loads event listeners to the site map, and requests the server status from
 *    the node server
 */
window.onload = () => {
  document
    .querySelector("#ServerTitle")
    .addEventListener("click", () => serverStateChange(server_name));

  // request the stopKeyServerTitle server status
  SOCKET.emit("status");
};

/**
 * Called on click, changes the state of the server
 * @param {String} server the server being interacted with
 */
function serverStateChange(server) {
  const button = document.querySelector(`#ServerTitle`);
  if (button.className === "off") {
    SOCKET.emit("start_server");
  } else if (button.className == "on") {
    // turn off
    SOCKET.emit("stop_server");
  }
}

/**
 * SHOULD ONLY BE CALLED ON LOAD
 *      sets the state of buttons for updating
 * @param {String} server the server name
 * @param {String} status the status of the server
 */
function setServerStatus(server, status, ip) {
  const SERVERBUTTON = document.querySelector(`#ServerTitle`);
  SERVERBUTTON.className = status;

  if ((status === "idle" || status === "starting") && !stopKeyServerTitle) {
    SERVERBUTTON.innerHTML = `Starting ${server} Server`;
    // ... animation
    stopKeyServerTitle = setInterval(() => {
      // add dots
      let text = SERVERBUTTON.innerHTML;
      if (text[text.length - 3] !== ".") SERVERBUTTON.innerHTML += ".";
      else SERVERBUTTON.innerHTML = `Starting ${server} Server`;
    }, 500);
    // send ws command to turn on server
  } else if (status === "turning_off" && !stopKeyServerTitle) {
    SERVERBUTTON.innerHTML = `Turning off ${server} Server`;
    // ... animation
    stopKeyServerTitle = setInterval(() => {
      // add dots
      let text = SERVERBUTTON.innerHTML;
      if (text[text.length - 3] !== ".") SERVERBUTTON.innerHTML += ".";
      else SERVERBUTTON.innerHTML = `Turning off ${server} Server`;
    }, 500);
    // send ws command to turn on server
  } else if (
    status !== "idle" &&
    status !== "starting" &&
    status !== "turning_off"
  ) {
    // if there is an animation going, stop it
    if (stopKeyServerTitle) clearInterval(stopKeyServerTitle);
    stopKeyServerTitle = 0;
    // set the state of the button to say the server is whatever status it changed to
    SERVERBUTTON.innerHTML = `${server} Server ${status}`;
  }

  // update the server ip if it changed
  document.querySelector(`#ServerIp #ip`).innerHTML = ip;
}

/**
 * the status event will update the sites look to reflect the sent server status
 */
SOCKET.on("status", (data) => {
  document.querySelector("#ServerTitle").className = data["status"];
  server_name = data["name"];
  setServerStatus(server_name, data["status"], data["ip"]);
});

/**
 * the console_message event just adds a new row of whatever new update
 *    came from the mcserver
 * @param {string} data the message sent
 */
SOCKET.on("console_message", (data) => {
  // find the console
  const CONSOLE = document.querySelector("#console");
  // create the message wrapper
  const MSG = document.createElement("p");
  // code element to style the text easily
  const MSGTEXT = document.createElement("code");
  // add code element to text
  MSGTEXT.innerHTML = data;
  MSG.appendChild(MSGTEXT);
  // add message to the console
  CONSOLE.appendChild(MSG);
  // update the scrollbar position
  CONSOLE.scrollTo(0, CONSOLE.scrollHeight);
});

/**
 * the error event just adds a new row of whatever new error update
 *    came from the mcserver
 * NOTE: p much all code is the same as console_message with some minor css changes
 * @param {string} data the message sent
 */
SOCKET.on("console_error", (data) => {
  const CONSOLE = document.querySelector("#console");
  const MSG = document.createElement("p");
  const MSGTEXT = document.createElement("code");
  MSGTEXT.className = "error";
  MSG.appendChild(MSGTEXT);
  MSGTEXT.innerHTML = data;
  CONSOLE.appendChild(MSG);
  CONSOLE.scrollTo(0, CONSOLE.scrollHeight);
});

/**
 * the exit event just adds a styled message to the console for when
 *    the server has exited processing the server
 * NOTE: p much all code is the same as console_message with some minor css changes
 * @param {string} data the message sent
 */
SOCKET.on("console_exit", (data) => {
  const CONSOLE = document.querySelector("#console");
  const MSG = document.createElement("p");
  const MSGTEXT = document.createElement("code");
  MSGTEXT.className = "exit";
  MSG.appendChild(MSGTEXT);
  MSGTEXT.innerHTML = data;
  CONSOLE.appendChild(MSG);
  CONSOLE.scrollTo(0, CONSOLE.scrollHeight);
});

/**
 * the console server start event adds a styled message about the server starting
 * NOTE: p much all code is the same as console_message with some minor css changes
 * @param {string} data the message sent
 */
SOCKET.on("console_server_start", (data) => {
  const CONSOLE = document.querySelector("#console");
  const MSG = document.createElement("p");
  const MSGTEXT = document.createElement("code");
  MSG.appendChild(MSGTEXT);
  MSGTEXT.innerHTML = `Server started on: <code class="start">${data}</data>`;
  CONSOLE.appendChild(MSG);
  CONSOLE.scrollTo(0, CONSOLE.scrollHeight);
});
