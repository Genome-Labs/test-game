# Stub game 

## Overall
Aka game for testing & demonstarating Genome's external game API integration.

## Configuration
You'll need to obtain game id and secret from the Genome team. The game will be added to genome system. You'll have to add this variables to .env file togeteher with wss API endpoint and link to the Genome platform itself. Example variables are

Links are:
```bash
# dev stage
GAME_API_URL=wss://dev.api.zerosum.world
PLATFORM_URL=https://dev.genomeprotocol.com
POST_API_URL=https://dev.api.zerosum.world/external

#test stage
GAME_API_URL=ws://test.api.zerosum.world:8010
PLATFORM_URL=https://test.genomeprotocol.com
POST_API_URL=https://test.api.zerosum.world/external

GAME_API_PATH=/3010

GAME_ID=<take it from genome team>
GAME_SECRET=<take it from genome team>
```

## Usage
For stub game script you have two options

1. Generating user tokens 
`npx ts-node src/auth.ts login1 login2 login3`
Output is 
```
https://dev.genomeprotocol.com/?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJnYW1lSWQiOiI5MTA1MzIzZC02YjYyLTQyYWYtODdiMi0zZmQyOTIyYmIzZjIiLCJwbGF5ZXJJZCI6ImxvZ2luMSIsImlhdCI6MTc0MjgyNDg0OH0.iMWQKwm8f_ygf6C47ZE9-T8YZFjvc4m-lX0RsRRMiYQ
https://dev.genomeprotocol.com/?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJnYW1lSWQiOiI5MTA1MzIzZC02YjYyLTQyYWYtODdiMi0zZmQyOTIyYmIzZjIiLCJwbGF5ZXJJZCI6ImxvZ2luMiIsImlhdCI6MTc0MjgyNDg0OH0.JBXmk1seUwDUaKnv_4UerWXpvvwdMfMP31MS_PoGHuk
https://dev.genomeprotocol.com/?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJnYW1lSWQiOiI5MTA1MzIzZC02YjYyLTQyYWYtODdiMi0zZmQyOTIyYmIzZjIiLCJwbGF5ZXJJZCI6ImxvZ2luMyIsImlhdCI6MTc0MjgyNDg0OH0.QW0i0--1HX2CHUxuAaFhnTlsg9er7beGmq48BFxfkqQ
```

2. Running the script for game emulating
`npm run dev`
Correct output (meaning you have correct endpoint and key/id pair)
```
Starting Game Stub
Connected to Game API
```
And here come the dragons...

## System description
### User linkage
All game interactions are done via single wss connection. The only other point outside is user linkage which should be done in semi-OAuth way. The only point required by genome - user should be redirected to `PLATFORM_URL?token=generated_token`, where token is calculated like

```js
jwt.sign({
    gameId: GAME_ID,
    playerId: userId,
    username: username, //optional
    nickname: username  //optional, acts the same as username
}, GAME_SECRET, { algorithm: 'HS256' });
```

### WSS interactions
You have to connect to GAME_API_URL with  auth token like this
```js
jwt.encode({"gameId": GAME_ID}, GAME_SECRET, algorithm="HS256")
```

1. Tournament Created
After tournament is created game will get a `scheduleLoad` event
With details
```ts
    {
        playersInTeamCount: number;
        maxTeams: number;
        minTeamsInMatch: number;
        maxTeamsInMatch: number;
        maxMatches: number;
        gameId: string;
        starts: number;
    }

```

2. Game should be started
When game should be started - game will get a `startGame` event for each match

```ts
  gameId: string;
  games: {
    gameId: string;
    matchId: string;
    tournamentId?: string;
    gameServerId?: string;    
    backUrl: string;
    rivals: {
      players: string[];
    }[];
  }[];

```
3. `gameStarted` - when game is actually started (each match in the tournament)

```ts
{
  gameId: string;
  matchId: string;
  tournamentId?: string;
  gameServerId?: string;
  timestamp: number;
}
```

4. `gameEnded` - game is actually ended (each match in the tournament)

```ts
{
  gameId: string;
  matchId: string;
  tournamentId?: string;
  gameServerId?: string;
  winners: {
    [index: number]: {
      players: string[];
      scores: number[];
    };
  };
}

```
5. `gameCancelled` - something's went wrong  (each match in the tournament)

```ts
{
  gameId: string;
  matchId: string;
  tournamentId?: string;
  gameServerId?: string;
}

### POST interactions

Pretty close to WSS interactions, except all data exchange is done via POST HTTP requests. All requests should be done / checked with Bearer Authorization header, token should be generated the same way like WSS interactions. Data types sent are the same as for WSS interactions.


'schedule-load' and 'start-game' requests are sent by Genome to game. Also, game base url should be given to Genome team.

'game-started', 'game-ended' and 'game-cancelled' should be sent from game to Genome with the POST_API_URL as a base url for requests


[Usage example for nest.js ](test.controller.ts)

