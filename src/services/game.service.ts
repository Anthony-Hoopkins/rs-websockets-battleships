import { DB, DBEntities, Game, getDatabaseEntity, PlayerShips } from '../db/db';
import { AddShipsDto, AttackDto, AttackRespDto, AttackStatus, Coords } from './dto/game.dto';
import * as fs from 'fs';

const GAMES: Game[] = getDatabaseEntity(DBEntities.Games) as Game[];

// const SHIPS: PlayerShips[] = getDatabaseEntity(DBEntities.Ships) as PlayerShips[];

export class GameService {

  createNewGame(userIndex: string) {
    const idGame = crypto.randomUUID();
    const newGame: Game = { idGame, idPlayer: userIndex, playerShips: [], status: 'created' };
    GAMES.push(newGame);

    return newGame;
  }

  addShipsToGame(data: AddShipsDto): boolean {
    const game = GAMES.find((game) => game.idGame === data.gameId);
    const isTwoPlayersShipsAlreadyDone = game?.playerShips?.length > 0;
    game?.playerShips.push(data);

    return isTwoPlayersShipsAlreadyDone;
  }

  startNewGame(gameId: string): any {
    const game: Game = GAMES.find((game) => game.idGame === gameId);

    if (game?.status) {
      game.status = 'going';
    }

    fs.writeFileSync('/Users/anthonies_mac/projects/BACKENDS/RSnode/rs-websockets-battleships/src/accets/db.json', JSON.stringify(DB)); // todo for debug purposes
    return game;
  }

  attack(attack: AttackDto, isRandom: boolean): AttackRespDto {
    console.log(attack);
    const attackPosition = isRandom ? this.getRandomCoords() : { x: attack.x, y: attack.y };
    const game = this.getGameById(attack.gameId);

    const attackResp = {
      position: attackPosition,
      currentPlayer: attack.indexPlayer, /* id of the player in the current game session */
      status: checkAttackStatus(attack, game),
    };

    if (attackResp.status === 'miss') {
      game.turnId = this.getOtherPlayerIdFromAttackDto(attack);
    } else {
      game.turnId = attack.indexPlayer;
    }

    return attackResp;
  }

  setTurnToGame(gameId: string, turnId: string): void {
    const game = this.getGameById(gameId);
    game.turnId = turnId;
  }

  getGameById(gameId: string): Game {
    return GAMES.find((game) => game.idGame === gameId);
  }

  // randomAttack(data: RandomAttackDto) {
  //   return {
  //     position: this.getRandomCoords(),
  //     currentPlayer: data.indexPlayer, /* id of the player in the current game session */
  //     status: 'miss',
  //   };
  // }

  getOtherPlayerIdFromAttackDto(attack: AttackDto): string {
    const game = GAMES.find((game) => game.idGame === attack.gameId);

    return game?.playerShips?.find((ship) => ship.indexPlayer !== attack.indexPlayer)?.indexPlayer;
  }

  // turn(currentPlayer: number): TurnDto {
  //   return { currentPlayer };
  // }

  private getRandomCoords(): Coords {
    return {
      x: Math.floor(Math.random() * 10),
      y: Math.floor(Math.random() * 10),
    };
  }

  findGameByUserId(userId: string): string {
    return GAMES.find((game: Game) => {
      return game.playerShips.find((ship: PlayerShips) => ship.indexPlayer === userId);
    })?.idGame;
  }
}

function checkAttackStatus(attack: AttackDto, game: Game): AttackStatus {
  const ships = game.playerShips.find((ship) => ship.indexPlayer === attack.indexPlayer);
  return 'miss';
}
