import { DBEntities, Game, getDatabaseEntity, PlayerShips } from '../db/db';
import { AddShipsDto, AttackDto, AttackRespDto, AttackStatus, Coords, RandomAttackDto } from './dto/game.dto';
import { GameShipsModel, ShipMatrixItem } from '../db/models/game-ships.model';

const GAMES: Game[] = getDatabaseEntity(DBEntities.Games) as Game[];

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
      game.models = [];

      game.playerShips.forEach((plShips: PlayerShips) => {
        game.models.push(new GameShipsModel(plShips));
      });
    }

    // fs.writeFileSync('/Users/anthonies_mac/projects/BACKENDS/RSnode/rs-websockets-battleships/src/accets/db.json', JSON.stringify(DB)); // for debug purposes
    return game;
  }

  attack(attack: AttackDto, isRandom: boolean, defenderId: string): AttackRespDto {
    const attackPosition = isRandom ? this.getRandomCoords() : { x: attack.x, y: attack.y };

    if (isRandom) {
      attack.x = attackPosition.x;
      attack.y = attackPosition.y;
    }

    const game = this.getGameById(attack.gameId);
    const status = this.checkAttackStatus(attack, game, defenderId);

    // const attackResp = { position: attackPosition, currentPlayer: defenderId, status };
    const attackResp = { position: attackPosition, currentPlayer: attack.indexPlayer, status };

    if (attackResp.status === 'miss') {
      game.turnId = defenderId;
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

  getOtherPlayerIdFromAttackDto(attack: AttackDto | RandomAttackDto): string {
    const game = GAMES.find((game) => game.idGame === attack.gameId);

    return game?.playerShips?.find((ship) => ship.indexPlayer !== attack.indexPlayer)?.indexPlayer;
  }

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

  checkAttackStatus(attack: AttackDto, game: Game, defenderId: string): AttackStatus {
    const boardModel: GameShipsModel = game.models.find((model) => model.indexPlayer === defenderId);
    const attackedItem: ShipMatrixItem = boardModel.shipsMatrix['' + attack.x + attack.y];

    attackedItem.status = 'shot';

    if (attackedItem.length > 0) {
      if (attackedItem.length === 1) {
        boardModel.aliveShips = boardModel.aliveShips - 1;

        return 'killed';
      } else {
        const status = this.isShipKilled(attackedItem, boardModel) ? 'killed' : 'shot';

        if (status === 'killed') {
          this.markWholeShipAsKilled(attackedItem, boardModel);
        }

        return status;
      }
    } else {
      return 'miss';
    }
  }

  private isShipKilled(attackedItem: ShipMatrixItem, boardModel: GameShipsModel): boolean {
    return !attackedItem.all.find((item: string) => {
      return boardModel.shipsMatrix[item].status === 'no';
    });
  }

  private markWholeShipAsKilled(attackedItem: ShipMatrixItem, boardModel: GameShipsModel): void {
    attackedItem.all.forEach((item: string) => {
      boardModel.shipsMatrix[item].status = 'killed';
    });

    boardModel.aliveShips = boardModel.aliveShips - 1;

    console.log('boardModel.aliveShips');
    console.log(boardModel.aliveShips);
  }

  checkIfGameCompleted(indexPlayer: string, game: Game): boolean {
    const model = game.models.find((model) => model.indexPlayer === indexPlayer);
    console.log(model?.aliveShips);

    return model?.aliveShips === 0;
  }

  getFieldsAround(position: Coords, game: Game, indexPlayer: string): { missed: Coords[], killed: Coords[] } {
    const model = game.models.find((model) => model.indexPlayer === indexPlayer);

    const shipsMatrix = model.shipsMatrix['' + position.x + position.y];
    console.log('shipsMatrix');
    console.log(shipsMatrix);

    const wholeShip = model.shipsMatrix['' + position.x + position.y]?.all || ['' + position.x + position.y];
    console.log('wholeShip');
    console.log(wholeShip);

    if (wholeShip) {
      const missed: Coords[] = [];
      const killed: Coords[] = [];

      wholeShip.forEach((item) => {
        const x = item[0];
        const y = item[1];

        killed.push({ x: Number(x), y: Number(y) })

        this.addFieldsAround(x, y, 1, 1, missed, wholeShip);
        this.addFieldsAround(x, y, 1, 0, missed, wholeShip);
        this.addFieldsAround(x, y, 1, -1, missed, wholeShip);

        this.addFieldsAround(x, y, 0, 1, missed, wholeShip);
        this.addFieldsAround(x, y, 0, -1, missed, wholeShip);

        this.addFieldsAround(x, y, -1, -1, missed, wholeShip);
        this.addFieldsAround(x, y, -1, 0, missed, wholeShip);
        this.addFieldsAround(x, y, -1, 1, missed, wholeShip);
      });

      return { missed, killed };
    }
  }

  private addFieldsAround(x: string, y: string, numberX: number, numberY: number, result: any[], wholeShip: string[]): void {
    let otherPosition = { x: Number(x) + numberX, y: Number(y) + numberY };

    if (!wholeShip.includes('' + otherPosition.x + otherPosition.y)) {
      result.push(otherPosition)
    }
  }
}
