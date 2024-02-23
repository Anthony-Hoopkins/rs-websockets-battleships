import { GameShipsModel } from './models/game-ships.model';

export enum DBEntities {
  Users = 'users',
  Rooms = 'rooms',
  Games = 'games',
  Ships = 'ships',
  Winners = 'winners',
}

export type Database = {
  [DBEntities.Users]: User[];
  [DBEntities.Rooms]: Room[];
  [DBEntities.Games]: Game[];
  [DBEntities.Ships]: PlayerShips[];
  [DBEntities.Winners]: Winner[];
}

export type DBEntity = User[] | Room[] | Game[] | PlayerShips[] | Winner[];

export type User = {
  index: string,
  name: string,
  password?: string,
}

export type Room = {
  roomId: string,
  roomUsers: User[],
}

export type Game = {
  idGame: string,
  playerShips?: PlayerShips[],
  idPlayer: string,
  status: 'created' | 'going' | 'finished'
  turnId?: string,
  models?: GameShipsModel[],
}

export type PlayerShips = {
  gameId: string,
  ships: Ship[],
  indexPlayer: string,
}

export type Ship = {
  position: {
    x: number, // column
    y: number, // row
  },
  direction: boolean, // false - horizontal  & true - vertical
  length: number,
  type: 'small' | 'medium' | 'large' | 'huge',
}

export type Winner = {
  name: string,
  wins: number,
}

export const DB: Database = { // todo remove export
  [DBEntities.Users]: [],
  [DBEntities.Rooms]: [],
  [DBEntities.Games]: [],
  [DBEntities.Ships]: [],
  [DBEntities.Winners]: [],
};

export const getDatabaseEntity = (entity?: DBEntities): DBEntity => {
  return DB[entity];
};








/*function setFakeDataToDb(DB: Database) {
  const winners = [{ name: 'Oleg', wins: 3 }, { name: 'Seriy', wins: 15 }];

  DB[DBEntities.Winners].push(...winners);
}*/

/*
export const DB: Database = {
  'users': [
    {
      'name': '345634',
      'password': '3453456',
      'index': 'fdd082e7-8d2b-45ca-aea2-a00a2a2c0d16',
    },
    {
      'name': '43563456',
      'password': '34563456',
      'index': '7bfae7e0-7d1a-4e85-856b-a46689df9eef',
    }
  ],
  'rooms': [
    {
      'roomId': 'f3c9476d-1b43-4118-a87e-7e3367ea7980',
      'roomUsers': [
        {
          'name': '345634',
          'password': '3453456',
          'index': 'fdd082e7-8d2b-45ca-aea2-a00a2a2c0d16',
        },
      ],
    },
  ],
  'games': [],
  'ships': [],
  'winners': [
    {
      'name': 'Oleg',
      'wins': 3,
    },
    {
      'name': 'Seriy',
      'wins': 15,
    },
    {
      'name': 'Slag',
      'wins': 7,
    }
  ],
};
*/
