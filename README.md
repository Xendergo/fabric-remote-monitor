# fabric-remote-monitor

Fabric remote monitor is a toolkit to make setting up and managing a fabric minecraft server as convenient as possible by providing a web interface to do all of the above

It also provides some extra features, like a discord bot, backup management (not built yet), mod management (not built yet), and an info page where you can put custom text (not done yet)

The project is currently in the early phases of development and isn't ready for production use yet.

## Developing

This is a guide to getting fabric remote monitor to run on your computer for development purposes

### Prerequisites

[node.js](https://nodejs.org/en/),
[A Java 16 JDK](https://adoptopenjdk.net/),
A code editor

### Running the web server

```sh
cd server
npm install # Install the server's dependencies
cd svelte
npm install # Install the client's depencencies
cd ..
npm run dev # Executes a shell script that recompiles and restarts the server when server files are changed, and hot reloads the webpage when client files are changed
# Runs as a shell script so it'll require porting to windows if neccesary

# Go to localhost:3000

# To stop the script, press enter (or any other key) instead of ctrl+c, this'll automatically clean up the forked processes
```

### Running the minecraft server

To set up the environment, I'd recommend following this guide for developing fabric mods: https://fabricmc.net/wiki/tutorial:setup

If you run VS code, there's already a launch.json file, so your debugger should work out of the box
