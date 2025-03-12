import { io } from 'socket.io-client';
import { signPayload } from './auth';
import { Env } from './environment';
import { AuthTokenPayload, StartGameEvent, GameStartedEvent, GameEndedEvent } from './models';
import { setTimeout as sleep} from 'node:timers/promises';

async function main() {
    console.log(`Starting Game Stub`);
    const client = io(Env.GAME_API_URL, {
        // transports: ['websocket'],
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
        // ScheduleLoad = {
        //     id: string;
        //     playersInTeamCount: number;
        //     maxTeams: number;
        //     minTeamsInMatch: number;
        //     maxTeamsInMatch: number;
        //     maxMatches: number;
        //     gameId: string;
        //     starts: number;
        //   };
        console.log('schedule load', payload);
    })

    client.on('startGame', async (payload: unknown) => {
        const parsedPayload = StartGameEvent.parse(payload);
        console.log('start game', parsedPayload.games);
        await Promise.all(
            parsedPayload.games.map(async (game) => {
                // Dummy 1s wait for emulate game starting mechanics
                await sleep(1000);
                // Notify ZeroSum API about started game
                await client.emit(
                    'gameStarted',
                    GameStartedEvent.parse({
                        matchId: game.matchId,
                        tournamentId: game.tournamentId,
                        timestamp: Math.floor(Date.now() / 1000)
                    } satisfies GameStartedEvent),
                );
                // Dummy 1s wait for emulate game finishing mechanics
                await sleep(1000);
                // Construct random array of winners
                const winners = game.rivals.map(({ players }) => ({
                    players,
                    scores: players.map(() => Math.floor(Math.random() * 10000)),
                }));
                // Sort winners accordingly random scores
                winners.sort(
                    (a, b) =>
                        b.scores.reduce((total, next) => total + next) -
                        a.scores.reduce((total, next) => total + next),
                );
                // Notify ZeroSum API about game ended
                await client.emit(
                    'gameEnded',
                    GameEndedEvent.parse({
                        winners,
                        matchId: game.matchId,
                    } satisfies GameEndedEvent),
                );
            }),
        );
    });
    client.on('disconnect', (reason) => {
        console.log(`Disconnected with reason: ${reason}`);
    });
}
main();