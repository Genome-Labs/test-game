import jwt from 'jsonwebtoken';
import { Env } from './environment';
import { LinkTokenPayload } from './models';
export const signPayload = <T extends {}>(payload: T) => {
    return jwt.sign(payload, Env.GAME_SECRET, { algorithm: 'HS256' });
};

export const userTokenUrl = (userId: string) : string => {
    const payload = LinkTokenPayload.parse({
        gameId: Env.GAME_ID,
        playerId: userId
    } satisfies LinkTokenPayload)
    const token = signPayload(payload)
    return `${Env.PLATFORM_URL}/?token=${token}`
}

if(process.argv.length > 2) {
    for(let i = 2; i < process.argv.length; i++) {
        console.log(userTokenUrl(process.argv[i]))
    }
}

jwt.sign({
    gameId: GAME_ID,
    playerId: userId
}, GAME_SECRET, { algorithm: 'HS256' });