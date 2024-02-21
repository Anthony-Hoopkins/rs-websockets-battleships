export type StartedGameDto = {
  ships: ShipDto[];
  currentPlayerIndex: number,
  gameId?: string;
}

export type AddShipsDto = {
  gameId: string,
  ships: ShipDto[];
  indexPlayer: number, /* id of the player in the current game session */
}

export type ShipDto = {
  position: Coords,
  direction: boolean,
  length: number,
  type: 'small' | 'medium' | 'large' | 'huge',
}

export type AttackDto = {
  gameId: string,
  x: number,
  y: number,
  indexPlayer: number, /* id of the player in the current game session */
}

export type RandomAttackDto = {
  gameId: number,
  indexPlayer: number, /* id of the player in the current game session */
}

export type AttackRespDto = {
  position: Coords,
  currentPlayer: number, /* id of the player in the current game session */
  status: AttackStatus,
}

export type Coords = {
  x: number,
  y: number,
}

export type TurnDto = {
  currentPlayer: number, /* id of the player in the current game session */
}

export type FinishDto = {
  winPlayer: number, /* id of the player in the current game session */
}

export type AttackStatus = 'miss' | 'killed' | 'shot';
