# RSSchool NodeJS websocket task template

Assignment: Websocket battleship server

Link to the task:
https://github.com/AlreadyBored/nodejs-assignments/blob/main/assignments/battleship/assignment.md

Deadline date: 2024-02-27


Basic Scope
Websocket
+6 Implemented workable websocket server
+6 Handle websocket clients connection/disconnection properly
+10 Websocket server message handler implemented properly
+10 Websocket server message sender implemented properly
User
+5 Create user with password in temprorary database
+5 User validation
Room
+6 Create game room
+6 Add user to game room
+6 Start game
+6 Finish game
+8 Update room's game state
+4 Update player's turn
+8 Update players winner table
Ships
+10 Locate ship to the game board
Game
+8 Attack
+4 Random attack

Advanced Scope
+30 Task implemented on Typescript
+20 Codebase is separated (at least 4 modules)
+30 Make bot for single play (optionally)


Total: 188/188

#### Use: Node.js v20.11.0 LTS

> Static http server and base task packages. 
> By default WebSocket client tries to connect to the 3000 port.

## Installation
1. Clone/download repo
2. `npm install`

## Usage
**Development**

`npm run start:dev`

* App served @ `http://localhost:8181` with nodemon

**Production**

`npm run start`

* App served @ `http://localhost:8181` without nodemon

---

**All commands**

Command Description
--- | ---

`npm run start:dev` | App served @ `http://localhost:8181` with nodemon

`npm run start` | App served @ `http://localhost:8181` without nodemon
