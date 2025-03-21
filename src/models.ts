import { z } from 'zod';
import { Env } from './environment';
export const GameId = z.literal(Env.GAME_ID);
export type GameId = z.infer<typeof GameId>;
export const PlayerId = z.string();
export type PlayerId = z.infer<typeof PlayerId>;
export const MatchId = z.string();
export type MatchId = z.infer<typeof MatchId>;
export const TournamentId = z.string();
export type TournamentId = z.infer<typeof TournamentId>;
export const AuthTokenPayload = z.object({
    gameId: GameId,
});
export type AuthTokenPayload = z.infer<typeof AuthTokenPayload>;
export const TeamScore = z.object({
    players: PlayerId.array(),
    scores: z.number().array(),
});
export type TeamScore = z.infer<typeof TeamScore>;
export const GameEndedEvent = z.object({
    matchId: MatchId,
    tournamentId: z.string().optional(),
    winners: z.array(TeamScore),
});
export type GameEndedEvent = z.infer<typeof GameEndedEvent>;
export const GameStartedEvent = z.object({
    matchId: MatchId,
    tournamentId: TournamentId.optional(),
    timestamp: z.coerce.number().int(),
});
export type GameStartedEvent = z.infer<typeof GameStartedEvent>;
export const LinkTokenPayload = z.object({
    gameId: GameId,
    playerId: PlayerId,
    rating: z.coerce.number().optional(),
});
export type LinkTokenPayload = z.infer<typeof LinkTokenPayload>;
export const Team = z.object({
    players: PlayerId.array(),
});
export type Team = z.infer<typeof Team>;
export const StartGamePayload = z.object({
    matchId: MatchId,
    tournamentId: TournamentId.optional(),
    backUrl: z.string().optional(),
    rivals: Team.array(),
});
export type StartGamePayload = z.infer<typeof StartGamePayload>;
export const StartGameEvent = z.object({
    games: StartGamePayload.array(),
});
export type StartGameEvent = z.infer<typeof StartGameEvent>;