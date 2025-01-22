# How to BattleLingo

## How to run the app

First, 'npm install'
Then open two separate terminals, and 'npm run dev' in the first, and 'npm start' in the second.
Then open http://localhost:5173

## Initial setup

- A bash console (on Mac or Linux, this is Terminal. On Windows, we recommend Git Bash)
- NodeJS version 18. If it is installed correctly, typing "node --version" should give v18.13.0 and "npm --version" should give 8.19.3, or higher.
- Visual Studio Code (or another code editor)
- the Prettier VSCode extension

Also, all of you will need to go through the MongoDB Atlas setup (https://bit.ly/mongo-setup).

Additionally for authentication, one of you will need to obtain a CLIENT_ID, instructions are at https://bit.ly/gauth-mit.

Remember to create your .env file with Database SRV (mongoConnectionURL) and session secret (sessionSecret).

## Mongoose schema documentation

- user: {name: String, googleid: String, elo: Number, log: [{Result: String,Opponent: String, Language: String, Date: String}]}
- word: {language: String, word: String, english: String, difficulty: Number 1-4}

## API endpoint documentation

- "/whoami" returns the current user, or null if not logged in
- "/word" returns a random word to translate
- "/startGame" starts a new game
- add more as needed

## Socket documentation

- Socketing logic is in server-socket.js, client-socket.js
- Client emits to server: start game button push
- Client emits to server: takeCard(lobby, card, player)
- Server emits to client: gameState

## Edit at your own risk

the following files students do not need to edit. feel free to read them if you would like.

```
client/src/utilities.js
client/src/client-socket.js
server/validator.js
server/server-socket.js
.npmrc
.prettierrc
package-lock.json
vite.config.js
```

## Good luck on your project :)
