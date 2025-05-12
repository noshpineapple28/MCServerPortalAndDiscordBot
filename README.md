# MCServerPortalAndDiscordBot

The most aptly named project on my github, the Minecraft Server Web Portal Interface accompanied by a Discord Bot plugin for your server!

## Building

The `DiscordMessageApi` is a plugin package that can be built and is designed to work on `Spigot` compatible servers. Just generate the package, and place the file inside of your plugins folder for your server.

## Hosting

Inside of your file structure for your server, clone the repository like so:

```
- MCServerFiles
|
-- MCServerPortalAndDiscordBotApi (This is the cloned repo)
  |
  - index.js
  |
  - other files
|
- Server.jar
|
- other files
```
Ensure that your server file is named Server.jar, as this is how the script will be able to run your file.

## Running

```sh
cd ./MCServerPortalAndDiscordBotApi
npm install
node index.js
```

## Accessing the web portal

The web portal is hosted on port `3000` of your ip.
The server is typically located on port `25565`.

## Limitations

- I am working to make this more abstracted, currently, it is hard-coded in many places to work specifically with my program
- Due to a plan I had to allow the web portal to host multiple consoles and potentially even run commands, it has some code bloat
- Server name is strictly Continuum, working to edit that
- You will need to provide a config file of your own with desired token for discord bot, as well as manually approve each discord server you wish to allow the commands for using `register_commands.js`
  - Once I have done a better job abstracting all this, these limitations will be removed
