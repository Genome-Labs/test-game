import { io } from 'socket.io-client';
import { signPayload } from './auth';
import { Env } from './environment';
import { AuthTokenPayload, StartGameEvent, StartGamePayload, GameStartedEvent, GameEndedEvent } from './models';
import { setTimeout as sleep} from 'node:timers/promises';

async function main() {
    console.log(`Starting Game Stub`);
    const client = io(Env.GAME_API_URL, {
        path: Env.GAME_API_PATH,
        auth: {
            token: signPayload(AuthTokenPayload.parse({ gameId: Env.GAME_ID })),
        },
    });
    client.on('connect', () => {
        console.log(`Connected to Game API`);
    });

    client.on("connect_error", (error) => {
        if (client.active) {
            console.log(true, error);
            // temporary failure, the socket will automatically try to reconnect
        } else {
            // the connection was denied by the server
            // in that case, `socket.connect()` must be manually called in order to reconnect
            console.log(false, error);
        }
    });

    client.on('scheduleLoad', async (payload: unknown) => {
        console.log('schedule load', new Date(), payload);
    })

    client.on('startGame', async (payload: unknown) => {
        const parsedPayload = StartGameEvent.parse(payload);
        console.log('startGame', new Date(), parsedPayload);
        await Promise.all(
            parsedPayload.games.map(async (game) => {
                // Dummy 1s wait for emulate game starting mechanics
                await sleep(1000);
                const started = GameStartedEvent.parse({
                    matchId: game.matchId,
                    tournamentId: game.tournamentId,
                    timestamp: Math.floor(Date.now() / 1000)
                } satisfies GameStartedEvent);
                console.log('gameStarted', new Date(), started);
                // Notify ZeroSum API about started game
                await client.emit('gameStarted', started);

                // Dummy 1s wait for emulate game finishing mechanics
                await sleep(1000);
                // Construct random array of winners
                const winners = game.rivals.map(({ players }) => ({
                    players,
                    scores: players.map(() => Math.floor(Math.random() * 10000)),
                })).sort(
                // Sort winners accordingly random scores
                (a, b) =>
                        b.scores.reduce((total, next) => total + next) -
                        a.scores.reduce((total, next) => total + next),
                )
                await sleep(1000);
                const ended = GameEndedEvent.parse({
                    winners,
                    matchId: game.matchId,
                    tournamentId: game.tournamentId
                } satisfies GameEndedEvent);
                console.log('gameEnded', new Date(), ended);
                // Notify ZeroSum API about game ended
                await client.emit('gameEnded', ended);
            }),
        );
    });
    client.on('disconnect', (reason) => {
        console.log(`Disconnected with reason: ${reason}`);
    });
}
main();