import { config } from 'dotenv';
import { z } from 'zod';
config();
export const Env = z
    .object({
        GAME_API_URL: z.string().url(),
        GAME_API_PATH: z.string(),
        PLATFORM_URL: z.string().url(),
        GAME_ID: z.string(),
        GAME_SECRET: z.string(),
    })
    .parse(process.env);