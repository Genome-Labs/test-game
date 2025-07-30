import {
  Body,
  Controller,
  HttpCode,
  Logger,
  OnModuleInit,
  Post,
  UseGuards,
} from '@nestjs/common';
import { TGameStarted } from '../../external-api/types/game-started.type';
import { AuthGuard } from '../../external-api/guards/auth.guard';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { AuthService } from '../../auth/services/auth.service';
import { TStartGame } from '../../external-api/types/start-game.type';
import { TournamentsService } from '../../tournaments/services/tournaments.service';
import { TTournamentHas } from '../../tournaments/types/tournament/tournamnet.has.type';
import { TGameEnded } from '../../external-api/types/game-ended.type';

const BASE_URL = 'https://dev.api.zerosum.world/external';
const GAME_ID = '9105323d-6b62-42af-87b2-3fd2922bb3f3';

@UseGuards(AuthGuard)
@Controller('test-external')
export class TestController implements OnModuleInit {
  private readonly logger = new Logger(TestController.name);
  private token = undefined;
  private reqOptions = {};

  constructor(
    private readonly httpService: HttpService,
    private readonly authService: AuthService,
    private readonly tournamentService: TournamentsService,
  ) {}

  async onModuleInit(): Promise<void> {
    let tokenData = undefined;

    try {
      tokenData = await this.authService.createExternal({
        gameId: GAME_ID,
      });
    } catch (e) {
      this.logger.error(
        'Could not get token data from external token creation',
      );
    }

    this.logger.log('TestController token data has been created');

    if (tokenData && tokenData.token) {
      this.token = tokenData.token;

      this.reqOptions = {
        headers: { Authorization: `Bearer ${this.token}` },
      };
    }
  }

  @Post('/schedule-load')
  @HttpCode(200)
  async scheduleLoad(@Body() data: TGameStarted) {
    this.logger.log('scheduleLoad was received');

    try {
      this.logger.log('scheduleLoad data: ', data);

      // await lastValueFrom(
      //   this.httpService.post(
      //     `${BASE_URL}/start-game`,
      //     { ...data, timestamp: Date.now() },
      //     this.reqOptions,
      //   ),
      // );

      this.logger.log('scheduleLoad has been processed');
    } catch (e) {
      this.logger.error('Cannot send create match (after scheduleLoad): ', e);
    }
  }

  @Post('/create-matches')
  @HttpCode(200)
  async createMatches(@Body() data: TStartGame) {
    this.logger.log('createMatches was received. Data: ', data);

    let tournamentId = undefined;

    const matches = data?.games ?? [];

    try {
      for (const match of matches) {
        tournamentId = match.tournamentId;

        const preparedStartData: TGameStarted = {
          gameId: match.gameId,
          matchId: match.matchId,
          timestamp: Date.now(),
          tournamentId,
        };

        this.logger.log(
          'Data for start-game was prepared: ',
          preparedStartData,
        );

        await lastValueFrom(
          this.httpService.post(
            `${BASE_URL}/start-game`,
            preparedStartData,
            this.reqOptions,
          ),
        );

        this.logger.log('start-game was sent');

        const tournamentWrapper = await lastValueFrom(
          this.tournamentService.get({
            id: tournamentId,
          }),
        );

        const tournament = (tournamentWrapper as TTournamentHas).tournament;

        const startTimeoutDelta = Date.now() - tournament.starts;
        const startTimeout =
          startTimeoutDelta > 0 ? startTimeoutDelta + 5000 : 1000;

        this.logger.log(`Tournament was obtained - timeout is ${startTimeout}`);

        setTimeout(() => {
          const preparedEndData: TGameEnded = {
            gameId: match.gameId,
            matchId: match.matchId,
            tournamentId: match.tournamentId,
            winners: {
              0: {
                players: match.rivals[0].players,
                scores: [],
              },
            },
          };

          this.logger.log('end-game prepared to send');

          lastValueFrom(
            this.httpService.post(
              `${BASE_URL}/end-game`,
              preparedEndData,
              this.reqOptions,
            ),
          )
            .then(() => this.logger.log('end-game has been successfully sent'))
            .catch((e) =>
              this.logger.error('end-game was not sent. Error: ', e),
            );
        }, startTimeout);
      }

      this.logger.log('createMatches has been processed');

      return { tournamentId: tournamentId };
    } catch (e) {
      this.logger.error('Cannot send create matches (createMatches): ', e);
    }
  }
}
