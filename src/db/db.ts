export enum DBEntities {
  Users = 'users',
  Rooms = 'rooms',
  Games = 'games',
  Ships = 'ships',

}

export type Database = {
  [DBEntities.Users]: Users[];
  [DBEntities.Rooms]: Rooms[];
  [DBEntities.Games]: Games[];
  [DBEntities.Ships]: Ships[];
}

export type Users = {
  index: number;
  name: string;
  password: string;
}

export type Rooms = {}

export type Games = {}

export type Ships = {}

export const DB: Database = {
  [DBEntities.Users]: [],
  [DBEntities.Rooms]: [],
  [DBEntities.Games]: [],
  [DBEntities.Ships]: [],
};
