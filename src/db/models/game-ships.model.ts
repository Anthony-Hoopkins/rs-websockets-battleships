import { PlayerShips, Ship } from '../db';
import { AttackStatus } from '../../services/dto/game.dto';

export type ShipMatrixItem = {
  length: number,
  all: string[] | null,
  status: AttackStatus,
}

export class GameShipsModel {
  gameId: string;
  indexPlayer: string;
  shipsMatrix: { [key: string]: ShipMatrixItem } = {};
  aliveShips: number;

  constructor(
    playerShips: PlayerShips,
  ) {
    this.gameId = playerShips.gameId;
    this.indexPlayer = playerShips.indexPlayer;

    this.makeShipsMatrix(playerShips.ships);
  }

  private makeShipsMatrix(ships: Ship[]): void {
    this.aliveShips = ships.length;

    ships.forEach((ship: Ship) => {
      const length = ship.length;
      const coord = '' + ship.position.x + ship.position.y;

      if (length < 2) {
        this.setValueToMatrix(coord, { length, all: null, status: 'no' });
      } else {
        const all = this.getRelativesCoords(ship);

        all.forEach((coord: string) => {
          this.setValueToMatrix(coord, { length, all: all, status: 'no' });
        });
      }
    });

    for (let x = 0; x < 10; x++) {
      for (let y = 0; y < 10; y++) {
        const coord = '' + x + y;

        if (!this.shipsMatrix[coord]) {
          this.shipsMatrix[coord] = { length: 0, all: null, status: 'no' };
        }
      }
    }
  }

  getRelativesCoords(ship: Ship): string[] {
    let coords = ['' + ship.position.x + ship.position.y];

    for (let i = 1; i < ship.length; i++) {
      if (ship.direction) {
        coords.push('' + ship.position.x + (ship.position.y + i));
      } else {
        coords.push('' + (ship.position.x + i) + ship.position.y);
      }
    }

    return coords;
  }

  private setValueToMatrix(coord: string, data: { all: string[] | null; length: number; status: AttackStatus }) {
    this.shipsMatrix[coord] = data;
  }
}
