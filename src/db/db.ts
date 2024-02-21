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
  index: number,
  name: string,
  password?: string,
}

export type Room = {
  roomId: number,
  roomUsers: User[],
}

export type Game = {
  idGame: string,
  playerShips?: PlayerShips[],
  idPlayer: number,
  status: 'created' | 'going' | 'finished'
  turnId?: number,
}

export type PlayerShips = {
  gameId: string,
  ships: Ship[],
  indexPlayer: number,
}

export type Ship = {
  position: {
    x: number,
    y: number,
  },
  direction: boolean, // false - vertical & true - horizontal
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
  setFakeDataToDb(DB); // Todo remove it
  return DB[entity];
};


function setFakeDataToDb(DB: Database) {
  const winners = [{ name: 'Oleg', wins: 3 }, { name: 'Seriy', wins: 15 }];

  DB[DBEntities.Winners].push(...winners);
}

// return [
//   { roomId: 1, roomUsers: [{ name: 'Lev', index: 1 }] },
//   { roomId: 2, roomUsers: [{ name: 'Kesha', index: 2 }] },
// ];
//
